import Redis from 'ioredis';
import { logger } from './logger';

// Redis client configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

// Create Redis client
export const redis = new Redis(redisConfig);

// Handle Redis connection events
redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error('Redis connection error', { error: error.message });
});

// Session management
export const sessionManager = {
  async setSession(userId: string, sessionData: any, ttl: number = 3600): Promise<void> {
    try {
      const key = `session:${userId}`;
      await redis.setex(key, ttl, JSON.stringify(sessionData));
    } catch (error) {
      logger.error('Error setting session', { error: error.message, userId });
      throw error;
    }
  },

  async getSession(userId: string): Promise<any> {
    try {
      const key = `session:${userId}`;
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Error getting session', { error: error.message, userId });
      throw error;
    }
  },

  async deleteSession(userId: string): Promise<void> {
    try {
      const key = `session:${userId}`;
      await redis.del(key);
    } catch (error) {
      logger.error('Error deleting session', { error: error.message, userId });
      throw error;
    }
  }
};

// Rate limiting
export const rateLimiter = {
  async checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, window);
      }
      return current <= limit;
    } catch (error) {
      logger.error('Rate limit check error', { error: error.message, key });
      throw error;
    }
  },

  async getRemainingAttempts(key: string): Promise<number> {
    try {
      const current = await redis.get(key);
      return current ? parseInt(current) : 0;
    } catch (error) {
      logger.error('Error getting remaining attempts', { error: error.message, key });
      throw error;
    }
  }
};

// Cache management
export const cacheManager = {
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Error setting cache', { error: error.message, key });
      throw error;
    }
  },

  async get(key: string): Promise<any> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Error getting cache', { error: error.message, key });
      throw error;
    }
  },

  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Error deleting cache', { error: error.message, key });
      throw error;
    }
  },

  async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error('Error clearing cache pattern', { error: error.message, pattern });
      throw error;
    }
  }
};

// Device management
export const deviceManager = {
  async addDevice(userId: string, deviceId: string, token: string): Promise<void> {
    try {
      const key = `device:${userId}:${deviceId}`;
      await redis.setex(key, 2592000, token); // 30 days
    } catch (error) {
      logger.error('Error adding device', { error: error.message, userId, deviceId });
      throw error;
    }
  },

  async removeDevice(userId: string, deviceId: string): Promise<void> {
    try {
      const key = `device:${userId}:${deviceId}`;
      await redis.del(key);
    } catch (error) {
      logger.error('Error removing device', { error: error.message, userId, deviceId });
      throw error;
    }
  },

  async getDeviceToken(userId: string, deviceId: string): Promise<string | null> {
    try {
      const key = `device:${userId}:${deviceId}`;
      return await redis.get(key);
    } catch (error) {
      logger.error('Error getting device token', { error: error.message, userId, deviceId });
      throw error;
    }
  }
};

// Export Redis client for direct use
export default redis; 