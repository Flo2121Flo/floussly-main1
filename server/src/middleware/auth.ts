import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { redis } from '../utils/redis';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { sanitizeInput } from '../utils/validators';
import { config } from '../config/config';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userId: string;
      };
    }
  }
}

// Rate limiting configuration
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// JWT verification middleware
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string; userId: string };
    req.user = decoded;
    next();
  } catch (error: any) {
    logger.error('Authentication error', { error: error.message });
    res.status(401).json({ error: 'Invalid token' });
  }
};

// MFA requirement middleware
export const requireMFA = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const isMFAVerified = await redis.get(`mfa:verified:${userId}`);

    if (!isMFAVerified) {
      return res.status(403).json({ error: 'MFA verification required' });
    }

    next();
  } catch (error) {
    logger.error('MFA verification error', {
      error: error.message,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'MFA verification failed' });
  }
};

// Biometric verification middleware
export const requireBiometric = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const isBiometricVerified = await redis.get(`biometric:verified:${userId}`);

    if (!isBiometricVerified) {
      return res.status(403).json({ error: 'Biometric verification required' });
    }

    next();
  } catch (error) {
    logger.error('Biometric verification error', {
      error: error.message,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ error: 'Biometric verification failed' });
  }
};

// Admin access middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.tier !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Input sanitization middleware
export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }
  next();
};

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.floussly.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
}); 