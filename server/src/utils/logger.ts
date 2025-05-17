import winston from 'winston';
import { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { S3 } from 'aws-sdk';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Create S3 transport for log archiving
const s3Transport = new winston.transports.S3({
  s3: new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  }),
  bucket: process.env.AWS_LOG_BUCKET || 'floussly-logs',
  acl: 'private',
  key: (info) => {
    const date = new Date();
    return `logs/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/${info.level}/${info.timestamp}-${info.message}.log`;
  }
});

// Create file transport for local logging
const fileTransport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat
});

// Create console transport for development
const consoleTransport = new winston.transports.Console({
  format: format.combine(
    format.colorize({ all: true }),
    format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  )
});

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format: logFormat,
  defaultMeta: { service: 'floussly-api' },
  transports: [
    fileTransport,
    consoleTransport,
    ...(process.env.NODE_ENV === 'production' ? [s3Transport] : [])
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: 'logs/exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: 'logs/rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

// Create request logger middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id
    });
  });
  next();
};

// Create error logger middleware
export const errorLogger = (err: any, req: any, res: any, next: any) => {
  logger.error({
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    status: err.status || 500,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id
  });
  next(err);
};

// Create audit logger
export const auditLogger = {
  log: (action: string, data: any) => {
    logger.info({
      type: 'AUDIT',
      action,
      ...data,
      timestamp: new Date().toISOString()
    });
  },

  error: (action: string, error: any) => {
    logger.error({
      type: 'AUDIT_ERROR',
      action,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
};

// Create security logger
export const securityLogger = {
  log: (event: string, data: any) => {
    logger.warn({
      type: 'SECURITY',
      event,
      ...data,
      timestamp: new Date().toISOString()
    });
  },

  alert: (event: string, data: any) => {
    logger.error({
      type: 'SECURITY_ALERT',
      event,
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

// Create performance logger
export const performanceLogger = {
  log: (operation: string, duration: number, data: any) => {
    logger.info({
      type: 'PERFORMANCE',
      operation,
      duration,
      ...data,
      timestamp: new Date().toISOString()
    });
  },

  warn: (operation: string, duration: number, threshold: number) => {
    logger.warn({
      type: 'PERFORMANCE_WARNING',
      operation,
      duration,
      threshold,
      timestamp: new Date().toISOString()
    });
  }
};

export default logger; 