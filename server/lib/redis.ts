import Redis from 'ioredis';
import { config } from '../config';
import logger from '../utils/logger';

export const redis = new Redis(config.redis.url, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  logger.info('Connected to Redis');
});

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

redis.on('ready', () => {
  logger.info('Redis client ready');
});

redis.on('reconnecting', () => {
  logger.warn('Reconnecting to Redis...');
});

redis.on('end', () => {
  logger.warn('Redis connection ended');
});

// Handle process termination
process.on('SIGINT', () => {
  redis.quit();
  process.exit(0);
});

process.on('SIGTERM', () => {
  redis.quit();
  process.exit(0);
});

// Export Redis methods with error handling
export const getCache = async (key: string): Promise<string | null> => {
  try {
    return await redis.get(key);
  } catch (error) {
    logger.error('Redis get error:', error);
    return null;
  }
};

export const setCache = async (
  key: string,
  value: string,
  expiry?: number
): Promise<void> => {
  try {
    if (expiry) {
      await redis.set(key, value, 'EX', expiry);
    } else {
      await redis.set(key, value);
    }
  } catch (error) {
    logger.error('Redis set error:', error);
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (error) {
    logger.error('Redis delete error:', error);
  }
};

export const clearCache = async (): Promise<void> => {
  try {
    await redis.flushall();
  } catch (error) {
    logger.error('Redis clear error:', error);
  }
}; 