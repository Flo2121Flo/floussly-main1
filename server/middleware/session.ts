import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';
import { config } from '../config';
import { AppError } from '../utils/error';
import { logger } from '../utils/logger';

const redis = new Redis(config.redis.url);

export const sessionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return next();
    }

    // Check if token is invalidated
    const isInvalidated = await redis.get(`invalidated_token:${token}`);
    if (isInvalidated) {
      throw new AppError("Session invalidated", 401, "SESSION_INVALIDATED");
    }

    // Add token to request for later use
    req.token = token;
    next();
  } catch (error) {
    next(error);
  }
};

export const invalidateSession = async (token: string): Promise<void> => {
  try {
    // Add token to invalidated tokens set with expiration
    await redis.set(
      `invalidated_token:${token}`,
      '1',
      'EX',
      24 * 60 * 60 // 24 hours
    );

    logger.info("Session invalidated", { token });
  } catch (error) {
    logger.error("Failed to invalidate session", { error, token });
    throw error;
  }
};

export const invalidateAllUserSessions = async (userId: string): Promise<void> => {
  try {
    // Get all active sessions for user
    const sessions = await redis.smembers(`user_sessions:${userId}`);
    
    // Invalidate each session
    await Promise.all(sessions.map(session => 
      invalidateSession(session)
    ));

    // Clear user's sessions set
    await redis.del(`user_sessions:${userId}`);

    logger.info("All user sessions invalidated", { userId });
  } catch (error) {
    logger.error("Failed to invalidate all user sessions", { error, userId });
    throw error;
  }
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      token?: string;
    }
  }
} 