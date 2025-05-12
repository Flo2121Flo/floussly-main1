import { Router } from 'express';
import { WalletLimitController } from '../controllers/WalletLimitController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const walletLimitController = WalletLimitController.getInstance();

// Wallet limit routes
router.get('/limits', authMiddleware, (req, res) => walletLimitController.getLimits(req, res));
router.put('/limits', authMiddleware, (req, res) => walletLimitController.updateLimits(req, res));
router.get('/transactions', authMiddleware, (req, res) => walletLimitController.getTransactionHistory(req, res));
router.post('/limits/reset', authMiddleware, (req, res) => walletLimitController.resetLimits(req, res));

// New limit violation routes
router.get('/limits/violations', authMiddleware, (req, res) => walletLimitController.getLimitViolations(req, res));
router.post('/limits/violations/:violationId/resolve', authMiddleware, (req, res) => walletLimitController.resolveViolation(req, res));

export default router; 