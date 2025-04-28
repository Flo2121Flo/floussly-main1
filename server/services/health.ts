import { DatabaseService } from './database';
import { RedisService } from './redis';
import { logger } from '../utils/logger';

export class HealthService {
  private db: DatabaseService;
  private redis: RedisService;

  constructor() {
    this.db = new DatabaseService();
    this.redis = new RedisService();
  }

  // Check system health
  async checkHealth() {
    try {
      const [dbStatus, redisStatus] = await Promise.all([
        this.checkDatabase(),
        this.checkRedis(),
      ]);

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          database: dbStatus,
          redis: redisStatus,
        },
      };
    } catch (error) {
      logger.error('Health check failed:', error);
      throw error;
    }
  }

  // Check database health
  async checkDatabase() {
    try {
      const isConnected = await this.db.checkConnection();
      return {
        status: isConnected ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        service: 'database',
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'database',
        error: error.message,
      };
    }
  }

  // Check Redis health
  async checkRedis() {
    try {
      const pingResult = await this.redis.ping();
      return {
        status: pingResult === 'PONG' ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        service: 'redis',
      };
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'redis',
        error: error.message,
      };
    }
  }
} 