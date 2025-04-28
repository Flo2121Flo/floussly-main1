import express from 'express';
import { TransactionController } from '../controllers/transactionController';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Create a new transaction
router.post('/', TransactionController.createTransaction);

// Get transaction fee preview
router.post('/fee', TransactionController.getTransactionFee);

// Get user transactions
router.get('/', TransactionController.getUserTransactions);

export default router; 