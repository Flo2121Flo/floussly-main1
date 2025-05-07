import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config';
import { logger, stream } from './utils/logger';
import { errorHandler, notFoundHandler } from './utils/error';
import {
  rateLimiter,
  corsMiddleware,
  helmetConfig,
  securityHeaders,
  requestLogger,
  errorLogger,
  sanitizeRequest,
  validateApiKey,
} from './middleware/security';
import { createClient } from 'redis';
import { MonitoringService } from '@/services/monitoring';
import requestMonitoring from '@/middleware/monitoring';
import monitoringRoutes from '@/routes/monitoring';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import transactionRoutes from './routes/transaction';
import tontineRoutes from './routes/tontine';
import messageRoutes from './routes/message';
import qrCodeRoutes from './routes/qr-code';
import agentRoutes from './routes/agent';
import adminRoutes from './routes/admin';

// Create Express app
const app = express();

// Initialize Redis client
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.on('error', (error) => {
  logger.error('Redis client error:', error);
});

// Initialize monitoring service
const monitoringService = new MonitoringService(redis);

// Apply security middleware
app.use(helmetConfig);
app.use(corsMiddleware);
app.use(securityHeaders);
app.use(rateLimiter);
app.use(sanitizeRequest);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan('combined', { stream }));

// Request logging
app.use(requestLogger);

// Apply monitoring middleware
app.use(requestMonitoring(monitoringService));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.env,
    version: process.env.npm_package_version,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', validateApiKey, userRoutes);
app.use('/api/transactions', validateApiKey, transactionRoutes);
app.use('/api/tontines', validateApiKey, tontineRoutes);
app.use('/api/messages', validateApiKey, messageRoutes);
app.use('/api/qr-codes', validateApiKey, qrCodeRoutes);
app.use('/api/agents', validateApiKey, agentRoutes);
app.use('/api/admin', validateApiKey, adminRoutes);
app.use('/api/monitoring', monitoringRoutes);

// Error handling
app.use(errorLogger);
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port || 3000;
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Environment: ${config.env}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Starting graceful shutdown...');
  
  // Close Redis connection
  await redis.quit();
  
  // Close server
  process.exit(0);
});

export default app; 