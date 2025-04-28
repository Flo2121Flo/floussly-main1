import Redis from 'ioredis';
import { config } from '../config';

export class RedisService {
  private static instance: RedisService;
  private client: Redis;

  private constructor() {
    this.client = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.client.on('error', (error: Error) => {
      console.error('Redis error:', error);
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, value, 'EX', ttl);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    await this.client.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hdel(key: string, field: string): Promise<void> {
    await this.client.hdel(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  async lpush(key: string, value: string): Promise<void> {
    await this.client.lpush(key, value);
  }

  async rpush(key: string, value: string): Promise<void> {
    await this.client.rpush(key, value);
  }

  async lpop(key: string): Promise<string | null> {
    return this.client.lpop(key);
  }

  async rpop(key: string): Promise<string | null> {
    return this.client.rpop(key);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.lrange(key, start, stop);
  }

  async sadd(key: string, member: string): Promise<void> {
    await this.client.sadd(key, member);
  }

  async srem(key: string, member: string): Promise<void> {
    await this.client.srem(key, member);
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  async zadd(key: string, score: number, member: string): Promise<void> {
    await this.client.zadd(key, score, member);
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.zrange(key, start, stop);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async setHash(key: string, field: string, value: string): Promise<void> {
    await this.client.hset(key, field, value);
  }

  async getHash(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async getAllHash(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  async delHash(key: string, field: string): Promise<void> {
    await this.client.hdel(key, field);
  }

  async setList(key: string, values: string[]): Promise<void> {
    await this.client.rpush(key, ...values);
  }

  async getList(key: string, start: number = 0, end: number = -1): Promise<string[]> {
    return this.client.lrange(key, start, end);
  }

  async addToSortedSet(key: string, score: number, value: string): Promise<void> {
    await this.redisClient.zadd(key, score, value);
  }

  async getSortedSetRange(key: string, start: number = 0, end: number = -1): Promise<string[]> {
    return this.redisClient.zrange(key, start, end);
  }

  async incrementCounter(key: string): Promise<number> {
    return this.redisClient.incr(key);
  }

  async decrementCounter(key: string): Promise<number> {
    return this.redisClient.decr(key);
  }

  async getCounter(key: string): Promise<number> {
    const value = await this.redisClient.get(key);
    return value ? parseInt(value) : 0;
  }

  async setWithExpiry(key: string, value: string, seconds: number): Promise<void> {
    await this.redisClient.setex(key, seconds, value);
  }

  async getTTL(key: string): Promise<number> {
    return this.redisClient.ttl(key);
  }

  async flushAll(): Promise<void> {
    await this.redisClient.flushall();
  }

  async quit(): Promise<void> {
    await this.redisClient.quit();
  }
} 