import { Request, Response, NextFunction } from 'express';
import { redis } from '../db/redis';
import { logger } from '../utils/logger';

interface CacheConfig {
  ttl: number; // Time to live in seconds
  keyPrefix?: string;
  excludePaths?: string[];
}

const defaultConfig: CacheConfig = {
  ttl: 300, // 5 minutes
  keyPrefix: 'cache:',
  excludePaths: ['/api/auth', '/api/webhooks']
};

export const createCacheMiddleware = (config: Partial<CacheConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for excluded paths
    if (finalConfig.excludePaths?.some(path => req.path.startsWith(path))) {
      return next();
    }

    const cacheKey = `${finalConfig.keyPrefix}${req.originalUrl}`;

    try {
      // Try to get from cache
      const cachedResponse = await redis.get(cacheKey);
      
      if (cachedResponse) {
        const data = JSON.parse(cachedResponse);
        return res.json(data);
      }

      // If not in cache, intercept the response
      const originalJson = res.json;
      res.json = function(body: any) {
        // Store in cache
        redis.setex(
          cacheKey,
          finalConfig.ttl,
          JSON.stringify(body)
        ).catch(error => {
          logger.error('Cache storage error:', error);
        });

        // Send response
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Specific cache configurations for different endpoints
export const dashboardCache = createCacheMiddleware({
  ttl: 60, // 1 minute
  keyPrefix: 'cache:dashboard:'
});

export const transactionCache = createCacheMiddleware({
  ttl: 300, // 5 minutes
  keyPrefix: 'cache:transactions:'
});

export const userProfileCache = createCacheMiddleware({
  ttl: 600, // 10 minutes
  keyPrefix: 'cache:profile:'
}); 