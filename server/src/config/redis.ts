import Redis from 'ioredis';
import { config } from './config';
import { logger } from '../utils/logger';

const redisOptions: Redis.RedisOptions = {
  host: config.REDIS_HOST || 'localhost',
  port: parseInt(config.REDIS_PORT || '6379', 10),
  password: config.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

export const redis = new Redis(redisOptions);

redis.on('error', (error: Error) => {
  logger.error('Redis connection error:', { error: error.message });
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
}); 