import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { RedisService } from '../redis/redis';
import { logger } from '../utils/logger';

// Get Redis client instance
const redisClient = RedisService.getInstance().getClient();

// Common rate limit configuration
const commonConfig = {
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate_limit:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    
    res.status(429).json({
      error: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    });
  },
};

// Create rate limiters for different endpoints
export const authLimiter = rateLimit({
  ...commonConfig,
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 attempts per minute
  keyGenerator: (req) => `${req.ip}:auth`,
});

export const walletLimiter = rateLimit({
  ...commonConfig,
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  keyGenerator: (req) => `${req.ip}:wallet:${req.user?.id || 'anonymous'}`,
});

export const kycLimiter = rateLimit({
  ...commonConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  keyGenerator: (req) => `${req.ip}:kyc:${req.user?.id || 'anonymous'}`,
});

export const apiLimiter = rateLimit({
  ...commonConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  keyGenerator: (req) => `${req.ip}:api`,
});

// Apply rate limiting based on path
export const applyRateLimiting = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path;
  
  if (path.startsWith('/auth')) {
    return authLimiter(req, res, next);
  }
  
  if (path.startsWith('/wallet')) {
    return walletLimiter(req, res, next);
  }
  
  if (path.startsWith('/kyc')) {
    return kycLimiter(req, res, next);
  }
  
  return apiLimiter(req, res, next);
}; 