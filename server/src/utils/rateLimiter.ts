import { redis } from './redis';
import { logger } from './logger';

interface RateLimiterOptions {
  points: number;        // Number of points allowed
  duration: number;      // Time window in seconds
  blockDuration: number; // Block duration in seconds if limit exceeded
}

export class RateLimiter {
  private readonly options: RateLimiterOptions;

  constructor(options: RateLimiterOptions) {
    this.options = options;
  }

  async consume(key: string): Promise<boolean> {
    try {
      const now = Date.now();
      const windowKey = `ratelimit:${key}:${Math.floor(now / (this.options.duration * 1000))}`;
      const blockKey = `ratelimit:${key}:blocked`;

      // Check if key is blocked
      const isBlocked = await redis.get(blockKey);
      if (isBlocked) {
        logger.warn('Rate limit blocked', {
          key,
          timestamp: new Date().toISOString()
        });
        return false;
      }

      // Get current points
      const points = await redis.incr(windowKey);
      await redis.expire(windowKey, this.options.duration);

      // If first request in window, set expiry
      if (points === 1) {
        await redis.expire(windowKey, this.options.duration);
      }

      // Check if limit exceeded
      if (points > this.options.points) {
        // Block the key
        await redis.setex(blockKey, this.options.blockDuration, '1');
        
        logger.warn('Rate limit exceeded', {
          key,
          points,
          limit: this.options.points,
          timestamp: new Date().toISOString()
        });
        
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in rate limiter', {
        error: error.message,
        key,
        timestamp: new Date().toISOString()
      });
      // Fail open in case of Redis issues
      return true;
    }
  }

  async getRemainingPoints(key: string): Promise<number> {
    try {
      const now = Date.now();
      const windowKey = `ratelimit:${key}:${Math.floor(now / (this.options.duration * 1000))}`;
      
      const points = await redis.get(windowKey);
      return this.options.points - (parseInt(points || '0'));
    } catch (error) {
      logger.error('Error getting remaining points', {
        error: error.message,
        key,
        timestamp: new Date().toISOString()
      });
      return 0;
    }
  }

  async reset(key: string): Promise<void> {
    try {
      const now = Date.now();
      const windowKey = `ratelimit:${key}:${Math.floor(now / (this.options.duration * 1000))}`;
      const blockKey = `ratelimit:${key}:blocked`;

      await Promise.all([
        redis.del(windowKey),
        redis.del(blockKey)
      ]);

      logger.info('Rate limit reset', {
        key,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error resetting rate limit', {
        error: error.message,
        key,
        timestamp: new Date().toISOString()
      });
    }
  }
}

// Predefined rate limiters
export const rateLimiters = {
  // API endpoints
  api: new RateLimiter({
    points: 100,
    duration: 60,
    blockDuration: 300
  }),

  // Authentication
  auth: new RateLimiter({
    points: 5,
    duration: 300,
    blockDuration: 900
  }),

  // SMS verification
  sms: new RateLimiter({
    points: 3,
    duration: 300,
    blockDuration: 1800
  }),

  // File uploads
  upload: new RateLimiter({
    points: 10,
    duration: 60,
    blockDuration: 300
  }),

  // Transactions
  transaction: new RateLimiter({
    points: 50,
    duration: 3600,
    blockDuration: 7200
  })
};

export default RateLimiter; 