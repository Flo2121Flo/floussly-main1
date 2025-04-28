import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { AppError } from '../utils/error';
import logger from '../utils/logger';

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

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as jwt.JwtPayload;
    
    if (!decoded.sub) {
      throw new AppError('Invalid token', 401);
    }

    const user = await cognito.getUser({
      AccessToken: token
    });

    if (!user.UserAttributes) {
      throw new AppError('User not found', 404);
    }

    const email = user.UserAttributes.find(attr => attr.Name === 'email')?.Value;
    const phone = user.UserAttributes.find(attr => attr.Name === 'phone_number')?.Value;
    const role = user.UserAttributes.find(attr => attr.Name === 'custom:role')?.Value || 'user';

    req.user = {
      email: email || '',
      phone: phone || '',
      role
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    next(new AppError('Authentication failed', 401));
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
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