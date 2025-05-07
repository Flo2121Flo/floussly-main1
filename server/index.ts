import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';
import { MessagingService } from './services/messaging';
import { MoneyTransferService } from './services/moneyTransfer';
import { TreasureHuntService } from './services/treasureHunt';
import { TranslationService } from './services/translation';
import { WebSocketService } from './services/websocket';
import { logger } from './utils/logger';

// Initialize Prisma
const prisma = new PrismaClient();

// Create Express app
const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(helmet());
app.use(compression());
app.use(express.json());

// Initialize services
const messagingService = new MessagingService(httpServer);
const moneyTransferService = new MoneyTransferService();
const treasureHuntService = new TreasureHuntService();
const translationService = TranslationService.getInstance();

// Initialize WebSocket service
const websocketService = new WebSocketService(
  httpServer,
  messagingService,
  moneyTransferService,
  treasureHuntService
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, async () => {
  try {
    // Initialize translation service
    await translationService.initialize();

    logger.info(`Server running on port ${PORT}`);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  
  try {
    // Close Prisma connection
    await prisma.$disconnect();
    
    // Close HTTP server
    httpServer.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});
