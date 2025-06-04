import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config';
import { logger, stream } from './utils/logger';
import { enhancedErrorHandler, asyncHandler } from './utils/enhanced-error';
import { CircuitBreakerRegistry } from './utils/circuit-breaker';
import { CacheService } from './services/cache-service';
import { MetricsService } from './services/metrics-service';
import {
  monitoringMiddleware,
  errorMonitoringMiddleware,
  databaseMonitoringMiddleware,
  cacheMonitoringMiddleware,
  businessMetricsMiddleware,
} from './middleware/monitoring';
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
import { healthRoutes } from './routes/health';
import { moroccanBankingRoutes } from './routes/moroccan-banking';
import { walletRoutes } from './routes/wallets';
import { daretRoutes } from './routes/darets';
import { merchantRoutes } from './routes/merchants';
import { notificationRoutes } from './routes/notifications';

// Create Express app
const app = express();

// Initialize Redis client
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.on('error', (error) => {
  logger.error('Redis client error:', error);
});

// Initialize services
const cacheService = CacheService.getInstance();
const metricsService = MetricsService.getInstance();

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

// Apply monitoring middleware
app.use(monitoringMiddleware(metricsService));
app.use(databaseMonitoringMiddleware(metricsService));
app.use(cacheMonitoringMiddleware(metricsService));
app.use(businessMetricsMiddleware(metricsService));

// Request logging
app.use(requestLogger);

// Apply monitoring middleware
app.use(requestMonitoring(monitoringService));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const metrics = await metricsService.getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    logger.error('Failed to get metrics:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
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
app.use('/api/health', healthRoutes);
app.use('/api/banking', moroccanBankingRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/darets', daretRoutes);
app.use('/api/merchants', merchantRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(errorLogger);
app.use(errorMonitoringMiddleware(metricsService));
app.use(enhancedErrorHandler);

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
  
  // Close circuit breakers
  CircuitBreakerRegistry.getInstance().destroyAll();
  
  // Close server
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Starting graceful shutdown...');
  
  // Close circuit breakers
  CircuitBreakerRegistry.getInstance().destroyAll();
  
  // Close server
  app.listen().close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app; 