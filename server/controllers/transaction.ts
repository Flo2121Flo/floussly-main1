import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction';
import { validateRequest } from '../middleware/validate';
import { transactionSchema } from '../validations/transaction';
import { logger } from '../utils/logger';

export class TransactionController {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  // Get all transactions for a user
  async getTransactions(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { page = 1, limit = 10, status, type, startDate, endDate } = req.query;
      const transactions = await this.transactionService.getUserTransactions(userId, {
        page: Number(page),
        limit: Number(limit),
        status: status as string,
        type: type as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json(transactions);
    } catch (error) {
      logger.error('Failed to get transactions:', error);
      res.status(500).json({ error: 'Failed to get transactions' });
    }
  }

  // Get a specific transaction
  async getTransaction(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { transactionId } = req.params;
      const transaction = await this.transactionService.getTransactionById(userId, transactionId);

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json({ transaction });
    } catch (error) {
      logger.error('Failed to get transaction:', error);
      res.status(500).json({ error: 'Failed to get transaction' });
    }
  }

  // Create a new transaction
  async createTransaction(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { error } = validateRequest(req.body, transactionSchema.create);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const transaction = await this.transactionService.createTransaction(userId, req.body);
      res.status(201).json({ transaction });
    } catch (error) {
      logger.error('Failed to create transaction:', error);
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  }

  // Update transaction status
  async updateStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { transactionId } = req.params;
      const { error } = validateRequest(req.body, transactionSchema.updateStatus);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { status } = req.body;
      const transaction = await this.transactionService.updateTransactionStatus(userId, transactionId, status);
      res.json({ transaction });
    } catch (error) {
      logger.error('Failed to update transaction status:', error);
      res.status(500).json({ error: 'Failed to update transaction status' });
    }
  }

  // Get transaction statistics
  async getStatistics(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { startDate, endDate } = req.query;
      const statistics = await this.transactionService.getTransactionStatistics(userId, {
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json(statistics);
    } catch (error) {
      logger.error('Failed to get transaction statistics:', error);
      res.status(500).json({ error: 'Failed to get transaction statistics' });
    }
  }
} 