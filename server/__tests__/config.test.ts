import { Config } from '../config';
import { AppError } from '../utils/errors';

describe('Configuration System', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env = {
      NODE_ENV: 'test',
      PORT: '3000',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'test-secret',
      AWS_ACCESS_KEY_ID: 'test-key',
      AWS_SECRET_ACCESS_KEY: 'test-secret',
      AWS_REGION: 'eu-west-1',
      S3_BUCKET: 'test-bucket',
      CORS_ORIGIN: 'http://localhost:3000',
      RATE_LIMIT_WINDOW: '900000',
      RATE_LIMIT_MAX: '100',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Environment Loading', () => {
    it('should load environment variables', () => {
      const config = new Config();
      expect(config.port).toBe(3000);
      expect(config.databaseUrl).toBe('postgresql://user:pass@localhost:5432/db');
      expect(config.redisUrl).toBe('redis://localhost:6379');
    });

    it('should throw error for missing required variables', () => {
      delete process.env.DATABASE_URL;
      expect(() => new Config()).toThrow(AppError);
    });

    it('should use default values for optional variables', () => {
      delete process.env.PORT;
      const config = new Config();
      expect(config.port).toBe(8080); // Default port
    });
  });

  describe('Environment Validation', () => {
    it('should validate port number', () => {
      process.env.PORT = 'invalid';
      expect(() => new Config()).toThrow(AppError);
    });

    it('should validate database URL format', () => {
      process.env.DATABASE_URL = 'invalid-url';
      expect(() => new Config()).toThrow(AppError);
    });

    it('should validate Redis URL format', () => {
      process.env.REDIS_URL = 'invalid-url';
      expect(() => new Config()).toThrow(AppError);
    });
  });

  describe('Environment Specific Configuration', () => {
    it('should load development configuration', () => {
      process.env.NODE_ENV = 'development';
      const config = new Config();
      expect(config.isDevelopment).toBe(true);
      expect(config.isProduction).toBe(false);
    });

    it('should load production configuration', () => {
      process.env.NODE_ENV = 'production';
      const config = new Config();
      expect(config.isDevelopment).toBe(false);
      expect(config.isProduction).toBe(true);
    });

    it('should load test configuration', () => {
      process.env.NODE_ENV = 'test';
      const config = new Config();
      expect(config.isTest).toBe(true);
    });
  });

  describe('AWS Configuration', () => {
    it('should load AWS credentials', () => {
      const config = new Config();
      expect(config.aws.accessKeyId).toBe('test-key');
      expect(config.aws.secretAccessKey).toBe('test-secret');
      expect(config.aws.region).toBe('eu-west-1');
    });

    it('should validate AWS region', () => {
      process.env.AWS_REGION = 'invalid-region';
      expect(() => new Config()).toThrow(AppError);
    });

    it('should load S3 configuration', () => {
      const config = new Config();
      expect(config.aws.s3Bucket).toBe('test-bucket');
    });
  });

  describe('Security Configuration', () => {
    it('should load JWT configuration', () => {
      const config = new Config();
      expect(config.jwt.secret).toBe('test-secret');
      expect(config.jwt.expiresIn).toBeDefined();
    });

    it('should load CORS configuration', () => {
      const config = new Config();
      expect(config.cors.origin).toBe('http://localhost:3000');
      expect(config.cors.methods).toBeDefined();
    });

    it('should validate CORS origin', () => {
      process.env.CORS_ORIGIN = 'invalid-origin';
      expect(() => new Config()).toThrow(AppError);
    });
  });

  describe('Rate Limiting Configuration', () => {
    it('should load rate limit configuration', () => {
      const config = new Config();
      expect(config.rateLimit.windowMs).toBe(900000);
      expect(config.rateLimit.max).toBe(100);
    });

    it('should validate rate limit window', () => {
      process.env.RATE_LIMIT_WINDOW = 'invalid';
      expect(() => new Config()).toThrow(AppError);
    });

    it('should validate rate limit max', () => {
      process.env.RATE_LIMIT_MAX = 'invalid';
      expect(() => new Config()).toThrow(AppError);
    });
  });

  describe('Database Configuration', () => {
    it('should parse database connection parameters', () => {
      const config = new Config();
      expect(config.database.host).toBe('localhost');
      expect(config.database.port).toBe(5432);
      expect(config.database.name).toBe('db');
    });

    it('should configure database pool settings', () => {
      const config = new Config();
      expect(config.database.pool.min).toBeDefined();
      expect(config.database.pool.max).toBeDefined();
      expect(config.database.pool.idle).toBeDefined();
    });
  });

  describe('Redis Configuration', () => {
    it('should parse Redis connection parameters', () => {
      const config = new Config();
      expect(config.redis.host).toBe('localhost');
      expect(config.redis.port).toBe(6379);
    });

    it('should configure Redis client settings', () => {
      const config = new Config();
      expect(config.redis.retryStrategy).toBeDefined();
      expect(config.redis.maxRetriesPerRequest).toBeDefined();
    });
  });
}); 