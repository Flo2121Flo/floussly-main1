import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { redis } from '../utils/redis';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { sanitizeInput } from '../utils/validators';

// Rate limiting configuration
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// JWT verification middleware
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for token in cookies first, then headers
    const token = req.cookies.auth_token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token has been invalidated' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Check if user's tier has changed
    if (user.tier !== decoded.tier) {
      return res.status(401).json({ error: 'Session invalidated due to account changes' });
    }

    // Add user to request
    req.user = user;

    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    next();
  } catch (error) {
    logger.error('Authentication error', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
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