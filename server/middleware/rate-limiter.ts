import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../redis/redis';
import { config } from '../config';
import logger from '../services/logging';

// Rate limit configuration
interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

// Create rate limiter
export const createRateLimiter = (config: RateLimitConfig) => {
  return rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: 'rate-limit:',
    }),
    windowMs: config.windowMs,
    max: config.max,
    message: config.message || 'Too many requests, please try again later.',
    standardHeaders: config.standardHeaders ?? true,
    legacyHeaders: config.legacyHeaders ?? false,
    skipFailedRequests: config.skipFailedRequests ?? false,
    keyGenerator: config.keyGenerator || ((req) => {
      // Use IP address as default key
      return req.ip;
    }),
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userId: req.user?.id,
        path: req.path,
      });
      
      res.status(429).json({
        error: 'Too many requests, please try again later.',
        retryAfter: res.getHeader('Retry-After'),
      });
    },
  });
};

// IP-based rate limiter
export const ipRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
});

// User-based rate limiter
export const userRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window
  message: 'Too many requests from this user, please try again later.',
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
});

// Login attempt rate limiter
export const loginRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: 'Too many login attempts, please try again later.',
  keyGenerator: (req) => {
    return `login:${req.body.email || req.ip}`;
  },
});

// Transaction rate limiter
export const transactionRateLimit = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 50, // 50 transactions per day
  message: 'Transaction limit exceeded, please try again tomorrow.',
  keyGenerator: (req) => {
    return `transaction:${req.user?.id}`;
  },
});

// API rate limiter
export const apiRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'API rate limit exceeded, please try again later.',
});

// Dynamic rate limiter based on user tier
export const dynamicRateLimit = (req: any, res: any, next: any) => {
  const userTier = req.user?.tier || 'basic';
  const limits = {
    basic: {
      windowMs: 60 * 1000,
      max: 30,
    },
    premium: {
      windowMs: 60 * 1000,
      max: 100,
    },
    enterprise: {
      windowMs: 60 * 1000,
      max: 300,
    },
  };
  
  const limit = limits[userTier as keyof typeof limits] || limits.basic;
  
  return createRateLimiter({
    windowMs: limit.windowMs,
    max: limit.max,
    keyGenerator: (req) => `dynamic:${req.user?.id}`,
  })(req, res, next);
};

// Export rate limiter middleware
export const rateLimit = {
  ip: ipRateLimit,
  user: userRateLimit,
  login: loginRateLimit,
  transaction: transactionRateLimit,
  api: apiRateLimit,
  dynamic: dynamicRateLimit,
};

// Apply rate limiting based on path
export const applyRateLimiting = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path;
  
  if (path.startsWith('/auth')) {
    return rateLimit.ip(req, res, next);
  }
  
  if (path.startsWith('/wallet')) {
    return rateLimit.user(req, res, next);
  }
  
  if (path.startsWith('/kyc')) {
    return rateLimit.dynamic(req, res, next);
  }
  
  return rateLimit.api(req, res, next);
}; 