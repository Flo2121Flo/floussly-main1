import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { config } from '../config/config';
import { formatDate } from '../utils/timezone';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'CREDIT' | 'DEBIT';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class TransactionModel {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: config.DB_HOST,
      port: parseInt(config.DB_PORT || '5432', 10),
      database: config.DB_NAME,
      user: config.DB_USER,
      password: config.DB_PASSWORD
    });
  }

  async create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO transactions (
          user_id, amount, currency, type, status, description, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          transaction.userId,
          transaction.amount,
          transaction.currency,
          transaction.type,
          transaction.status,
          transaction.description,
          transaction.metadata || {}
        ]
      );

      await client.query('COMMIT');
      return this.mapRowToTransaction(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      const err = error as Error;
      logger.error('Failed to create transaction', { error: err.message });
      throw new Error(`Failed to create transaction: ${err.message}`);
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<Transaction | null> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM transactions WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToTransaction(result.rows[0]);
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to find transaction by ID', { error: err.message, id });
      throw new Error(`Failed to find transaction: ${err.message}`);
    }
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );

      return result.rows.map(row => this.mapRowToTransaction(row));
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to find transactions by user ID', { error: err.message, userId });
      throw new Error(`Failed to find transactions: ${err.message}`);
    }
  }

  async updateStatus(id: string, status: Transaction['status']): Promise<Transaction> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE transactions 
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [status, id]
      );

      if (result.rows.length === 0) {
        throw new Error(`Transaction not found: ${id}`);
      }

      await client.query('COMMIT');
      return this.mapRowToTransaction(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      const err = error as Error;
      logger.error('Failed to update transaction status', { error: err.message, id, status });
      throw new Error(`Failed to update transaction status: ${err.message}`);
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        'DELETE FROM transactions WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error(`Transaction not found: ${id}`);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      const err = error as Error;
      logger.error('Failed to delete transaction', { error: err.message, id });
      throw new Error(`Failed to delete transaction: ${err.message}`);
    } finally {
      client.release();
    }
  }

  private mapRowToTransaction(row: any): Transaction {
    return {
      id: row.id,
      userId: row.user_id,
      amount: parseFloat(row.amount),
      currency: row.currency,
      type: row.type,
      status: row.status,
      description: row.description,
      metadata: row.metadata,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
} 