import express from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { TransactionService } from '../services/transaction';

const router = express.Router();
const transactionService = TransactionService.getInstance();

// Create a new transaction
router.post('/', authenticate, async (req, res) => {
  try {
    const { amount, currency, type, metadata } = req.body;
    const transaction = await transactionService.createTransaction(
      req.user.id,
      amount,
      currency,
      type,
      metadata
    );
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a specific transaction
router.get('/:id', authenticate, async (req, res) => {
  try {
    const transaction = await transactionService.getTransaction(req.params.id);
    if (transaction.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Get user's transactions with pagination
router.get('/', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const { transactions, total } = await transactionService.getUserTransactions(
      req.user.id,
      limit,
      offset
    );
    res.json({ transactions, total });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update transaction status (admin only)
router.patch('/:id/status', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const transaction = await transactionService.updateTransactionStatus(
      req.params.id,
      status
    );
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get transaction summary
router.get('/summary', authenticate, async (req, res) => {
  try {
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const summary = await transactionService.getTransactionSummary(
      req.user.id,
      startDate,
      endDate
    );
    res.json(summary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router; 