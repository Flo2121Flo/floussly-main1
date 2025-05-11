import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction';
import { validateRequest } from '../middleware/validate';
import { transactionSchema } from '../validations/transaction';
import { logger } from '../utils/logger';
import { Transaction } from '../models/transaction';
import { User } from '../models/user';
import fraudDetection from '../services/fraud-detection';
import { rateLimit } from '../middleware/rate-limiter';
import { config } from '../config';

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
      const { amount, recipientId, description } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      // Apply rate limiting
      await rateLimit.transaction(req, res, async () => {
        // Get user and recipient
        const [user, recipient] = await Promise.all([
          User.findById(userId),
          User.findById(recipientId),
        ]);

        if (!user || !recipient) {
          return res.status(404).json({
            error: 'User or recipient not found',
            code: 'USER_NOT_FOUND',
          });
        }

        // Create transaction object
        const transaction = new Transaction({
          userId,
          recipientId,
          amount,
          description,
          status: 'pending',
          deviceId: req.headers['x-device-id'],
          location: req.body.location,
          ip: req.ip,
        });

        // Check for fraud
        const fraudCheck = await fraudDetection.checkTransaction(transaction, user);

        if (fraudCheck.isFraudulent) {
          logger.warn('Fraudulent transaction detected', {
            transactionId: transaction.id,
            userId,
            recipientId,
            amount,
            reason: fraudCheck.reason,
            riskScore: fraudCheck.riskScore,
          });

          return res.status(403).json({
            error: 'Transaction rejected due to suspicious activity',
            code: 'FRAUD_DETECTED',
            reason: fraudCheck.reason,
          });
        }

        // Process transaction
        try {
          await transaction.save();

          // Update user balances
          await Promise.all([
            User.findByIdAndUpdate(userId, {
              $inc: { balance: -amount },
            }),
            User.findByIdAndUpdate(recipientId, {
              $inc: { balance: amount },
            }),
          ]);

          // Update transaction status
          transaction.status = 'completed';
          await transaction.save();

          logger.info('Transaction completed successfully', {
            transactionId: transaction.id,
            userId,
            recipientId,
            amount,
          });

          return res.status(200).json({
            message: 'Transaction completed successfully',
            transaction: {
              id: transaction.id,
              amount,
              status: transaction.status,
              createdAt: transaction.createdAt,
            },
          });
        } catch (error) {
          // Rollback transaction
          transaction.status = 'failed';
          await transaction.save();

          logger.error('Transaction failed', {
            error,
            transactionId: transaction.id,
            userId,
            recipientId,
            amount,
          });

          return res.status(500).json({
            error: 'Transaction failed',
            code: 'TRANSACTION_FAILED',
          });
        }
      });
    } catch (error) {
      logger.error('Error in createTransaction', { error });
      return res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
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