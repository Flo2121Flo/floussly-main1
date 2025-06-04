import { createClient } from 'redis';
import { logger } from '../utils/logger';
import { config } from '../config';

export class CacheService {
  private static instance: CacheService;
  private redis: ReturnType<typeof createClient>;
  private defaultTTL: number = 300; // 5 minutes

  private constructor() {
    this.redis = createClient({
      url: config.redis.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis connection lost after 10 retries');
            return new Error('Redis connection lost');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.redis.on('error', (error) => {
      logger.error('Redis client error:', error);
    });

    this.redis.connect().catch((error) => {
      logger.error('Failed to connect to Redis:', error);
    });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', { key, error });
      return null;
    }
  }

  public async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), {
        EX: ttl,
      });
    } catch (error) {
      logger.error('Cache set error:', { key, error });
    }
  }

  public async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.error('Cache delete error:', { key, error });
    }
  }

  public async clear(): Promise<void> {
    try {
      await this.redis.flushAll();
    } catch (error) {
      logger.error('Cache clear error:', error);
    }
  }

  public async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetchFn();
    await this.set(key, fresh, ttl);
    return fresh;
  }

  public async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.redis.incrBy(key, amount);
    } catch (error) {
      logger.error('Cache increment error:', { key, error });
      return 0;
    }
  }

  public async decrement(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.redis.decrBy(key, amount);
    } catch (error) {
      logger.error('Cache decrement error:', { key, error });
      return 0;
    }
  }

  public async getKeys(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      logger.error('Cache getKeys error:', { pattern, error });
      return [];
    }
  }

  public async getMultiple<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.redis.mGet(keys);
      return values.map((value) => (value ? JSON.parse(value) : null));
    } catch (error) {
      logger.error('Cache getMultiple error:', { keys, error });
      return keys.map(() => null);
    }
  }

  public async setMultiple(
    entries: Array<{ key: string; value: any; ttl?: number }>
  ): Promise<void> {
    try {
      const pipeline = this.redis.multi();
      for (const { key, value, ttl } of entries) {
        pipeline.set(key, JSON.stringify(value), {
          EX: ttl || this.defaultTTL,
        });
      }
      await pipeline.exec();
    } catch (error) {
      logger.error('Cache setMultiple error:', { entries, error });
    }
  }

  public async close(): Promise<void> {
    try {
      await this.redis.quit();
    } catch (error) {
      logger.error('Cache close error:', error);
    }
  }
} 