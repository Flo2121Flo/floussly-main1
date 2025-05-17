import { Router } from 'express';
import { SecurityAuditService } from '../../services/SecurityAuditService';
import { logger } from '../../utils/logger';
import { config } from '../../config/appConfig';
import { redis } from '../../config/redis';
import { z } from 'zod';

const router = Router();

// IP whitelist middleware
const ipWhitelist = async (req: any, res: any, next: any) => {
  const ip = req.ip;
  const whitelistedIps = await redis.smembers('security:whitelisted_ips');
  
  if (!whitelistedIps.includes(ip)) {
    logger.warn('Unauthorized IP attempt', { ip });
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
};

// API key validation middleware
const validateApiKey = async (req: any, res: any, next: any) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const isValid = await redis.get(`security:api_keys:${apiKey}`);
    if (!isValid) {
      logger.warn('Invalid API key attempt', { apiKey });
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    next();
  } catch (error) {
    logger.error('API key validation failed', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Request validation schema
const auditRequestSchema = z.object({
  schedule: z.enum(['immediate', 'weekly', 'monthly']).optional(),
  notify: z.boolean().optional(),
  scope: z.array(z.string()).optional()
});

// Run security audit
router.post(
  '/audit',
  ipWhitelist,
  validateApiKey,
  async (req, res) => {
    try {
      // Validate request body
      const { schedule, notify, scope } = auditRequestSchema.parse(req.body);
      
      const auditService = SecurityAuditService.getInstance();
      
      // If scheduled, add to queue
      if (schedule && schedule !== 'immediate') {
        await redis.lpush('security:audit_queue', JSON.stringify({
          schedule,
          notify,
          scope,
          requestedBy: req.ip,
          timestamp: new Date()
        }));
        
        return res.json({
          status: 'scheduled',
          message: `Security audit scheduled for ${schedule} execution`
        });
      }
      
      // Run immediate audit
      const results = await auditService.runAudit();
      
      // Send notification if requested
      if (notify) {
        // Implement notification logic here
        // Example: Email, Slack, etc.
      }
      
      res.json({
        status: 'completed',
        timestamp: new Date(),
        results
      });
      
    } catch (error) {
      logger.error('Security audit request failed', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get audit history
router.get(
  '/audit/history',
  ipWhitelist,
  validateApiKey,
  async (req, res) => {
    try {
      const { startDate, endDate, limit = 10 } = req.query;
      
      const query = `
        SELECT * FROM security_audit_logs
        WHERE timestamp BETWEEN $1 AND $2
        ORDER BY timestamp DESC
        LIMIT $3
      `;
      
      const result = await req.app.locals.db.query(query, [
        startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default to last 30 days
        endDate || new Date(),
        limit
      ]);
      
      res.json({
        status: 'success',
        audits: result.rows
      });
      
    } catch (error) {
      logger.error('Failed to fetch audit history', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get specific audit result
router.get(
  '/audit/:auditId',
  ipWhitelist,
  validateApiKey,
  async (req, res) => {
    try {
      const { auditId } = req.params;
      
      const query = `
        SELECT * FROM security_audit_logs
        WHERE audit_id = $1
      `;
      
      const result = await req.app.locals.db.query(query, [auditId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Audit not found' });
      }
      
      res.json({
        status: 'success',
        audit: result.rows[0]
      });
      
    } catch (error) {
      logger.error('Failed to fetch audit result', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Manage IP whitelist
router.post(
  '/whitelist/ip',
  ipWhitelist,
  validateApiKey,
  async (req, res) => {
    try {
      const { ip, action } = req.body;
      
      if (!ip || !['add', 'remove'].includes(action)) {
        return res.status(400).json({ error: 'Invalid request' });
      }
      
      if (action === 'add') {
        await redis.sadd('security:whitelisted_ips', ip);
      } else {
        await redis.srem('security:whitelisted_ips', ip);
      }
      
      res.json({
        status: 'success',
        message: `IP ${action === 'add' ? 'added to' : 'removed from'} whitelist`
      });
      
    } catch (error) {
      logger.error('IP whitelist management failed', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Manage API keys
router.post(
  '/api-keys',
  ipWhitelist,
  validateApiKey,
  async (req, res) => {
    try {
      const { action, key } = req.body;
      
      if (!['create', 'revoke'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
      }
      
      if (action === 'create') {
        const newKey = crypto.randomBytes(32).toString('hex');
        await redis.set(`security:api_keys:${newKey}`, '1', 'EX', 30 * 24 * 60 * 60); // 30 days
        
        res.json({
          status: 'success',
          message: 'API key created',
          key: newKey
        });
      } else {
        if (!key) {
          return res.status(400).json({ error: 'API key required' });
        }
        
        await redis.del(`security:api_keys:${key}`);
        
        res.json({
          status: 'success',
          message: 'API key revoked'
        });
      }
      
    } catch (error) {
      logger.error('API key management failed', { error: error.message });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router; 