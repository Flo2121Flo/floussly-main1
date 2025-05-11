import winston from 'winston';
import { CloudWatchLogs } from 'aws-sdk';
import { format } from 'winston';
import { config } from '../config';

const { combine, timestamp, json, errors } = format;

// CloudWatch configuration
const cloudWatchLogs = new CloudWatchLogs({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

// Log group and stream names
const LOG_GROUP_NAME = `/floussly/${config.environment}`;
const LOG_STREAM_NAME = `${new Date().toISOString().split('T')[0]}`;

// Create CloudWatch transport
const cloudWatchTransport = {
  log: async (info: any, callback: () => void) => {
    try {
      await cloudWatchLogs.putLogEvents({
        logGroupName: LOG_GROUP_NAME,
        logStreamName: LOG_STREAM_NAME,
        logEvents: [
          {
            timestamp: Date.now(),
            message: JSON.stringify(info),
          },
        ],
      }).promise();
    } catch (error) {
      console.error('Failed to send logs to CloudWatch:', error);
    }
    callback();
  },
};

// Create Winston logger
const logger = winston.createLogger({
  level: config.environment === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'floussly-api' },
  transports: [
    new winston.transports.Console({
      format: combine(
        format.colorize(),
        format.simple()
      ),
    }),
    cloudWatchTransport as any,
  ],
});

// Log stream initialization
const initializeLogStream = async () => {
  try {
    // Create log group if it doesn't exist
    await cloudWatchLogs.createLogGroup({
      logGroupName: LOG_GROUP_NAME,
    }).promise();
  } catch (error: any) {
    if (error.code !== 'ResourceAlreadyExistsException') {
      throw error;
    }
  }

  try {
    // Create log stream if it doesn't exist
    await cloudWatchLogs.createLogStream({
      logGroupName: LOG_GROUP_NAME,
      logStreamName: LOG_STREAM_NAME,
    }).promise();
  } catch (error: any) {
    if (error.code !== 'ResourceAlreadyExistsException') {
      throw error;
    }
  }
};

// Initialize log stream on startup
initializeLogStream().catch(console.error);

// Export logger instance
export default logger;

// Export logging middleware
export const loggingMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      userId: req.user?.id,
    });
  });
  
  next();
};

// Export error logging middleware
export const errorLoggingMiddleware = (error: any, req: any, res: any, next: any) => {
  logger.error('Error occurred', {
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
    },
    request: {
      method: req.method,
      url: req.url,
      body: req.body,
      params: req.params,
      query: req.query,
      userId: req.user?.id,
    },
  });
  
  next(error);
}; 