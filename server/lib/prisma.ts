import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import logger from '../utils/logger';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

if (config.env !== 'production') {
  global.prisma = prisma;
}

// Log Prisma events
prisma.$on('query', (e) => {
  logger.debug('Prisma Query:', {
    query: e.query,
    params: e.params,
    duration: e.duration,
  });
});

prisma.$on('error', (e) => {
  logger.error('Prisma Error:', e);
});

prisma.$on('info', (e) => {
  logger.info('Prisma Info:', e);
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma Warning:', e);
});

// Handle Prisma connection errors
prisma.$connect().catch((error) => {
  logger.error('Failed to connect to database:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Performance monitoring middleware
prisma.$use(async (params, next) => {
  const start = Date.now();
  const result = await next(params);
  const duration = Date.now() - start;

  // Log slow queries
  if (duration > 100) { // 100ms threshold
    logger.warn('Slow query detected', {
      model: params.model,
      action: params.action,
      duration,
      query: params.args,
      timestamp: new Date().toISOString()
    });
  }

  // Log all queries in development
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Database query', {
      model: params.model,
      action: params.action,
      duration,
      query: params.args
    });
  }

  return result;
});

// Error handling middleware
prisma.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (error) {
    logger.error('Database error', {
      model: params.model,
      action: params.action,
      error: error.message,
      query: params.args
    });
    throw error;
  }
}); 