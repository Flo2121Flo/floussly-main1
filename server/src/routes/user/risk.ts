import { Router } from 'express';
import { z } from 'zod';
import { UserRiskProfileService } from '../../services/UserRiskProfileService';
import { logger } from '../../utils/logger';
import { requireAuth } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';

const router = Router();
const riskProfileService = UserRiskProfileService.getInstance();

// Get user's own risk profile
router.get(
  '/profile',
  requireAuth,
  async (req, res) => {
    try {
      const profile = await riskProfileService.getRiskProfile(req.user.id);

      res.json({
        status: 'success',
        data: profile
      });
    } catch (error) {
      logger.error('Failed to get risk profile', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get risk profile'
      });
    }
  }
);

// Get user's risk profile history
router.get(
  '/history',
  requireAuth,
  validateRequest({
    query: z.object({
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional()
    })
  }),
  async (req, res) => {
    try {
      const { limit = 10, offset = 0 } = req.query;
      
      const history = await riskProfileService.getRiskProfileHistory(
        req.user.id,
        Number(limit),
        Number(offset)
      );

      res.json({
        status: 'success',
        data: history
      });
    } catch (error) {
      logger.error('Failed to get risk profile history', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get risk profile history'
      });
    }
  }
);

export default router; 