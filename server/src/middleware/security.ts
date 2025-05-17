import { Request, Response, NextFunction } from 'express';
import { verifyToken, blacklistToken } from '../services/TokenService';
import { checkMFAStatus, verifyMFA } from '../services/MFAService';
import { verifyBiometric } from '../services/BiometricService';
import { logger } from '../utils/logger';
import { redis } from '../config/redis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '../config/appConfig';
import { securityConfig, securityMiddleware, securityUtils } from '../config/security';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Rate limiter configuration
const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'security_middleware',
  points: securityConfig.rateLimit.max,
  duration: securityConfig.rateLimit.windowMs / 1000,
});

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.floussly.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
});

// IP blocking middleware
const ipBlocking = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip;
  const key = `blocked:${ip}`;
  
  try {
    const isBlocked = await redis.get(key);
    if (isBlocked) {
      logger.warn('Blocked IP attempt', { ip });
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  } catch (error) {
    logger.error('IP blocking check failed', { error: error.message });
    next();
  }
};

// Request validation middleware
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  // Check payload size
  if (req.headers['content-length'] && 
      parseInt(req.headers['content-length']) > securityConfig.validation.maxPayloadSize) {
    return res.status(413).json({ error: 'Payload too large' });
  }

  // Check for suspicious patterns
  if (securityUtils.checkSuspiciousPatterns(req.body)) {
    logger.warn('Suspicious pattern detected', { ip: req.ip });
    return res.status(400).json({ error: 'Invalid request' });
  }

  // Sanitize input
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = securityUtils.sanitizeInput(req.body[key]);
      }
    });
  }

  next();
};

// Token validation middleware
const validateToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    // Verify token with proper algorithm
    const decoded = jwt.verify(token, securityConfig.jwt.secret, {
      algorithms: [securityConfig.jwt.algorithm]
    });

    // Check token expiration
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ error: 'Token expired' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token validation failed', { error: error.message });
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// CSRF protection middleware
const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;

  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    logger.warn('CSRF token validation failed', { ip: req.ip });
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};

// Device fingerprinting middleware
const deviceFingerprinting = async (req: Request, res: Response, next: NextFunction) => {
  const fingerprint = req.headers['x-device-fingerprint'];
  
  if (!fingerprint) {
    return res.status(400).json({ error: 'Device fingerprint required' });
  }

  try {
    // Check if device is blocked
    const isBlocked = await redis.get(`blocked-device:${fingerprint}`);
    if (isBlocked) {
      return res.status(403).json({ error: 'Device blocked' });
    }

    // Store device info for tracking
    await redis.hset(`device:${fingerprint}`, {
      lastSeen: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    next();
  } catch (error) {
    logger.error('Device fingerprinting failed', { error: error.message });
    next();
  }
};

// Export security middleware
export const securityMiddleware = [
  securityHeaders,
  rateLimit(securityConfig.rateLimit),
  ipBlocking,
  validateRequest,
  validateToken,
  csrfProtection,
  deviceFingerprinting
];

// MFA verification middleware
export const mfaVerificationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.user;
    const { mfaCode } = req.body;

    const verified = await verifyMFA(userId, mfaCode);
    if (!verified) {
      logger.warn('MFA verification failed', { userId });
      return res.status(403).json({ error: 'Invalid MFA code' });
    }

    next();
  } catch (error) {
    logger.error('MFA verification error', {
      error: error.message,
      userId: req.user?.userId
    });

    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Biometric verification middleware
export const biometricVerificationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.user;
    const { biometricData } = req.body;

    const verified = await verifyBiometric(userId, biometricData);
    if (!verified) {
      logger.warn('Biometric verification failed', { userId });
      return res.status(403).json({ error: 'Biometric verification failed' });
    }

    next();
  } catch (error) {
    logger.error('Biometric verification error', {
      error: error.message,
      userId: req.user?.userId
    });

    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Token blacklist middleware
export const tokenBlacklistMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    await blacklistToken(token);
    next();
  } catch (error) {
    logger.error('Token blacklist error', {
      error: error.message,
      userId: req.user?.userId
    });

    return res.status(500).json({ error: 'Internal server error' });
  }
}; 