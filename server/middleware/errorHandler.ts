import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ValidationError, AuthenticationError, AuthorizationError } from '../utils/error';

// Error handler middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.sub,
  });

  if (err instanceof ValidationError) {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: err.message,
      details: err.details,
    });
  }

  if (err instanceof AuthenticationError) {
    return res.status(401).json({
      status: 'error',
      code: 'AUTHENTICATION_ERROR',
      message: err.message,
    });
  }

  if (err instanceof AuthorizationError) {
    return res.status(403).json({
      status: 'error',
      code: 'AUTHORIZATION_ERROR',
      message: err.message,
    });
  }

  // Default error response
  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
};

// Not found handler middleware
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
  });
};

// Async error handler wrapper
export const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}; 