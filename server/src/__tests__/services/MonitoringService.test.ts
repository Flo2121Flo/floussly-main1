import { MonitoringService } from '../../services/MonitoringService';
import { redis } from '../../db/redis';
import { pg } from '../../db/pg';
import { logger } from '../../utils/logger';

jest.mock('../../db/redis');
jest.mock('../../db/pg');
jest.mock('../../utils/logger');

describe('MonitoringService', () => {
  let monitoringService: MonitoringService;

  beforeEach(() => {
    monitoringService = MonitoringService.getInstance();
    jest.clearAllMocks();
  });

  describe('checkSystemHealth', () => {
    it('should return healthy status when all checks pass', async () => {
      (redis.ping as jest.Mock).mockResolvedValue('PONG');
      (pg.query as jest.Mock).mockResolvedValue({ rows: [{ '?column?': 1 }] });

      const result = await monitoringService.checkSystemHealth();

      expect(result).toEqual({
        status: 'healthy',
        checks: {
          database: true,
          redis: true,
          s3: true,
          api: true
        }
      });
    });

    it('should return degraded status when some checks fail', async () => {
      (redis.ping as jest.Mock).mockRejectedValue(new Error('Redis error'));
      (pg.query as jest.Mock).mockResolvedValue({ rows: [{ '?column?': 1 }] });

      const result = await monitoringService.checkSystemHealth();

      expect(result).toEqual({
        status: 'degraded',
        checks: {
          database: true,
          redis: false,
          s3: true,
          api: true
        }
      });
    });

    it('should return unhealthy status when all checks fail', async () => {
      (redis.ping as jest.Mock).mockRejectedValue(new Error('Redis error'));
      (pg.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await monitoringService.checkSystemHealth();

      expect(result).toEqual({
        status: 'unhealthy',
        checks: {
          database: false,
          redis: false,
          s3: true,
          api: true
        }
      });
    });
  });

  describe('collectMetrics', () => {
    it('should collect and store system metrics', async () => {
      const mockMetrics = {
        cpuUsage: 25,
        memoryUsage: 50,
        dbConnections: 10,
        redisMemory: 100,
        apiResponseTime: 200,
        errorRate: 0.01
      };

      jest.spyOn(monitoringService as any, 'gatherSystemMetrics')
        .mockResolvedValue(mockMetrics);

      await monitoringService.collectMetrics();

      expect(redis.hset).toHaveBeenCalledWith(
        'system:metrics',
        mockMetrics
      );
      expect(redis.expire).toHaveBeenCalledWith(
        'system:metrics',
        300
      );
    });

    it('should handle errors during metric collection', async () => {
      jest.spyOn(monitoringService as any, 'gatherSystemMetrics')
        .mockRejectedValue(new Error('Metric collection failed'));

      await monitoringService.collectMetrics();

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to collect metrics',
        expect.any(Object)
      );
    });
  });

  describe('createAlert', () => {
    it('should create a new alert with valid configuration', async () => {
      const alertConfig = {
        name: 'High CPU Usage',
        description: 'CPU usage exceeds threshold',
        severity: 'high' as const,
        metric: 'cpu_usage',
        threshold: 80,
        operator: '>' as const,
        duration: 300
      };

      await monitoringService.createAlert(
        alertConfig.name,
        alertConfig.description,
        alertConfig.severity,
        alertConfig.metric,
        alertConfig.threshold,
        alertConfig.operator,
        alertConfig.duration
      );

      expect(redis.hset).toHaveBeenCalledWith(
        'system:alerts',
        alertConfig.name,
        expect.stringContaining(alertConfig.name)
      );
    });

    it('should handle errors during alert creation', async () => {
      const alertConfig = {
        name: 'Test Alert',
        description: 'Test Description',
        severity: 'high' as const,
        metric: 'test_metric',
        threshold: 100,
        operator: '>' as const,
        duration: 60
      };

      (redis.hset as jest.Mock).mockRejectedValue(new Error('Redis error'));

      await expect(monitoringService.createAlert(
        alertConfig.name,
        alertConfig.description,
        alertConfig.severity,
        alertConfig.metric,
        alertConfig.threshold,
        alertConfig.operator,
        alertConfig.duration
      )).rejects.toThrow('Redis error');

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to create alert',
        expect.any(Object)
      );
    });
  });

  describe('sendAlert', () => {
    it('should send alert notification successfully', async () => {
      const alertData = {
        name: 'Test Alert',
        message: 'Test Message',
        severity: 'high' as const
      };

      await monitoringService.sendAlert(
        alertData.name,
        alertData.message,
        alertData.severity
      );

      expect(logger.warn).toHaveBeenCalledWith(
        'Alert sent',
        expect.objectContaining(alertData)
      );
    });

    it('should handle errors during alert sending', async () => {
      const alertData = {
        name: 'Test Alert',
        message: 'Test Message',
        severity: 'high' as const
      };

      (redis.publish as jest.Mock).mockRejectedValue(new Error('Redis error'));

      await monitoringService.sendAlert(
        alertData.name,
        alertData.message,
        alertData.severity
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to send alert',
        expect.any(Object)
      );
    });
  });
}); 