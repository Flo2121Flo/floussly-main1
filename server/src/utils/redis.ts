import Redis from 'ioredis';
import { logger } from './logger';
import { config } from '../config/config';

const redisOptions: Redis.RedisOptions = {
  host: config.REDIS_HOST || 'localhost',
  port: parseInt(config.REDIS_PORT || '6379', 10),
  password: config.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

export const redis = new Redis(redisOptions);

redis.on('error', (error: Error) => {
  logger.error('Redis connection error:', { error: error.message });
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

export async function setSession(userId: string, sessionData: any): Promise<void> {
  try {
    await redis.setex(
      `session:${userId}`,
      3600, // 1 hour expiry
      JSON.stringify(sessionData)
    );
  } catch (error) {
    const err = error as Error;
    logger.error('Error setting session', { error: err.message, userId });
    throw new Error(`Failed to set session: ${err.message}`);
  }
}

export async function getSession(userId: string): Promise<any> {
  try {
    const data = await redis.get(`session:${userId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    const err = error as Error;
    logger.error('Error getting session', { error: err.message, userId });
    throw new Error(`Failed to get session: ${err.message}`);
  }
}

export async function deleteSession(userId: string): Promise<void> {
  try {
    await redis.del(`session:${userId}`);
  } catch (error) {
    const err = error as Error;
    logger.error('Error deleting session', { error: err.message, userId });
    throw new Error(`Failed to delete session: ${err.message}`);
  }
}

export async function checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, window);
    }
    return current <= limit;
  } catch (error) {
    const err = error as Error;
    logger.error('Rate limit check error', { error: err.message, key });
    throw new Error(`Failed to check rate limit: ${err.message}`);
  }
}

export async function getRemainingAttempts(key: string): Promise<number> {
  try {
    const attempts = await redis.get(key);
    return attempts ? parseInt(attempts, 10) : 0;
  } catch (error) {
    const err = error as Error;
    logger.error('Error getting remaining attempts', { error: err.message, key });
    throw new Error(`Failed to get remaining attempts: ${err.message}`);
  }
}

export async function setCache(key: string, value: any, expiry: number): Promise<void> {
  try {
    await redis.setex(key, expiry, JSON.stringify(value));
  } catch (error) {
    const err = error as Error;
    logger.error('Error setting cache', { error: err.message, key });
    throw new Error(`Failed to set cache: ${err.message}`);
  }
}

export async function getCache(key: string): Promise<any> {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    const err = error as Error;
    logger.error('Error getting cache', { error: err.message, key });
    throw new Error(`Failed to get cache: ${err.message}`);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    const err = error as Error;
    logger.error('Error deleting cache', { error: err.message, key });
    throw new Error(`Failed to delete cache: ${err.message}`);
  }
}

export async function clearCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    const err = error as Error;
    logger.error('Error clearing cache pattern', { error: err.message, pattern });
    throw new Error(`Failed to clear cache pattern: ${err.message}`);
  }
}

export async function addDevice(userId: string, deviceId: string, deviceData: any): Promise<void> {
  try {
    await redis.hset(
      `devices:${userId}`,
      deviceId,
      JSON.stringify(deviceData)
    );
  } catch (error) {
    const err = error as Error;
    logger.error('Error adding device', { error: err.message, userId, deviceId });
    throw new Error(`Failed to add device: ${err.message}`);
  }
}

export async function removeDevice(userId: string, deviceId: string): Promise<void> {
  try {
    await redis.hdel(`devices:${userId}`, deviceId);
  } catch (error) {
    const err = error as Error;
    logger.error('Error removing device', { error: err.message, userId, deviceId });
    throw new Error(`Failed to remove device: ${err.message}`);
  }
}

export async function getDeviceToken(userId: string, deviceId: string): Promise<string | null> {
  try {
    const deviceData = await redis.hget(`devices:${userId}`, deviceId);
    if (!deviceData) {
      return null;
    }
    const data = JSON.parse(deviceData);
    return data.token || null;
  } catch (error) {
    const err = error as Error;
    logger.error('Error getting device token', { error: err.message, userId, deviceId });
    throw new Error(`Failed to get device token: ${err.message}`);
  }
}

// Export Redis client for direct use
export default redis; 