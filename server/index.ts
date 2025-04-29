import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './utils/error-handler';
import {
  rateLimiter,
  securityHeaders,
  validateInput,
  validateApiKey,
  requestLogger,
} from './middleware/security';
import { SECURITY_CONFIG } from '../client/src/config/security';

// Import routes
import userRoutes from './routes/user';
import healthRoutes from './routes/health';
import amlRoutes from './routes/aml-routes';
import transactionRoutes from './routes/transactions';
import webhookRoutes from './routes/webhooks';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Security middleware
app.use(securityHeaders);
app.use(rateLimiter);
app.use(validateInput);
app.use(requestLogger);

// Enable CORS with security options
app.use(cors({
  origin: SECURITY_CONFIG.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
  maxAge: SECURITY_CONFIG.cors.maxAge,
}));

// Parse JSON bodies
app.use(express.json({ limit: '10kb' }));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/aml', amlRoutes);

// Error handling middleware
app.use(errorHandler);
app.use(notFoundHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} in ${config.env} mode`);
  logger.info('Security features enabled:', {
    rateLimiting: true,
    securityHeaders: true,
    inputValidation: true,
    apiKeyValidation: true,
    corsProtection: true,
    errorHandling: true,
  });
});
