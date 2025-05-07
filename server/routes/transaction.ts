import { Router } from 'express';
import { authenticate, authorize, verifyPhoneNumber } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { transactionSchemas } from '../middleware/validation';
import { TransactionService } from '../services/transaction';
import { logger } from '../utils/logger';

const router = Router();
const transactionService = new TransactionService();

// Create a new transaction
router.post(
  '/',
  authenticate,
  verifyPhoneNumber,
  validate(transactionSchemas.create),
  async (req, res, next) => {
    try {
      const { recipientId, amount, description, metadata } = req.body;
      const transaction = await transactionService.createTransaction({
        senderId: req.user!.sub,
        recipientId,
        amount,
        description,
        metadata,
      });

      logger.info('Transaction created', {
        transactionId: transaction.id,
        senderId: req.user!.sub,
        recipientId,
        amount,
      });

      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  }
);

// Get user's transactions
router.get(
  '/',
  authenticate,
  validate(transactionSchemas.list),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 10, type, status } = req.query;
      const transactions = await transactionService.getUserTransactions(
        req.user!.sub,
        {
          page: Number(page),
          limit: Number(limit),
          type: type as string,
          status: status as string,
        }
      );

      res.json(transactions);
    } catch (error) {
      next(error);
    }
  }
);

// Get transaction by ID
router.get(
  '/:id',
  authenticate,
  validate(transactionSchemas.get),
  async (req, res, next) => {
    try {
      const transaction = await transactionService.getTransaction(req.params.id);

      // Check if user is authorized to view this transaction
      if (
        transaction.senderId !== req.user!.sub &&
        transaction.recipientId !== req.user!.sub
      ) {
        return res.status(403).json({
          message: 'You are not authorized to view this transaction',
        });
      }

      res.json(transaction);
    } catch (error) {
      next(error);
    }
  }
);

// Process withdrawal
router.post(
  '/withdraw',
  authenticate,
  verifyPhoneNumber,
  validate(transactionSchemas.withdraw),
  async (req, res, next) => {
    try {
      const { amount, bankAccountId, description } = req.body;
      const transaction = await transactionService.processWithdrawal({
        userId: req.user!.sub,
        amount,
        bankAccountId,
        description,
      });

      logger.info('Withdrawal processed', {
        transactionId: transaction.id,
        userId: req.user!.sub,
        amount,
      });

      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  }
);

// Process deposit
router.post(
  '/deposit',
  authenticate,
  verifyPhoneNumber,
  validate(transactionSchemas.deposit),
  async (req, res, next) => {
    try {
      const { amount, bankAccountId, description } = req.body;
      const transaction = await transactionService.processDeposit({
        userId: req.user!.sub,
        amount,
        bankAccountId,
        description,
      });

      logger.info('Deposit processed', {
        transactionId: transaction.id,
        userId: req.user!.sub,
        amount,
      });

      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  }
);

// Get transaction statistics (admin only)
router.get(
  '/stats',
  authenticate,
  authorize(['ADMIN']),
  async (req, res, next) => {
    try {
      const stats = await transactionService.getTransactionStatistics();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

export default router; 