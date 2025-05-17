import { Router } from 'express';
import { z } from 'zod';
import { FraudRuleEngine, RuleSeverity, RuleAction } from '../../services/FraudRuleEngine';
import { logger } from '../../utils/logger';
import { requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const fraudEngine = FraudRuleEngine.getInstance();

// Request validation schemas
const ruleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.any(),
    aggregation: z.string().optional(),
    timeWindow: z.number().optional()
  })),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  action: z.enum(['allow', 'block', 'review', 'notify']),
  isActive: z.boolean().optional()
});

const eventListSchema = z.object({
  userId: z.string().uuid().optional(),
  type: z.string().optional(),
  action: z.enum(['allow', 'block', 'review', 'notify']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
});

// Get all fraud rules
router.get(
  '/rules',
  requireAdmin,
  async (req, res) => {
    try {
      const result = await req.app.locals.db.query(
        'SELECT * FROM fraud_rules ORDER BY created_at DESC'
      );

      res.json({
        status: 'success',
        data: result.rows
      });
    } catch (error) {
      logger.error('Failed to get fraud rules', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get fraud rules'
      });
    }
  }
);

// Create new fraud rule
router.post(
  '/rules',
  requireAdmin,
  validateRequest({ body: ruleSchema }),
  async (req, res) => {
    try {
      const ruleId = uuidv4();
      const timestamp = new Date();

      const result = await req.app.locals.db.query(
        `INSERT INTO fraud_rules (
          id, name, description, conditions, severity,
          action, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          ruleId,
          req.body.name,
          req.body.description,
          req.body.conditions,
          req.body.severity,
          req.body.action,
          req.body.isActive ?? true,
          timestamp,
          timestamp
        ]
      );

      // Reinitialize rules in engine
      await fraudEngine.initializeRules();

      res.json({
        status: 'success',
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Failed to create fraud rule', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to create fraud rule'
      });
    }
  }
);

// Update fraud rule
router.put(
  '/rules/:ruleId',
  requireAdmin,
  validateRequest({ body: ruleSchema }),
  async (req, res) => {
    try {
      const { ruleId } = req.params;
      const timestamp = new Date();

      const result = await req.app.locals.db.query(
        `UPDATE fraud_rules 
         SET name = $1, description = $2, conditions = $3,
             severity = $4, action = $5, is_active = $6,
             updated_at = $7
         WHERE id = $8
         RETURNING *`,
        [
          req.body.name,
          req.body.description,
          req.body.conditions,
          req.body.severity,
          req.body.action,
          req.body.isActive ?? true,
          timestamp,
          ruleId
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Rule not found'
        });
      }

      // Reinitialize rules in engine
      await fraudEngine.initializeRules();

      res.json({
        status: 'success',
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Failed to update fraud rule', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to update fraud rule'
      });
    }
  }
);

// Delete fraud rule
router.delete(
  '/rules/:ruleId',
  requireAdmin,
  async (req, res) => {
    try {
      const { ruleId } = req.params;

      const result = await req.app.locals.db.query(
        'DELETE FROM fraud_rules WHERE id = $1 RETURNING *',
        [ruleId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Rule not found'
        });
      }

      // Reinitialize rules in engine
      await fraudEngine.initializeRules();

      res.json({
        status: 'success',
        message: 'Rule deleted successfully'
      });
    } catch (error) {
      logger.error('Failed to delete fraud rule', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete fraud rule'
      });
    }
  }
);

// Get fraud events
router.get(
  '/events',
  requireAdmin,
  validateRequest({ query: eventListSchema }),
  async (req, res) => {
    try {
      const {
        userId,
        type,
        action,
        startDate,
        endDate,
        limit = 10,
        offset = 0
      } = req.query;

      let query = 'SELECT * FROM fraud_events WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (userId) {
        query += ` AND user_id = $${paramIndex}`;
        params.push(userId);
        paramIndex++;
      }

      if (type) {
        query += ` AND type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
      }

      if (action) {
        query += ` AND action = $${paramIndex}`;
        params.push(action);
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
      logger.error('Failed to get fraud events', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get fraud events'
      });
    }
  }
);

// Get fraud statistics
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
        SELECT * FROM fraud_stats
        WHERE event_date BETWEEN $1 AND $2
        ORDER BY event_date DESC
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
      logger.error('Failed to get fraud statistics', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get fraud statistics'
      });
    }
  }
);

// Get user fraud risk
router.get(
  '/risk/:userId',
  requireAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      
      const result = await req.app.locals.db.query(
        'SELECT * FROM user_fraud_risk WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      res.json({
        status: 'success',
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Failed to get user fraud risk', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get user fraud risk'
      });
    }
  }
);

export default router; 