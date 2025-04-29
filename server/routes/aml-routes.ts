import { Router } from 'express';
import { AMLController } from '../controllers/aml-controller';
import { validateApiKey } from '../middleware/security';

const router = Router();
const amlController = AMLController.getInstance();

// Get alerts for a user
router.get('/users/:userId/alerts', validateApiKey, (req, res) => {
  amlController.getAlerts(req, res);
});

// Clear alerts for a user
router.delete('/users/:userId/alerts', validateApiKey, (req, res) => {
  amlController.clearAlerts(req, res);
});

// Get transaction patterns for a user
router.get('/users/:userId/patterns', validateApiKey, (req, res) => {
  amlController.getTransactionPatterns(req, res);
});

// Get suspicious patterns for a user
router.get('/users/:userId/suspicious-patterns', validateApiKey, (req, res) => {
  amlController.getSuspiciousPatterns(req, res);
});

// Get monitoring statistics for a user
router.get('/users/:userId/stats', validateApiKey, (req, res) => {
  amlController.getMonitoringStats(req, res);
});

export default router; 