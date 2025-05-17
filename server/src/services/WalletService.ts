import { User } from '../models/User';
import { logger } from '../utils/logger';
import { redis } from '../utils/redis';
import { NotificationService } from './NotificationService';
import { FraudDetectionService } from './FraudDetectionService';
import { validateAmount, validateTransactionRef } from '../utils/validators';
import { encryptSensitiveData } from '../utils/encryption';
import { v4 as uuidv4 } from 'uuid';

interface Transaction {
  id: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  reference: string;
  description?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface TransferRequest {
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  description?: string;
}

export class WalletService {
  private static instance: WalletService;
  private readonly notificationService: NotificationService;
  private readonly fraudDetectionService: FraudDetectionService;
  private readonly SUPPORTED_CURRENCIES = ['MAD', 'USD', 'EUR'];
  private readonly MIN_TRANSACTION_AMOUNT = 10;
  private readonly MAX_TRANSACTION_AMOUNT = 100000;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
    this.fraudDetectionService = FraudDetectionService.getInstance();
  }

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  async getWalletBalance(userId: string): Promise<{ [key: string]: number }> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return user.walletBalances || {};
    } catch (error) {
      logger.error('Failed to get wallet balance', {
        error: error.message,
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async createTransaction(data: {
    userId: string;
    type: Transaction['type'];
    amount: number;
    currency: string;
    description?: string;
    metadata?: any;
  }): Promise<Transaction> {
    try {
      // Validate input
      if (!validateAmount(data.amount)) {
        throw new Error('Invalid amount');
      }
      if (!this.SUPPORTED_CURRENCIES.includes(data.currency)) {
        throw new Error('Unsupported currency');
      }
      if (data.amount < this.MIN_TRANSACTION_AMOUNT) {
        throw new Error(`Minimum transaction amount is ${this.MIN_TRANSACTION_AMOUNT}`);
      }
      if (data.amount > this.MAX_TRANSACTION_AMOUNT) {
        throw new Error(`Maximum transaction amount is ${this.MAX_TRANSACTION_AMOUNT}`);
      }

      const user = await User.findById(data.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user has sufficient balance for withdrawals and transfers
      if (data.type !== 'DEPOSIT') {
        const currentBalance = user.walletBalances?.[data.currency] || 0;
        if (currentBalance < data.amount) {
          throw new Error('Insufficient balance');
        }
      }

      // Generate transaction reference
      const reference = `TRX-${Date.now().toString().slice(0, 8)}-${uuidv4().slice(0, 5).toUpperCase()}`;
      if (!validateTransactionRef(reference)) {
        throw new Error('Invalid transaction reference');
      }

      // Create transaction
      const transaction: Transaction = {
        id: uuidv4(),
        userId: data.userId,
        type: data.type,
        amount: data.amount,
        currency: data.currency,
        status: 'PENDING',
        reference,
        description: data.description,
        metadata: data.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store transaction
      const key = `transaction:${transaction.id}`;
      await redis.setex(
        key,
        24 * 60 * 60, // 24 hours
        JSON.stringify(transaction)
      );

      // Perform fraud check
      const riskAssessment = await this.fraudDetectionService.assessTransactionRisk({
        userId: data.userId,
        amount: data.amount,
        type: data.type,
        currency: data.currency,
        metadata: data.metadata
      });

      if (riskAssessment.riskLevel === 'HIGH') {
        transaction.status = 'FAILED';
        await this.notificationService.sendNotification({
          userId: data.userId,
          type: 'SECURITY',
          title: 'Transaction Blocked',
          message: 'Your transaction was blocked due to suspicious activity',
          channels: ['EMAIL', 'IN_APP']
        });
      } else {
        // Process transaction
        await this.processTransaction(transaction);
      }

      // Update Redis with final status
      await redis.setex(
        key,
        30 * 24 * 60 * 60, // 30 days
        JSON.stringify(transaction)
      );

      // Notify user
      await this.notificationService.sendNotification({
        userId: data.userId,
        type: 'TRANSACTION',
        title: 'Transaction Update',
        message: `Your ${data.type.toLowerCase()} of ${data.amount} ${data.currency} is ${transaction.status.toLowerCase()}`,
        channels: ['EMAIL', 'IN_APP']
      });

      logger.info('Transaction created', {
        transactionId: transaction.id,
        userId: data.userId,
        type: data.type,
        amount: data.amount,
        currency: data.currency,
        status: transaction.status,
        timestamp: new Date().toISOString()
      });

      return transaction;
    } catch (error) {
      logger.error('Transaction creation failed', {
        error: error.message,
        userId: data.userId,
        type: data.type,
        amount: data.amount,
        currency: data.currency,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async transferFunds(data: TransferRequest): Promise<{ fromTransaction: Transaction; toTransaction: Transaction }> {
    try {
      // Validate input
      if (!validateAmount(data.amount)) {
        throw new Error('Invalid amount');
      }
      if (!this.SUPPORTED_CURRENCIES.includes(data.currency)) {
        throw new Error('Unsupported currency');
      }

      // Check if users exist
      const [fromUser, toUser] = await Promise.all([
        User.findById(data.fromUserId),
        User.findById(data.toUserId)
      ]);

      if (!fromUser || !toUser) {
        throw new Error('User not found');
      }

      // Check if sender has sufficient balance
      const currentBalance = fromUser.walletBalances?.[data.currency] || 0;
      if (currentBalance < data.amount) {
        throw new Error('Insufficient balance');
      }

      // Create transactions
      const fromTransaction = await this.createTransaction({
        userId: data.fromUserId,
        type: 'TRANSFER',
        amount: -data.amount,
        currency: data.currency,
        description: `Transfer to ${toUser.name}`,
        metadata: {
          toUserId: data.toUserId,
          transferId: uuidv4()
        }
      });

      const toTransaction = await this.createTransaction({
        userId: data.toUserId,
        type: 'TRANSFER',
        amount: data.amount,
        currency: data.currency,
        description: `Transfer from ${fromUser.name}`,
        metadata: {
          fromUserId: data.fromUserId,
          transferId: fromTransaction.metadata.transferId
        }
      });

      // Notify both users
      await Promise.all([
        this.notificationService.sendNotification({
          userId: data.fromUserId,
          type: 'TRANSACTION',
          title: 'Transfer Sent',
          message: `You sent ${data.amount} ${data.currency} to ${toUser.name}`,
          channels: ['EMAIL', 'IN_APP']
        }),
        this.notificationService.sendNotification({
          userId: data.toUserId,
          type: 'TRANSACTION',
          title: 'Transfer Received',
          message: `You received ${data.amount} ${data.currency} from ${fromUser.name}`,
          channels: ['EMAIL', 'IN_APP']
        })
      ]);

      return { fromTransaction, toTransaction };
    } catch (error) {
      logger.error('Transfer failed', {
        error: error.message,
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        amount: data.amount,
        currency: data.currency,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  private async processTransaction(transaction: Transaction): Promise<void> {
    try {
      const user = await User.findById(transaction.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Initialize wallet balances if not exists
      if (!user.walletBalances) {
        user.walletBalances = {};
      }

      // Update balance
      const currentBalance = user.walletBalances[transaction.currency] || 0;
      user.walletBalances[transaction.currency] = currentBalance + transaction.amount;

      // Update transaction status
      transaction.status = 'COMPLETED';
      transaction.updatedAt = new Date();

      await user.save();

      logger.info('Transaction processed', {
        transactionId: transaction.id,
        userId: transaction.userId,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Transaction processing failed', {
        error: error.message,
        transactionId: transaction.id,
        userId: transaction.userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async getTransactionHistory(userId: string, options: {
    startDate?: Date;
    endDate?: Date;
    type?: Transaction['type'];
    status?: Transaction['status'];
    currency?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Transaction[]> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get transaction keys for user
      const keys = await redis.keys(`transaction:*`);
      const transactions: Transaction[] = [];

      // Filter and process transactions
      for (const key of keys) {
        const data = await redis.get(key);
        if (data) {
          const transaction: Transaction = JSON.parse(data);
          if (transaction.userId === userId) {
            // Apply filters
            if (options.startDate && transaction.createdAt < options.startDate) continue;
            if (options.endDate && transaction.createdAt > options.endDate) continue;
            if (options.type && transaction.type !== options.type) continue;
            if (options.status && transaction.status !== options.status) continue;
            if (options.currency && transaction.currency !== options.currency) continue;

            transactions.push(transaction);
          }
        }
      }

      // Sort by date and apply pagination
      transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const start = options.offset || 0;
      const end = start + (options.limit || 10);

      return transactions.slice(start, end);
    } catch (error) {
      logger.error('Failed to get transaction history', {
        error: error.message,
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
}

export default WalletService; 