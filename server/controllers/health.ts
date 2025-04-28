import { Request, Response } from 'express';
import { DatabaseService } from '../database/db';
import { RedisService } from '../redis/redis';
import { logError, logInfo } from '../utils/logger';

export class HealthController {
  private db: DatabaseService;
  private redis: RedisService;

  constructor() {
    this.db = DatabaseService.getInstance();
    this.redis = RedisService.getInstance();
  }

  async checkHealth(req: Request, res: Response): Promise<void> {
    try {
      // Check database connection
      await this.db.query('SELECT 1');
      
      // Check Redis connection
      await this.redis.ping();
      
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          redis: 'connected'
        }
      };

      logInfo('Health check passed', healthStatus);
      res.json(healthStatus);
    } catch (error) {
      const errorStatus = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      if (error instanceof Error) {
        logError(error, 'Health check failed');
      } else {
        logError(new Error('Health check failed'), JSON.stringify(errorStatus));
      }
      res.status(500).json(errorStatus);
    }
  }

  async checkDatabase(req: Request, res: Response): Promise<void> {
    try {
      await this.db.query('SELECT 1');
      const status = {
        status: 'healthy',
        service: 'database',
        timestamp: new Date().toISOString()
      };

      logInfo('Database health check passed', status);
      res.json(status);
    } catch (error) {
      const errorStatus = {
        status: 'unhealthy',
        service: 'database',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      if (error instanceof Error) {
        logError(error, 'Database health check failed');
      } else {
        logError(new Error('Database health check failed'), JSON.stringify(errorStatus));
      }
      res.status(500).json(errorStatus);
    }
  }

  async checkRedis(req: Request, res: Response): Promise<void> {
    try {
      await this.redis.ping();
      const status = {
        status: 'healthy',
        service: 'redis',
        timestamp: new Date().toISOString()
      };

      logInfo('Redis health check passed', status);
      res.json(status);
    } catch (error) {
      const errorStatus = {
        status: 'unhealthy',
        service: 'redis',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      if (error instanceof Error) {
        logError(error, 'Redis health check failed');
      } else {
        logError(new Error('Redis health check failed'), JSON.stringify(errorStatus));
      }
      res.status(500).json(errorStatus);
    }
  }
} 