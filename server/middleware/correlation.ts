import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

export const correlationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get correlation ID from header or generate new one
  const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
  
  // Add correlation ID to request
  req.correlationId = correlationId;
  
  // Add correlation ID to response headers
  res.setHeader('x-correlation-id', correlationId);
  
  // Log request start with correlation ID
  logger.info('Request started', {
    correlationId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  // Log response
  const originalSend = res.send;
  res.send = function (body) {
    logger.info('Request completed', {
      correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: Date.now() - req._startTime
    });
    
    return originalSend.call(this, body);
  };
  
  // Add start time to request
  req._startTime = Date.now();
  
  next();
};

// Middleware to add correlation ID to all logs
export const correlationLogger = (req: Request, res: Response, next: NextFunction) => {
  const originalLogger = logger.info;
  logger.info = function (message: string, meta?: any) {
    return originalLogger.call(this, message, {
      ...meta,
      correlationId: req.correlationId
    });
  };
  
  const originalErrorLogger = logger.error;
  logger.error = function (message: string, meta?: any) {
    return originalErrorLogger.call(this, message, {
      ...meta,
      correlationId: req.correlationId
    });
  };
  
  next();
}; 