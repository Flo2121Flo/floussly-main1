import { Request, Response } from 'express';
import { CloudWatch } from 'aws-sdk';
import { config } from '../config';
import logger from '../services/logging';
import { redis } from '../redis/redis';
import { db } from '../database/db';

const cloudWatch = new CloudWatch({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

// Basic health check
export const basicHealthCheck = async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.environment,
    });
  } catch (error) {
    logger.error('Basic health check failed', { error });
    res.status(500).json({
      status: 'unhealthy',
      error: 'Health check failed',
    });
  }
};

// Detailed health check
export const detailedHealthCheck = async (req: Request, res: Response) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.environment,
    services: {
      database: 'healthy',
      redis: 'healthy',
      aws: 'healthy',
    },
    metrics: {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    },
  };

  try {
    // Check database connection
    await db.raw('SELECT 1');
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'unhealthy';
    logger.error('Database health check failed', { error });
  }

  try {
    // Check Redis connection
    await redis.ping();
  } catch (error) {
    health.services.redis = 'unhealthy';
    health.status = 'unhealthy';
    logger.error('Redis health check failed', { error });
  }

  try {
    // Check AWS services
    await cloudWatch.describeAlarms().promise();
  } catch (error) {
    health.services.aws = 'unhealthy';
    health.status = 'unhealthy';
    logger.error('AWS health check failed', { error });
  }

  res.status(health.status === 'healthy' ? 200 : 503).json(health);
};

// Metrics endpoint
export const metrics = async (req: Request, res: Response) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime(),
      },
      database: {
        connections: await db.raw('SELECT count(*) FROM pg_stat_activity'),
      },
      redis: {
        memory: await redis.info('memory'),
        clients: await redis.info('clients'),
      },
    };

    // Send metrics to CloudWatch
    await cloudWatch.putMetricData({
      Namespace: 'Floussly/Health',
      MetricData: [
        {
          MetricName: 'MemoryUsage',
          Value: metrics.system.memory.heapUsed,
          Unit: 'Bytes',
          Timestamp: new Date(),
        },
        {
          MetricName: 'DatabaseConnections',
          Value: metrics.database.connections.rows[0].count,
          Unit: 'Count',
          Timestamp: new Date(),
        },
      ],
    }).promise();

    res.status(200).json(metrics);
  } catch (error) {
    logger.error('Metrics collection failed', { error });
    res.status(500).json({
      error: 'Failed to collect metrics',
    });
  }
};

// Readiness probe
export const readiness = async (req: Request, res: Response) => {
  try {
    // Check if the application is ready to handle traffic
    const isReady = await Promise.all([
      db.raw('SELECT 1'),
      redis.ping(),
    ]).then(() => true)
      .catch(() => false);

    if (isReady) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready' });
    }
  } catch (error) {
    logger.error('Readiness check failed', { error });
    res.status(503).json({ status: 'not ready' });
  }
};

// Liveness probe
export const liveness = async (req: Request, res: Response) => {
  try {
    // Check if the application is alive and functioning
    const isAlive = process.memoryUsage().heapUsed < 1024 * 1024 * 1024; // 1GB limit

    if (isAlive) {
      res.status(200).json({ status: 'alive' });
    } else {
      res.status(503).json({ status: 'not alive' });
    }
  } catch (error) {
    logger.error('Liveness check failed', { error });
    res.status(503).json({ status: 'not alive' });
  }
}; 