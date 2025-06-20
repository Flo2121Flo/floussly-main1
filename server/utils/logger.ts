import winston from 'winston';
import { Request } from 'express';
import config from '../config';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'floussly-api' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add request logging middleware
export const requestLogger = (req: Request) => {
  const { method, url, ip, headers } = req;
  const correlationId = headers['x-correlation-id'] || 'unknown';
  
  logger.info('Incoming request', {
    correlationId,
    method,
    url,
    ip,
    userAgent: headers['user-agent'],
  });
};

// Add error logging middleware
export const errorLogger = (error: Error, req: Request) => {
  const { method, url, ip, headers } = req;
  const correlationId = headers['x-correlation-id'] || 'unknown';
  
  logger.error('Error occurred', {
    correlationId,
    method,
    url,
    ip,
    error: {
      message: error.message,
      stack: error.stack,
    },
  });
};

// Add performance logging
export const performanceLogger = (req: Request, duration: number) => {
  const { method, url, headers } = req;
  const correlationId = headers['x-correlation-id'] || 'unknown';
  
  logger.info('Request completed', {
    correlationId,
    method,
    url,
    duration: `${duration}ms`,
  });
};

export default logger; 