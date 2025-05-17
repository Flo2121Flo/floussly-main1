import { TransactionService } from '../../services/TransactionService';
import { redis } from '../../db/redis';
import { pg } from '../../db/pg';
import { logger } from '../../utils/logger';

describe('TransactionService', () => {
  let userId: string;
  let transactionId: string;

  beforeEach(async () => {
    // Create test user
    const user = await global.createTestUser();
    userId = user.id;
  });

  describe('createTransaction', () => {
    it('should create a new transaction', async () => {
      const transactionData = {
        amount: 100,
        type: 'TRANSFER',
        description: 'Test transaction'
      };

      const transaction = await TransactionService.createTransaction(
        userId,
        transactionData
      );

      expect(transaction).toMatchObject({
        userId,
        amount: transactionData.amount,
        type: transactionData.type,
        description: transactionData.description,
        status: 'PENDING'
      });

      // Verify database record
      const dbTransaction = await pg.query(
        'SELECT * FROM transactions WHERE id = $1',
        [transaction.id]
      );
      expect(dbTransaction.rows[0]).toMatchObject(transaction);

      // Verify cache
      const cachedTransaction = await redis.get(
        `transaction:${transaction.id}`
      );
      expect(JSON.parse(cachedTransaction)).toMatchObject(transaction);
    });

    it('should validate transaction amount', async () => {
      const transactionData = {
        amount: -100,
        type: 'TRANSFER',
        description: 'Invalid amount'
      };

      await expect(
        TransactionService.createTransaction(userId, transactionData)
      ).rejects.toThrow('Invalid transaction amount');
    });

    it('should handle concurrent transactions', async () => {
      const transactionData = {
        amount: 100,
        type: 'TRANSFER',
        description: 'Concurrent transaction'
      };

      const promises = Array(5).fill(null).map(() =>
        TransactionService.createTransaction(userId, transactionData)
      );

      const transactions = await Promise.all(promises);
      expect(transactions).toHaveLength(5);

      // Verify all transactions are unique
      const ids = transactions.map(t => t.id);
      expect(new Set(ids).size).toBe(5);
    });
  });

  describe('getTransaction', () => {
    beforeEach(async () => {
      const transaction = await global.createTestTransaction(userId);
      transactionId = transaction.id;
    });

    it('should retrieve a transaction from cache', async () => {
      const transaction = await TransactionService.getTransaction(transactionId);
      expect(transaction).toMatchObject({
        id: transactionId,
        userId
      });

      // Verify cache hit
      const cacheKey = `transaction:${transactionId}`;
      expect(await redis.exists(cacheKey)).toBe(1);
    });

    it('should retrieve a transaction from database if not in cache', async () => {
      await redis.del(`transaction:${transactionId}`);

      const transaction = await TransactionService.getTransaction(transactionId);
      expect(transaction).toMatchObject({
        id: transactionId,
        userId
      });

      // Verify cache was updated
      const cacheKey = `transaction:${transactionId}`;
      expect(await redis.exists(cacheKey)).toBe(1);
    });

    it('should return null for non-existent transaction', async () => {
      const transaction = await TransactionService.getTransaction('non-existent-id');
      expect(transaction).toBeNull();
    });
  });

  describe('updateTransactionStatus', () => {
    beforeEach(async () => {
      const transaction = await global.createTestTransaction(userId);
      transactionId = transaction.id;
    });

    it('should update transaction status', async () => {
      const newStatus = 'COMPLETED';
      const transaction = await TransactionService.updateTransactionStatus(
        transactionId,
        newStatus
      );

      expect(transaction).toMatchObject({
        id: transactionId,
        status: newStatus
      });

      // Verify database update
      const dbTransaction = await pg.query(
        'SELECT * FROM transactions WHERE id = $1',
        [transactionId]
      );
      expect(dbTransaction.rows[0].status).toBe(newStatus);

      // Verify cache update
      const cachedTransaction = await redis.get(
        `transaction:${transactionId}`
      );
      expect(JSON.parse(cachedTransaction).status).toBe(newStatus);
    });

    it('should validate transaction status', async () => {
      await expect(
        TransactionService.updateTransactionStatus(transactionId, 'INVALID_STATUS')
      ).rejects.toThrow('Invalid transaction status');
    });

    it('should handle non-existent transaction', async () => {
      await expect(
        TransactionService.updateTransactionStatus('non-existent-id', 'COMPLETED')
      ).rejects.toThrow('Transaction not found');
    });
  });

  describe('getUserTransactions', () => {
    beforeEach(async () => {
      // Create multiple transactions
      await Promise.all([
        global.createTestTransaction(userId, { amount: 100 }),
        global.createTestTransaction(userId, { amount: 200 }),
        global.createTestTransaction(userId, { amount: 300 })
      ]);
    });

    it('should retrieve user transactions with pagination', async () => {
      const { transactions, total } = await TransactionService.getUserTransactions(
        userId,
        { limit: 2, offset: 0 }
      );

      expect(transactions).toHaveLength(2);
      expect(total).toBe(3);
    });

    it('should filter transactions by status', async () => {
      const { transactions } = await TransactionService.getUserTransactions(
        userId,
        { status: 'COMPLETED' }
      );

      expect(transactions.every(t => t.status === 'COMPLETED')).toBe(true);
    });

    it('should sort transactions by date', async () => {
      const { transactions } = await TransactionService.getUserTransactions(
        userId,
        { sortBy: 'createdAt', sortOrder: 'DESC' }
      );

      const dates = transactions.map(t => new Date(t.createdAt).getTime());
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    });
  });

  describe('getTransactionStats', () => {
    beforeEach(async () => {
      // Create transactions with different amounts and types
      await Promise.all([
        global.createTestTransaction(userId, { amount: 100, type: 'TRANSFER' }),
        global.createTestTransaction(userId, { amount: 200, type: 'PAYMENT' }),
        global.createTestTransaction(userId, { amount: 300, type: 'TRANSFER' })
      ]);
    });

    it('should calculate transaction statistics', async () => {
      const stats = await TransactionService.getTransactionStats(userId);

      expect(stats).toMatchObject({
        totalTransactions: 3,
        totalAmount: 600,
        averageAmount: 200,
        byType: {
          TRANSFER: 2,
          PAYMENT: 1
        }
      });
    });

    it('should calculate statistics for date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const stats = await TransactionService.getTransactionStats(userId, {
        startDate,
        endDate: new Date()
      });

      expect(stats.totalTransactions).toBe(3);
    });

    it('should handle user with no transactions', async () => {
      const newUser = await global.createTestUser({
        email: 'new@example.com'
      });

      const stats = await TransactionService.getTransactionStats(newUser.id);

      expect(stats).toMatchObject({
        totalTransactions: 0,
        totalAmount: 0,
        averageAmount: 0,
        byType: {}
      });
    });
  });
}); 