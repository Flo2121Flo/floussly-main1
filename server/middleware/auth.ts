import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { AppError } from '../utils/error';
import logger from '../utils/logger';
import prisma from '../database/schema';

// Extend Express Request type to include user
declare module 'express' {
  interface Request {
    user?: {
      email: string;
      phone: string;
      role: string;
    };
  }
}

const cognito = new CognitoIdentityProvider({
  region: process.env.AWS_REGION || 'us-east-1'
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        kyc_status: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Unauthorized access', 403));
    }

    next();
  };
};

export const validateToken = async (token: string): Promise<boolean> => {
  try {
    await cognito.getUser({
      AccessToken: token
    });
    return true;
  } catch (error) {
    logger.error('Token validation error:', error);
    return false;
  }
};

export const requireKycApproved = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Here you would check the user's KYC status from your user service
    // For now, we'll just pass through
    next();
  } catch (error) {
    logger.error('KYC verification failed:', error);
    res.status(500).json({ error: 'KYC verification failed' });
  }
}; 