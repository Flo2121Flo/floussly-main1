import { Request, Response, NextFunction } from 'express';
import { redis } from '../db/redis';
import { logger } from '../utils/logger';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
};

export const createRateLimiter = (config: Partial<RateLimitConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `rate-limit:${req.ip}`;
    
    try {
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, Math.floor(finalConfig.windowMs / 1000));
      }

      const remaining = Math.max(0, finalConfig.max - current);
      res.setHeader('X-RateLimit-Limit', finalConfig.max);
      res.setHeader('X-RateLimit-Remaining', remaining);

      if (current > finalConfig.max) {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        return res.status(429).json({
          error: finalConfig.message
        });
      }

      next();
    } catch (error) {
      logger.error('Rate limiter error:', error);
      next(); // Fail open if Redis is down
    }
  };
};

// Specific rate limiters for different endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: 'Too many login attempts, please try again later.'
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many API requests, please try again later.'
});

export const webhookRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 webhook calls per minute
  message: 'Too many webhook calls, please try again later.'
}); 