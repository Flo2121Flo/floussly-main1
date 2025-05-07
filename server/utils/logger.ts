import winston from 'winston';
import { config } from '../config';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level based on environment
const level = () => {
  const env = config.env;
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define the format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use
const transports = [
  // Console transport for all logs
  new winston.transports.Console(),

  // Error log file transport
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),

  // All logs file transport
  new winston.transports.File({ filename: 'logs/all.log' }),
];

// Create the logger instance
export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// Create a stream object for Morgan
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Log unhandled exceptions and rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Export a function to log API requests
export const logApiRequest = (req: any, res: any, next: any) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
    );
  });
  next();
};

// Export a function to log errors
export const logError = (error: Error, req?: any) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...(req && {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      user: req.user?.id,
    }),
  });
};

// Export a function to log security events
export const logSecurityEvent = (event: string, details: any) => {
  logger.warn({
    event: 'SECURITY',
    type: event,
    ...details,
  });
};

// Export a function to log business events
export const logBusinessEvent = (event: string, details: any) => {
  logger.info({
    event: 'BUSINESS',
    type: event,
    ...details,
  });
};

// Export a function to log performance metrics
export const logPerformance = (metric: string, value: number, tags: any = {}) => {
  logger.debug({
    event: 'PERFORMANCE',
    metric,
    value,
    ...tags,
  });
}; 