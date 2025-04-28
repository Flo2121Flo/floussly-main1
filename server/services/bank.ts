import { DatabaseService } from './database';
import { logger } from '../utils/logger';

export class BankService {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  // Link a new bank account
  async linkAccount(userId: string, data: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    accountType: string;
    accountHolderName: string;
  }) {
    try {
      const account = await this.db.query(
        'INSERT INTO bank_accounts (user_id, bank_name, account_number, routing_number, account_type, account_holder_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userId, data.bankName, data.accountNumber, data.routingNumber, data.accountType, data.accountHolderName]
      );

      return account;
    } catch (error) {
      logger.error('Failed to link bank account:', error);
      throw error;
    }
  }

  // Get all bank accounts for a user
  async getUserAccounts(userId: string) {
    try {
      const accounts = await this.db.query(
        'SELECT * FROM bank_accounts WHERE user_id = $1',
        [userId]
      );

      return accounts;
    } catch (error) {
      logger.error('Failed to get user bank accounts:', error);
      throw error;
    }
  }

  // Get a specific bank account
  async getAccountById(userId: string, accountId: string) {
    try {
      const account = await this.db.query(
        'SELECT * FROM bank_accounts WHERE id = $1 AND user_id = $2',
        [accountId, userId]
      );

      return account;
    } catch (error) {
      logger.error('Failed to get bank account:', error);
      throw error;
    }
  }

  // Update bank account
  async updateAccount(userId: string, accountId: string, data: Partial<{
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    accountType: string;
    accountHolderName: string;
    isVerified: boolean;
  }>) {
    try {
      const updates = Object.entries(data)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value], index) => `${key} = $${index + 3}`)
        .join(', ');

      const values = [accountId, userId, ...Object.values(data).filter(value => value !== undefined)];
      const query = `UPDATE bank_accounts SET ${updates} WHERE id = $1 AND user_id = $2 RETURNING *`;

      const account = await this.db.query(query, values);
      return account;
    } catch (error) {
      logger.error('Failed to update bank account:', error);
      throw error;
    }
  }

  // Delete bank account
  async deleteAccount(userId: string, accountId: string) {
    try {
      await this.db.query(
        'DELETE FROM bank_accounts WHERE id = $1 AND user_id = $2',
        [accountId, userId]
      );
    } catch (error) {
      logger.error('Failed to delete bank account:', error);
      throw error;
    }
  }

  // Verify bank account
  async verifyAccount(userId: string, accountId: string, amount1: number, amount2: number) {
    try {
      const account = await this.getAccountById(userId, accountId);
      if (!account) {
        throw new Error('Bank account not found');
      }

      // Verify the amounts match the micro-deposits
      const isVerified = await this.verifyMicroDeposits(accountId, amount1, amount2);
      if (isVerified) {
        await this.updateAccount(userId, accountId, { isVerified: true });
      }

      return { ...account, isVerified };
    } catch (error) {
      logger.error('Failed to verify bank account:', error);
      throw error;
    }
  }

  // Get bank account balance
  async getAccountBalance(userId: string, accountId: string) {
    try {
      const account = await this.getAccountById(userId, accountId);
      if (!account) {
        throw new Error('Bank account not found');
      }

      // In a real application, this would call the bank's API
      // For now, we'll return a mock balance
      return {
        availableBalance: 1000.00,
        currentBalance: 1000.00,
        currency: 'USD',
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to get bank account balance:', error);
      throw error;
    }
  }

  // Helper method to verify micro-deposits
  private async verifyMicroDeposits(accountId: string, amount1: number, amount2: number): Promise<boolean> {
    try {
      const deposits = await this.db.query(
        'SELECT * FROM micro_deposits WHERE account_id = $1 ORDER BY created_at DESC LIMIT 2',
        [accountId]
      );

      if (deposits.length !== 2) {
        return false;
      }

      const [deposit1, deposit2] = deposits;
      return deposit1.amount === amount1 && deposit2.amount === amount2;
    } catch (error) {
      logger.error('Failed to verify micro-deposits:', error);
      return false;
    }
  }
} 