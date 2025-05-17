import { Router } from 'express';
import { z } from 'zod';
import { TransactionTrendsService, TimePeriod } from '../../services/TransactionTrendsService';
import { requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { logger } from '../../utils/logger';
import { Pool } from 'pg';
import { config } from '../../config/appConfig';

const router = Router();
const trendsService = TransactionTrendsService.getInstance();
const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: config.NODE_ENV === 'production'
});

// Request validation schemas
const trendsQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

// Get transaction trends
router.get(
  '/',
  requireAdmin,
  validateRequest({ query: trendsQuerySchema }),
  async (req, res) => {
    try {
      const { userId, period, startDate, endDate } = req.query;

      if (userId) {
        // Get trends for specific user
        const trends = await trendsService.getUserTrends(
          userId as string,
          period as TimePeriod,
          startDate ? new Date(startDate as string) : undefined,
          endDate ? new Date(endDate as string) : undefined
        );

        res.json({
          status: 'success',
          data: trends
        });
      } else {
        // Get aggregate trends
        const result = await pool.query(
          `SELECT 
            DATE_TRUNC($1, created_at) as period,
            COUNT(*) as transaction_count,
            SUM(amount) as total_volume,
            AVG(amount) as avg_amount,
            COUNT(DISTINCT user_id) as unique_users,
            COUNT(DISTINCT recipient_id) as unique_recipients,
            COUNT(DISTINCT category) as unique_categories
           FROM transactions
           WHERE created_at BETWEEN $2 AND $3
           GROUP BY DATE_TRUNC($1, created_at)
           ORDER BY period`,
          [
            period || 'monthly',
            startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate || new Date()
          ]
        );

        res.json({
          status: 'success',
          data: result.rows
        });
      }
    } catch (error) {
      logger.error('Failed to get transaction trends', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get transaction trends'
      });
    }
  }
);

// Get trend anomalies
router.get(
  '/anomalies',
  requireAdmin,
  validateRequest({ query: trendsQuerySchema }),
  async (req, res) => {
    try {
      const { userId, period, startDate, endDate } = req.query;

      if (userId) {
        // Get anomalies for specific user
        const trends = await trendsService.getUserTrends(
          userId as string,
          period as TimePeriod,
          startDate ? new Date(startDate as string) : undefined,
          endDate ? new Date(endDate as string) : undefined
        );

        const anomalies = trends.flatMap(trend => trend.anomalies);

        res.json({
          status: 'success',
          data: anomalies
        });
      } else {
        // Get aggregate anomalies
        const result = await pool.query(
          `WITH stats AS (
            SELECT 
              DATE_TRUNC($1, created_at) as period,
              COUNT(*) as transaction_count,
              SUM(amount) as total_volume,
              AVG(amount) as avg_amount,
              STDDEV(amount) as amount_stddev
            FROM transactions
            WHERE created_at BETWEEN $2 AND $3
            GROUP BY DATE_TRUNC($1, created_at)
          )
          SELECT *
          FROM stats
          WHERE 
            transaction_count > (
              SELECT AVG(transaction_count) + 2 * STDDEV(transaction_count)
              FROM stats
            )
            OR total_volume > (
              SELECT AVG(total_volume) + 2 * STDDEV(total_volume)
              FROM stats
            )
          ORDER BY period DESC`,
          [
            period || 'monthly',
            startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate || new Date()
          ]
        );

        res.json({
          status: 'success',
          data: result.rows
        });
      }
    } catch (error) {
      logger.error('Failed to get trend anomalies', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get trend anomalies'
      });
    }
  }
);

// Get trend insights
router.get(
  '/insights',
  requireAdmin,
  validateRequest({ query: trendsQuerySchema }),
  async (req, res) => {
    try {
      const { userId, period, startDate, endDate } = req.query;

      if (userId) {
        // Get insights for specific user
        const trends = await trendsService.getUserTrends(
          userId as string,
          period as TimePeriod,
          startDate ? new Date(startDate as string) : undefined,
          endDate ? new Date(endDate as string) : undefined
        );

        const insights = trends.flatMap(trend => trend.insights);

        res.json({
          status: 'success',
          data: insights
        });
      } else {
        // Get aggregate insights
        const result = await pool.query(
          `SELECT 
            DATE_TRUNC($1, created_at) as period,
            COUNT(*) as transaction_count,
            SUM(amount) as total_volume,
            AVG(amount) as avg_amount,
            COUNT(DISTINCT user_id) as unique_users,
            COUNT(DISTINCT recipient_id) as unique_recipients,
            COUNT(DISTINCT category) as unique_categories,
            COUNT(DISTINCT country) as unique_countries
           FROM transactions
           WHERE created_at BETWEEN $2 AND $3
           GROUP BY DATE_TRUNC($1, created_at)
           ORDER BY period DESC`,
          [
            period || 'monthly',
            startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate || new Date()
          ]
        );

        const insights = result.rows.map(row => ({
          period: row.period,
          insights: [
            `Total transaction volume: ${row.total_volume}`,
            `Average transaction amount: ${row.avg_amount}`,
            `Unique users: ${row.unique_users}`,
            `Unique recipients: ${row.unique_recipients}`,
            `Unique categories: ${row.unique_categories}`,
            `Geographic spread: ${row.unique_countries} countries`
          ]
        }));

        res.json({
          status: 'success',
          data: insights
        });
      }
    } catch (error) {
      logger.error('Failed to get trend insights', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get trend insights'
      });
    }
  }
);

export default router; 