import { Router } from 'express';
import {
  basicHealthCheck,
  detailedHealthCheck,
  metrics,
  readiness,
  liveness,
} from '../controllers/health';
import { rateLimit } from '../middleware/rate-limiter';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import config from '../config';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();
const redis = new Redis(config.redis.url);

// Basic health check - no rate limiting
router.get('/', basicHealthCheck);

// Detailed health check - rate limited
router.get('/detailed', rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
}), detailedHealthCheck);

// Metrics endpoint - rate limited
router.get('/metrics', rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
}), metrics);

// Kubernetes probes - no rate limiting
router.get('/ready', readiness);
router.get('/live', liveness);

router.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    services: {
      database: 'OK',
      redis: 'OK',
      aws: 'OK'
    }
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    health.services.database = 'ERROR';
    logger.error('Database health check failed:', error);
  }

  try {
    // Check Redis connection
    await redis.ping();
  } catch (error) {
    health.services.redis = 'ERROR';
    logger.error('Redis health check failed:', error);
  }

  try {
    // Check AWS services
    const awsServices = ['s3', 'cognito', 'kms'];
    for (const service of awsServices) {
      if (!config[service]) {
        health.services.aws = 'ERROR';
        logger.error(`AWS ${service} configuration missing`);
      }
    }
  } catch (error) {
    health.services.aws = 'ERROR';
    logger.error('AWS health check failed:', error);
  }

  const isHealthy = Object.values(health.services).every(status => status === 'OK');
  res.status(isHealthy ? 200 : 503).json(health);
});

export default router; 