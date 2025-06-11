import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { AppError } from '../utils/error';
import { logger } from '../utils/logger';

// Rate limit configurations
const rateLimits = {
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
  },
  auth: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later'
  },
  transactions: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 50, // limit each IP to 50 requests per windowMs
    message: 'Transaction limit exceeded, please try again later'
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 30, // limit each IP to 30 requests per windowMs
    message: 'API rate limit exceeded, please try again later'
  }
};

// Custom handler for rate limit exceeded
const rateLimitHandler = (req: Request, res: Response) => {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    path: req.path,
    method: req.method
  });

  throw new AppError(
    'Too many requests',
    429,
    'RATE_LIMIT_EXCEEDED',
    { retryAfter: res.getHeader('Retry-After') }
  );
};

// Create rate limiters
export const defaultLimiter = rateLimit({
  ...rateLimits.default,
  handler: rateLimitHandler
});

export const authLimiter = rateLimit({
  ...rateLimits.auth,
  handler: rateLimitHandler
});

export const transactionLimiter = rateLimit({
  ...rateLimits.transactions,
  handler: rateLimitHandler
});

export const apiLimiter = rateLimit({
  ...rateLimits.api,
  handler: rateLimitHandler
});

// Dynamic rate limiter based on user role
export const dynamicRateLimiter = (req: Request, res: Response, next: Function) => {
  const user = req.user;
  
  if (!user) {
    return defaultLimiter(req, res, next);
  }

  // Adjust limits based on user role
  const limits = {
    ADMIN: {
      windowMs: 60 * 1000,
      max: 100
    },
    PREMIUM: {
      windowMs: 60 * 1000,
      max: 50
    },
    STANDARD: {
      windowMs: 60 * 1000,
      max: 30
    }
  };

  const userLimit = limits[user.role] || limits.STANDARD;

  return rateLimit({
    ...userLimit,
    handler: rateLimitHandler
  })(req, res, next);
};

// IP-based rate limiter with dynamic limits
export const ipBasedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req: Request) => {
    // Adjust limits based on IP reputation
    const ip = req.ip;
    // TODO: Implement IP reputation check
    return 100; // Default limit
  },
  handler: rateLimitHandler
}); 