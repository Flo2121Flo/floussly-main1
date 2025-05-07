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
  // Log the error
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
  });

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return res.status(409).json({
          status: "error",
          message: "A record with this value already exists",
          field: err.meta?.target?.[0],
        });
      case "P2025":
        return res.status(404).json({
          status: "error",
          message: "Record not found",
        });
      case "P2003":
        return res.status(400).json({
          status: "error",
          message: "Foreign key constraint failed",
        });
      default:
        return res.status(500).json({
          status: "error",
          message: "Database error occurred",
        });
    }
  }

  // Handle validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: "error",
      message: "Validation error",
      details: err.message,
    });
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      code: err.code,
      ...(err.details && { details: err.details }),
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      message: "Invalid token",
      code: "INVALID_TOKEN",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      message: "Token expired",
      code: "TOKEN_EXPIRED",
    });
  }

  // Handle rate limit errors
  if (err.name === "RateLimitError") {
    return res.status(429).json({
      status: "error",
      message: "Too many requests",
      code: "RATE_LIMIT_EXCEEDED",
    });
  }

  // Handle AWS Cognito errors
  if (err.name === "NotAuthorizedException") {
    return res.status(401).json({
      status: "error",
      message: "Invalid credentials",
      code: "INVALID_CREDENTIALS",
    });
  }

  if (err.name === "UserNotFoundException") {
    return res.status(404).json({
      status: "error",
      message: "User not found",
      code: "USER_NOT_FOUND",
    });
  }

  // Handle network errors
  if (err.name === "NetworkError") {
    return res.status(503).json({
      status: "error",
      message: "Service temporarily unavailable",
      code: "SERVICE_UNAVAILABLE",
    });
  }

  // Handle timeout errors
  if (err.name === "TimeoutError") {
    return res.status(504).json({
      status: "error",
      message: "Request timeout",
      code: "REQUEST_TIMEOUT",
    });
  }

  // Default error response
  return res.status(500).json({
    status: "error",
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err.message,
    }),
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