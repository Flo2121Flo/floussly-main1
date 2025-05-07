import { RateLimitService } from '../services/rateLimit';
import { redis } from '../lib/redis';
import { AppError } from '../utils/errors';

describe('Rate Limiting System', () => {
  let rateLimitService: RateLimitService;
  const testIp = '127.0.0.1';
  const testUserId = 'test-user-123';

  beforeEach(async () => {
    rateLimitService = new RateLimitService();
    await redis.flushall();
  });

  afterEach(async () => {
    await redis.flushall();
  });

  describe('IP-based Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      const result = await rateLimitService.checkIpLimit(testIp);
      expect(result.allowed).toBe(true);
    });

    it('should block requests exceeding limit', async () => {
      // Simulate multiple requests
      for (let i = 0; i < 100; i++) {
        await rateLimitService.checkIpLimit(testIp);
      }

      const result = await rateLimitService.checkIpLimit(testIp);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
    });

    it('should reset limit after window expires', async () => {
      // Simulate multiple requests
      for (let i = 0; i < 100; i++) {
        await rateLimitService.checkIpLimit(testIp);
      }

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 60000));

      const result = await rateLimitService.checkIpLimit(testIp);
      expect(result.allowed).toBe(true);
    });
  });

  describe('User-based Rate Limiting', () => {
    it('should allow requests within user limit', async () => {
      const result = await rateLimitService.checkUserLimit(testUserId);
      expect(result.allowed).toBe(true);
    });

    it('should block requests exceeding user limit', async () => {
      // Simulate multiple requests
      for (let i = 0; i < 1000; i++) {
        await rateLimitService.checkUserLimit(testUserId);
      }

      const result = await rateLimitService.checkUserLimit(testUserId);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
    });
  });

  describe('Endpoint-specific Rate Limiting', () => {
    const endpoint = '/api/messages';

    it('should allow requests within endpoint limit', async () => {
      const result = await rateLimitService.checkEndpointLimit(testUserId, endpoint);
      expect(result.allowed).toBe(true);
    });

    it('should block requests exceeding endpoint limit', async () => {
      // Simulate multiple requests
      for (let i = 0; i < 50; i++) {
        await rateLimitService.checkEndpointLimit(testUserId, endpoint);
      }

      const result = await rateLimitService.checkEndpointLimit(testUserId, endpoint);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
    });
  });

  describe('Rate Limit Headers', () => {
    it('should return correct rate limit headers', async () => {
      const result = await rateLimitService.checkIpLimit(testIp);
      expect(result.headers).toHaveProperty('X-RateLimit-Limit');
      expect(result.headers).toHaveProperty('X-RateLimit-Remaining');
      expect(result.headers).toHaveProperty('X-RateLimit-Reset');
    });
  });

  describe('Rate Limit Configuration', () => {
    it('should apply different limits for different endpoints', async () => {
      const loginResult = await rateLimitService.checkEndpointLimit(testUserId, '/api/auth/login');
      const messageResult = await rateLimitService.checkEndpointLimit(testUserId, '/api/messages');

      expect(loginResult.headers['X-RateLimit-Limit']).toBeLessThan(
        messageResult.headers['X-RateLimit-Limit']
      );
    });

    it('should apply stricter limits for unauthenticated requests', async () => {
      const authenticatedResult = await rateLimitService.checkUserLimit(testUserId);
      const unauthenticatedResult = await rateLimitService.checkIpLimit(testIp);

      expect(authenticatedResult.headers['X-RateLimit-Limit']).toBeGreaterThan(
        unauthenticatedResult.headers['X-RateLimit-Limit']
      );
    });
  });

  describe('Rate Limit Bypass', () => {
    it('should allow bypass for whitelisted IPs', async () => {
      const whitelistedIp = '10.0.0.1';
      await rateLimitService.whitelistIp(whitelistedIp);

      // Simulate multiple requests
      for (let i = 0; i < 1000; i++) {
        const result = await rateLimitService.checkIpLimit(whitelistedIp);
        expect(result.allowed).toBe(true);
      }
    });

    it('should allow bypass for admin users', async () => {
      const adminUserId = 'admin-123';
      await rateLimitService.setAdminUser(adminUserId);

      // Simulate multiple requests
      for (let i = 0; i < 1000; i++) {
        const result = await rateLimitService.checkUserLimit(adminUserId);
        expect(result.allowed).toBe(true);
      }
    });
  });
}); 