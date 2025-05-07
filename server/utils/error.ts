import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: any) {
    super(message, 400, "VALIDATION_FAILED", details);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed", details?: any) {
    super(message, 401, "AUTHENTICATION_FAILED", details);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Not authorized", details?: any) {
    super(message, 403, "NOT_AUTHORIZED", details);
    this.name = "AuthorizationError";
  }
}

export class TokenExpiredError extends AppError {
  constructor(message = "Token expired", details?: any) {
    super(message, 401, "TOKEN_EXPIRED", details);
    this.name = "TokenExpiredError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details?: any) {
    super(message, 404, "NOT_FOUND", details);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict", details?: any) {
    super(message, 409, "CONFLICT", details);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded", details?: any) {
    super(message, 429, "RATE_LIMIT_EXCEEDED", details);
    this.name = "RateLimitError";
  }
}

export class InsufficientFundsError extends AppError {
  constructor(message = "Insufficient funds", details?: any) {
    super(message, 400, "INSUFFICIENT_FUNDS", details);
    this.name = "InsufficientFundsError";
  }
}

export class TransactionLimitError extends AppError {
  constructor(message = "Transaction limit exceeded", details?: any) {
    super(message, 400, "TRANSACTION_LIMIT_EXCEEDED", details);
    this.name = "TransactionLimitError";
  }
}

export class TontineError extends AppError {
  constructor(message = "Tontine operation failed", details?: any) {
    super(message, 400, "TONTINE_ERROR", details);
    this.name = "TontineError";
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = "External service error", details?: any) {
    super(message, 502, "EXTERNAL_SERVICE_ERROR", details);
    this.name = "ExternalServiceError";
  }
}

export class PaymentGatewayError extends AppError {
  constructor(message = "Payment gateway error", details?: any) {
    super(message, 502, "PAYMENT_GATEWAY_ERROR", details);
    this.name = "PaymentGatewayError";
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database error", details?: any) {
    super(message, 500, "DATABASE_ERROR", details);
    this.name = "DatabaseError";
  }
}

export class CacheError extends AppError {
  constructor(message = "Cache error", details?: any) {
    super(message, 500, "CACHE_ERROR", details);
    this.name = "CacheError";
  }
}

export class FileOperationError extends AppError {
  constructor(message = "File operation failed", details?: any) {
    super(message, 500, "FILE_OPERATION_ERROR", details);
    this.name = "FileOperationError";
  }
}

export class NetworkError extends AppError {
  constructor(message = "Network error", details?: any) {
    super(message, 503, "NETWORK_ERROR", details);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends AppError {
  constructor(message = "Request timeout", details?: any) {
    super(message, 504, "TIMEOUT", details);
    this.name = "TimeoutError";
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    // Operational, trusted error: send message to client
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err instanceof ValidationError && { errors: err.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Programming or other unknown error: don't leak error details
  logger.error('Unhandled error:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const validateRequest = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body, { abortEarly: false });
      next();
    } catch (error: any) {
      const errors: Record<string, string[]> = {};
      error.details.forEach((detail: any) => {
        const key = detail.path.join('.');
        if (!errors[key]) {
          errors[key] = [];
        }
        errors[key].push(detail.message);
      });
      next(new ValidationError(errors));
    }
  };
};

export const createError = (
  type: keyof typeof ErrorTypes,
  message?: string,
  details?: any
): AppError => {
  const ErrorClass = ErrorTypes[type];
  return new ErrorClass(message, details);
};

export const ErrorTypes = {
  Authentication: AuthenticationError,
  Authorization: AuthorizationError,
  TokenExpired: TokenExpiredError,
  Validation: ValidationError,
  NotFound: NotFoundError,
  Conflict: ConflictError,
  InsufficientFunds: InsufficientFundsError,
  TransactionLimit: TransactionLimitError,
  Tontine: TontineError,
  RateLimit: RateLimitError,
  ExternalService: ExternalServiceError,
  PaymentGateway: PaymentGatewayError,
  Database: DatabaseError,
  Cache: CacheError,
  FileOperation: FileOperationError,
  Network: NetworkError,
  Timeout: TimeoutError,
} as const; 