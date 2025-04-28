import { DatabaseService } from './database';
import { logger } from '../utils/logger';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class TransactionService {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  // Get all transactions for a user
  async getUserTransactions(userId: string, filters: {
    page: number;
    limit: number;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const offset = (filters.page - 1) * filters.limit;
      const conditions = ['user_id = $1'];
      const values = [userId];
      let paramIndex = 2;

      if (filters.status) {
        conditions.push(`status = $${paramIndex}`);
        values.push(filters.status);
        paramIndex++;
      }

      if (filters.type) {
        conditions.push(`type = $${paramIndex}`);
        values.push(filters.type);
        paramIndex++;
      }

      if (filters.startDate) {
        conditions.push(`created_at >= $${paramIndex}`);
        values.push(filters.startDate);
        paramIndex++;
      }

      if (filters.endDate) {
        conditions.push(`created_at <= $${paramIndex}`);
        values.push(filters.endDate);
        paramIndex++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const query = `
        SELECT * FROM transactions
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const transactions = await this.db.query(query, [...values, filters.limit, offset]);
      const total = await this.db.query(
        `SELECT COUNT(*) FROM transactions ${whereClause}`,
        values
      );

      return {
        transactions,
        pagination: {
          total: parseInt(total.count),
          page: filters.page,
          limit: filters.limit,
          pages: Math.ceil(parseInt(total.count) / filters.limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get user transactions:', error);
      throw error;
    }
  }

  // Get a specific transaction
  async getTransactionById(userId: string, transactionId: string) {
    try {
      const transaction = await this.db.query(
        'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
        [transactionId, userId]
      );

      return transaction;
    } catch (error) {
      logger.error('Failed to get transaction:', error);
      throw error;
    }
  }

  // Create a new transaction
  async createTransaction(userId: string, data: {
    type: string;
    amount: number;
    currency: string;
    description: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const transaction = await this.db.query(
        'INSERT INTO transactions (user_id, type, amount, currency, description, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userId, data.type, data.amount, data.currency, data.description, data.metadata]
      );

      return transaction;
    } catch (error) {
      logger.error('Failed to create transaction:', error);
      throw error;
    }
  }

  // Update transaction status
  async updateTransactionStatus(userId: string, transactionId: string, status: string) {
    try {
      const transaction = await this.db.query(
        'UPDATE transactions SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
        [status, transactionId, userId]
      );

      return transaction;
    } catch (error) {
      logger.error('Failed to update transaction status:', error);
      throw error;
    }
  }

  // Get transaction statistics
  async getTransactionStatistics(userId: string, filters: {
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const conditions = ['user_id = $1'];
      const values = [userId];
      let paramIndex = 2;

      if (filters.startDate) {
        conditions.push(`created_at >= $${paramIndex}`);
        values.push(filters.startDate);
        paramIndex++;
      }

      if (filters.endDate) {
        conditions.push(`created_at <= $${paramIndex}`);
        values.push(filters.endDate);
        paramIndex++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const statistics = await this.db.query(`
        SELECT
          COUNT(*) as total_transactions,
          SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credits,
          SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_debits,
          COUNT(DISTINCT currency) as currencies_used,
          MIN(created_at) as first_transaction,
          MAX(created_at) as last_transaction
        FROM transactions
        ${whereClause}
      `, values);

      return statistics;
    } catch (error) {
      logger.error('Failed to get transaction statistics:', error);
      throw error;
    }
  }

  private mapTransaction(row: any): Transaction {
    return {
      id: row.id,
      userId: row.user_id,
      amount: parseFloat(row.amount),
      currency: row.currency,
      type: row.type,
      status: row.status,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
} 