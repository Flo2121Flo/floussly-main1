import { Router } from 'express';
import { z } from 'zod';
import { UserRiskProfileService, RiskLevel } from '../../services/UserRiskProfileService';
import { logger } from '../../utils/logger';
import { requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';

const router = Router();
const riskProfileService = UserRiskProfileService.getInstance();

// Request validation schemas
const riskProfileListSchema = z.object({
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
});

// Get all risk profiles
router.get(
  '/profiles',
  requireAdmin,
  validateRequest({ query: riskProfileListSchema }),
  async (req, res) => {
    try {
      const {
        riskLevel,
        startDate,
        endDate,
        limit = 10,
        offset = 0
      } = req.query;

      let query = 'SELECT * FROM risk_profiles WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (riskLevel) {
        query += ` AND risk_level = $${paramIndex}`;
        params.push(riskLevel);
        paramIndex++;
      }

      if (startDate) {
        query += ` AND created_at >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        query += ` AND created_at <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await req.app.locals.db.query(query, params);

      res.json({
        status: 'success',
        data: result.rows
      });
    } catch (error) {
      logger.error('Failed to get risk profiles', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get risk profiles'
      });
    }
  }
);

// Get risk profile by user ID
router.get(
  '/profiles/:userId',
  requireAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      
      const profile = await riskProfileService.getRiskProfile(userId);

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

// Get risk profile history
router.get(
  '/profiles/:userId/history',
  requireAdmin,
  validateRequest({
    query: z.object({
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional()
    })
  }),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 10, offset = 0 } = req.query;
      
      const history = await riskProfileService.getRiskProfileHistory(
        userId,
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

// Get risk statistics
router.get(
  '/stats',
  requireAdmin,
  validateRequest({
    query: z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional()
    })
  }),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const query = `
        SELECT * FROM risk_stats
        WHERE date BETWEEN $1 AND $2
        ORDER BY date DESC, risk_level
      `;
      
      const result = await req.app.locals.db.query(query, [
        startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate || new Date()
      ]);

      res.json({
        status: 'success',
        data: result.rows
      });
    } catch (error) {
      logger.error('Failed to get risk statistics', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get risk statistics'
      });
    }
  }
);

// Get risk trends
router.get(
  '/trends',
  requireAdmin,
  validateRequest({
    query: z.object({
      userId: z.string().uuid().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional()
    })
  }),
  async (req, res) => {
    try {
      const { userId, startDate, endDate } = req.query;
      
      let query = 'SELECT * FROM user_risk_trends WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (userId) {
        query += ` AND user_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      if (startDate) {
        query += ` AND date >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        query += ` AND date <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
      }

      query += ' ORDER BY user_id, date DESC';

      const result = await req.app.locals.db.query(query, params);

      res.json({
        status: 'success',
        data: result.rows
      });
    } catch (error) {
      logger.error('Failed to get risk trends', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get risk trends'
      });
    }
  }
);

export default router; 