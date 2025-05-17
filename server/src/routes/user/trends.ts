import { Router } from 'express';
import { z } from 'zod';
import { TransactionTrendsService, TimePeriod } from '../../services/TransactionTrendsService';
import { requireAuth } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { logger } from '../../utils/logger';

const router = Router();
const trendsService = TransactionTrendsService.getInstance();

// Request validation schemas
const trendsQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

// Get user's transaction trends
router.get(
  '/',
  requireAuth,
  validateRequest({ query: trendsQuerySchema }),
  async (req, res) => {
    try {
      const { period, startDate, endDate } = req.query;

      const trends = await trendsService.getUserTrends(
        req.user.id,
        period as TimePeriod,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json({
        status: 'success',
        data: trends
      });
    } catch (error) {
      logger.error('Failed to get transaction trends', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get transaction trends'
      });
    }
  }
);

export default router; 