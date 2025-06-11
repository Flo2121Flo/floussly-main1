import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";
import { logger } from "../utils/logger";
import { Prisma } from "@prisma/client";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error with correlation ID
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    correlationId: req.correlationId,
    path: req.path,
    method: req.method
  });

  // Handle known errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message,
      ...(err.metadata && { metadata: err.metadata })
    });
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        return res.status(409).json({
          status: 'error',
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          message: 'A record with this value already exists'
        });
      case 'P2025': // Record not found
        return res.status(404).json({
          status: 'error',
          code: 'RECORD_NOT_FOUND',
          message: 'The requested record was not found'
        });
      default:
        return res.status(500).json({
          status: 'error',
          code: 'DATABASE_ERROR',
          message: 'A database error occurred'
        });
    }
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: err.message
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      code: 'INVALID_TOKEN',
      message: 'Invalid authentication token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      code: 'TOKEN_EXPIRED',
      message: 'Authentication token has expired'
    });
  }

  // Handle rate limit errors
  if (err.name === 'RateLimitExceeded') {
    return res.status(429).json({
      status: 'error',
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred'
      : err.message
  });
};

// Not found handler
export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn({
    message: "Route not found",
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  res.status(404).json({
    status: "error",
    message: "Route not found",
    code: "NOT_FOUND",
  });
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 