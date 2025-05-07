import { Request, Response, NextFunction } from 'express';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { config } from '../config';
import { logger, logSecurityEvent } from '../utils/logger';
import { AuthenticationError, AuthorizationError } from '../utils/error';

// Initialize Cognito client
const cognito = new CognitoIdentityProvider({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email: string;
        phoneNumber?: string;
        groups?: string[];
      };
    }
  }
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Cognito
    const response = await cognito.getUser({
      AccessToken: token,
    });

    if (!response.Username) {
      throw new AuthenticationError('Invalid token');
    }

    // Get user groups
    const groupsResponse = await cognito.adminListGroupsForUser({
      UserPoolId: config.aws.cognito.userPoolId,
      Username: response.Username,
    });

    // Set user info in request
    req.user = {
      sub: response.Username,
      email: response.UserAttributes?.find(attr => attr.Name === 'email')?.Value || '',
      phoneNumber: response.UserAttributes?.find(attr => attr.Name === 'phone_number')?.Value,
      groups: groupsResponse.Groups?.map(group => group.GroupName) || [],
    };

    next();
  } catch (error) {
    logSecurityEvent('AUTHENTICATION_FAILED', {
      path: req.path,
      ip: req.ip,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(new AuthenticationError('Authentication failed'));
  }
};

// Role-based authorization middleware
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('User not authenticated'));
    }

    const hasRole = roles.some(role => req.user?.groups?.includes(role));

    if (!hasRole) {
      logSecurityEvent('AUTHORIZATION_FAILED', {
        path: req.path,
        ip: req.ip,
        userId: req.user.sub,
        requiredRoles: roles,
        userRoles: req.user.groups,
      });
      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
};

// Optional authentication middleware
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Cognito
    const response = await cognito.getUser({
      AccessToken: token,
    });

    if (!response.Username) {
      return next();
    }

    // Get user groups
    const groupsResponse = await cognito.adminListGroupsForUser({
      UserPoolId: config.aws.cognito.userPoolId,
      Username: response.Username,
    });

    // Set user info in request
    req.user = {
      sub: response.Username,
      email: response.UserAttributes?.find(attr => attr.Name === 'email')?.Value || '',
      phoneNumber: response.UserAttributes?.find(attr => attr.Name === 'phone_number')?.Value,
      groups: groupsResponse.Groups?.map(group => group.GroupName) || [],
    };

    next();
  } catch (error) {
    // Log error but don't fail the request
    logger.warn('Optional authentication failed', {
      path: req.path,
      ip: req.ip,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next();
  }
};

// Verify phone number middleware
export const verifyPhoneNumber = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AuthenticationError('User not authenticated'));
  }

  if (!req.user.phoneNumber) {
    return next(new AuthorizationError('Phone number verification required'));
  }

  try {
    // Check if phone number is verified in Cognito
    const response = await cognito.adminGetUser({
      UserPoolId: config.aws.cognito.userPoolId,
      Username: req.user.sub,
    });

    const phoneVerified = response.UserAttributes?.find(
      attr => attr.Name === 'phone_number_verified'
    )?.Value === 'true';

    if (!phoneVerified) {
      return next(new AuthorizationError('Phone number not verified'));
    }

    next();
  } catch (error) {
    logger.error('Phone verification check failed', {
      userId: req.user.sub,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(new AuthorizationError('Phone verification check failed'));
  }
};

// Verify email middleware
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AuthenticationError('User not authenticated'));
  }

  try {
    // Check if email is verified in Cognito
    const response = await cognito.adminGetUser({
      UserPoolId: config.aws.cognito.userPoolId,
      Username: req.user.sub,
    });

    const emailVerified = response.UserAttributes?.find(
      attr => attr.Name === 'email_verified'
    )?.Value === 'true';

    if (!emailVerified) {
      return next(new AuthorizationError('Email not verified'));
    }

    next();
  } catch (error) {
    logger.error('Email verification check failed', {
      userId: req.user.sub,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(new AuthorizationError('Email verification check failed'));
  }
}; 