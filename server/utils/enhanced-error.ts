import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import { CircuitBreaker } from './circuit-breaker';

// Base error class for all application errors
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
    public details?: any,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Business logic specific errors
export class InsufficientFundsError extends AppError {
  constructor(details?: any) {
    super(
      'Insufficient funds to complete the transaction',
      400,
      'INSUFFICIENT_FUNDS',
      details
    );
  }
}

export class UserNotFoundError extends AppError {
  constructor(userId: string) {
    super(
      'User not found',
      404,
      'USER_NOT_FOUND',
      { userId }
    );
  }
}

export class InvalidTransactionError extends AppError {
  constructor(details?: any) {
    super(
      'Invalid transaction',
      400,
      'INVALID_TRANSACTION',
      details
    );
  }
}

export class AMLFlagError extends AppError {
  constructor(details?: any) {
    super(
      'Transaction flagged for AML review',
      403,
      'AML_FLAG',
      details
    );
  }
}

export class KYCValidationError extends AppError {
  constructor(details?: any) {
    super(
      'KYC validation failed',
      400,
      'KYC_VALIDATION_FAILED',
      details
    );
  }
}

// External service errors
export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message: string,
    details?: any
  ) {
    super(
      `External service error: ${message}`,
      502,
      'EXTERNAL_SERVICE_ERROR',
      { service, ...details }
    );
  }
}

// Circuit breaker error
export class CircuitBreakerError extends AppError {
  constructor(service: string) {
    super(
      `Service temporarily unavailable`,
      503,
      'CIRCUIT_BREAKER_OPEN',
      { service }
    );
  }
}

// Enhanced error handler middleware
export const enhancedErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error with enhanced context
  logger.error('Error occurred', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err instanceof AppError ? err.code : undefined,
      details: err instanceof AppError ? err.details : undefined,
    },
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      params: req.params,
      body: req.body,
      ip: req.ip,
      userId: req.user?.id,
      correlationId: req.headers['x-correlation-id'],
    },
    timestamp: new Date().toISOString(),
  });

  // Handle specific error types
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message,
      ...(err.details && { details: err.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      status: 'error',
      code: 'DATABASE_ERROR',
      message: 'Database operation failed',
      ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      code: 'INVALID_TOKEN',
      message: 'Invalid authentication token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      code: 'TOKEN_EXPIRED',
      message: 'Authentication token expired',
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: (err as any).details,
    });
  }

  // Default error response
  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Async handler wrapper with error tracking
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Add request context to error
      if (error instanceof AppError) {
        error.details = {
          ...error.details,
          requestPath: req.path,
          requestMethod: req.method,
          userId: req.user?.id,
        };
      }
      next(error);
    });
  };
};

// Request validation middleware with enhanced error handling
export const validateRequest = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body, { abortEarly: false });
      next();
    } catch (error: any) {
      const errors = error.details.reduce((acc: any, detail: any) => {
        const key = detail.path.join('.');
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(detail.message);
        return acc;
      }, {});

      next(new ValidationError('Validation failed', errors));
    }
  };
}; 