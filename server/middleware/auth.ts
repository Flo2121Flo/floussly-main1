import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth';
import { AppError } from '../utils/errors';
import { rateLimit } from 'express-rate-limit';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Redis client
const redis = new Redis();

// Rate limiting configuration
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        sessionId: string;
      };
    }
  }
}

// Token validation middleware
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const authService = AuthService.getInstance();

    const isValid = await authService.validateToken(token, req);
    if (!isValid) {
      throw new AppError('Invalid or expired token', 401);
    }

    // Decode token to get user info
    const decoded = jwt.decode(token) as any;
    req.user = {
      id: decoded.userId,
      sessionId: decoded.sessionId
    };

    next();
  } catch (error) {
    logger.error('Authentication error', { 
      path: req.path,
      ip: req.ip,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  }
};

// Role-based access control middleware
export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { role: true }
      });

      if (!user || !roles.includes(user.role)) {
        throw new AppError('Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      logger.error('Authorization error', {
        path: req.path,
        userId: req.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(403).json({ error: 'Authorization failed' });
      }
    }
  };
};

// Session validation middleware
export const validateSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.sessionId) {
      throw new AppError('Invalid session', 401);
    }

    const sessionData = await redis.get(`session:${req.user.sessionId}`);
    if (!sessionData) {
      throw new AppError('Session expired', 401);
    }

    const { lastActivity } = JSON.parse(sessionData);
    const inactiveTime = Date.now() - lastActivity;

    // Force re-authentication after 24 hours of inactivity
    if (inactiveTime > 24 * 60 * 60 * 1000) {
      throw new AppError('Session expired due to inactivity', 401);
    }

    next();
  } catch (error) {
    logger.error('Session validation error', {
      path: req.path,
      userId: req.user?.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(401).json({ error: 'Session validation failed' });
    }
  }
}; 