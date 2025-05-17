import { Router } from 'express';
import { z } from 'zod';
import { OnboardingService, ChecklistItemStatus } from '../../services/OnboardingService';
import { requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { logger } from '../../utils/logger';
import { Pool } from 'pg';
import { config } from '../../config/appConfig';

const router = Router();
const onboardingService = OnboardingService.getInstance();
const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: config.NODE_ENV === 'production'
});

// Request validation schemas
const listChecklistsSchema = z.object({
  userId: z.string().uuid().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'skipped']).optional(),
  type: z.enum(['kyc', 'bank_account', 'identity_verification', 'phone_verification', 'email_verification', 'security_setup', 'preferences']).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
});

const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

// Get all checklists with filtering
router.get(
  '/checklists',
  requireAdmin,
  validateRequest({ query: listChecklistsSchema }),
  async (req, res) => {
    try {
      const { userId, status, type, limit = 50, offset = 0 } = req.query;

      let query = `
        SELECT * FROM onboarding_checklist
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (userId) {
        query += ` AND user_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      if (status) {
        query += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (type) {
        query += ` AND type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      res.json({ items: result.rows });
    } catch (error) {
      logger.error('Failed to get checklists', { error: error.message });
      res.status(500).json({ error: 'Failed to get checklists' });
    }
  }
);

// Get user's checklist
router.get(
  '/checklists/:userId',
  requireAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const items = await onboardingService.getChecklist(userId);
      res.json({ items });
    } catch (error) {
      logger.error('Failed to get user checklist', { error: error.message });
      res.status(500).json({ error: 'Failed to get user checklist' });
    }
  }
);

// Get user's progress
router.get(
  '/progress/:userId',
  requireAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const progress = await onboardingService.getProgress(userId);
      res.json({ progress });
    } catch (error) {
      logger.error('Failed to get user progress', { error: error.message });
      res.status(500).json({ error: 'Failed to get user progress' });
    }
  }
);

// Get onboarding statistics
router.get(
  '/stats',
  requireAdmin,
  validateRequest({ query: dateRangeSchema }),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      let query = `
        SELECT * FROM onboarding_stats
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (startDate) {
        query += ` AND last_updated >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        query += ` AND last_updated <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
      }

      const result = await pool.query(query, params);
      res.json({ stats: result.rows });
    } catch (error) {
      logger.error('Failed to get onboarding stats', { error: error.message });
      res.status(500).json({ error: 'Failed to get onboarding stats' });
    }
  }
);

// Get onboarding trends
router.get(
  '/trends',
  requireAdmin,
  validateRequest({ query: dateRangeSchema }),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      let query = `
        SELECT * FROM onboarding_trends
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

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

      const result = await pool.query(query, params);
      res.json({ trends: result.rows });
    } catch (error) {
      logger.error('Failed to get onboarding trends', { error: error.message });
      res.status(500).json({ error: 'Failed to get onboarding trends' });
    }
  }
);

export default router; 