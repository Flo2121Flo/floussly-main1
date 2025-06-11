import { Redis } from 'ioredis';
import { z } from 'zod';
import { logger } from '@/utils/logger';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';

const prisma = new PrismaClient();
const redis = new Redis(config.redis.url);

// Redis keys
const PERFORMANCE_METRICS_KEY = 'monitoring:performance:metrics';
const ERROR_REPORTS_KEY = 'monitoring:error:reports';
const NETWORK_REPORTS_KEY = 'monitoring:network:reports';

// Validation schemas
const performanceMetricSchema = z.object({
  name: z.string(),
  value: z.number(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
});

const errorReportSchema = z.object({
  timestamp: z.number(),
  url: z.string().url(),
  error: z.object({
    name: z.string(),
    message: z.string(),
    stack: z.string().optional(),
  }),
  userAgent: z.string(),
  breadcrumbs: z.array(z.object({
    timestamp: z.number(),
    category: z.string(),
    message: z.string(),
    level: z.enum(['info', 'warning', 'error']),
  })),
});

const networkReportSchema = z.object({
  timestamp: z.number(),
  requests: z.array(z.object({
    url: z.string(),
    method: z.string(),
    startTime: z.number(),
    endTime: z.number().optional(),
    status: z.number().optional(),
    error: z.string().optional(),
    responseSize: z.number().optional(),
  })),
  connection: z.object({
    effectiveType: z.string(),
    downlink: z.number(),
    rtt: z.number(),
  }),
});

export class MonitoringService {
  private static readonly METRICS_TTL = 24 * 60 * 60; // 24 hours

  /**
   * Track API request metrics
   */
  static async trackRequest(data: {
    path: string;
    method: string;
    statusCode: number;
    responseTime: number;
    userId?: string;
  }): Promise<void> {
    const { path, method, statusCode, responseTime, userId } = data;
    const timestamp = new Date().toISOString();

    try {
      // Track in Redis for real-time metrics
      await redis.zadd(
        'api_requests',
        Date.now(),
        JSON.stringify({
          path,
          method,
          statusCode,
          responseTime,
          userId,
          timestamp
        })
      );

      // Clean up old metrics
      await redis.zremrangebyscore(
        'api_requests',
        0,
        Date.now() - this.METRICS_TTL * 1000
      );

      // Track in database for historical analysis
      await prisma.metrics.create({
        data: {
          type: 'API_REQUEST',
          path,
          method,
          statusCode,
          responseTime,
          userId,
          metadata: {
            timestamp
          }
        }
      });
    } catch (error) {
      logger.error('Failed to track request metrics', {
        error,
        data
      });
    }
  }

  /**
   * Track error metrics
   */
  static async trackError(data: {
    error: Error;
    path: string;
    method: string;
    userId?: string;
  }): Promise<void> {
    const { error, path, method, userId } = data;
    const timestamp = new Date().toISOString();

    try {
      // Track in Redis for real-time metrics
      await redis.zadd(
        'api_errors',
        Date.now(),
        JSON.stringify({
          error: error.message,
          path,
          method,
          userId,
          timestamp
        })
      );

      // Clean up old metrics
      await redis.zremrangebyscore(
        'api_errors',
        0,
        Date.now() - this.METRICS_TTL * 1000
      );

      // Track in database for historical analysis
      await prisma.metrics.create({
        data: {
          type: 'API_ERROR',
          path,
          method,
          statusCode: 500,
          userId,
          metadata: {
            error: error.message,
            stack: error.stack,
            timestamp
          }
        }
      });
    } catch (error) {
      logger.error('Failed to track error metrics', {
        error,
        data
      });
    }
  }

  /**
   * Get real-time metrics
   */
  static async getRealTimeMetrics(): Promise<any> {
    try {
      const [requests, errors] = await Promise.all([
        redis.zrange('api_requests', -100, -1),
        redis.zrange('api_errors', -100, -1)
      ]);

      return {
        requests: requests.map(req => JSON.parse(req)),
        errors: errors.map(err => JSON.parse(err))
      };
    } catch (error) {
      logger.error('Failed to get real-time metrics', { error });
      throw error;
    }
  }

  /**
   * Get historical metrics
   */
  static async getHistoricalMetrics(options: {
    startDate: Date;
    endDate: Date;
    type?: string;
  }): Promise<any> {
    try {
      const { startDate, endDate, type } = options;

      const metrics = await prisma.metrics.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          ...(type && { type })
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return metrics;
    } catch (error) {
      logger.error('Failed to get historical metrics', { error });
      throw error;
    }
  }

  /**
   * Get system health metrics
   */
  static async getSystemHealth(): Promise<any> {
    try {
      const [
        dbStatus,
        redisStatus,
        activeUsers,
        errorRate
      ] = await Promise.all([
        this.checkDatabaseHealth(),
        this.checkRedisHealth(),
        this.getActiveUsersCount(),
        this.getErrorRate()
      ]);

      return {
        status: dbStatus && redisStatus ? 'healthy' : 'unhealthy',
        database: {
          status: dbStatus ? 'connected' : 'disconnected'
        },
        redis: {
          status: redisStatus ? 'connected' : 'disconnected'
        },
        metrics: {
          activeUsers,
          errorRate
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to get system health', { error });
      throw error;
    }
  }

  private static async checkDatabaseHealth(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private static async checkRedisHealth(): Promise<boolean> {
    try {
      await redis.ping();
      return true;
    } catch {
      return false;
    }
  }

  private static async getActiveUsersCount(): Promise<number> {
    try {
      const activeUsers = await redis.zcard('active_users');
      return activeUsers;
    } catch {
      return 0;
    }
  }

  private static async getErrorRate(): Promise<number> {
    try {
      const [totalRequests, totalErrors] = await Promise.all([
        redis.zcard('api_requests'),
        redis.zcard('api_errors')
      ]);

      return totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    } catch {
      return 0;
    }
  }

  private redis: Redis;
  private readonly maxMetrics = 1000;
  private readonly maxReports = 1000;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  // Performance metrics
  async storePerformanceMetrics(metrics: z.infer<typeof performanceMetricSchema>[]): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();
      
      for (const metric of metrics) {
        pipeline.lpush(PERFORMANCE_METRICS_KEY, JSON.stringify(metric));
      }
      
      pipeline.ltrim(PERFORMANCE_METRICS_KEY, 0, this.maxMetrics - 1);
      await pipeline.exec();
      
      logger.info(`Stored ${metrics.length} performance metrics`);
    } catch (error) {
      logger.error('Error storing performance metrics:', error);
      throw error;
    }
  }

  async getPerformanceMetrics(limit: number = 100): Promise<z.infer<typeof performanceMetricSchema>[]> {
    try {
      const metrics = await this.redis.lrange(PERFORMANCE_METRICS_KEY, 0, limit - 1);
      return metrics.map(metric => JSON.parse(metric));
    } catch (error) {
      logger.error('Error fetching performance metrics:', error);
      throw error;
    }
  }

  // Error reports
  async storeErrorReport(report: z.infer<typeof errorReportSchema>): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();
      pipeline.lpush(ERROR_REPORTS_KEY, JSON.stringify(report));
      pipeline.ltrim(ERROR_REPORTS_KEY, 0, this.maxReports - 1);
      await pipeline.exec();
      
      logger.info('Stored error report');
    } catch (error) {
      logger.error('Error storing error report:', error);
      throw error;
    }
  }

  async getErrorReports(limit: number = 100): Promise<z.infer<typeof errorReportSchema>[]> {
    try {
      const reports = await this.redis.lrange(ERROR_REPORTS_KEY, 0, limit - 1);
      return reports.map(report => JSON.parse(report));
    } catch (error) {
      logger.error('Error fetching error reports:', error);
      throw error;
    }
  }

  // Network reports
  async storeNetworkReport(report: z.infer<typeof networkReportSchema>): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();
      pipeline.lpush(NETWORK_REPORTS_KEY, JSON.stringify(report));
      pipeline.ltrim(NETWORK_REPORTS_KEY, 0, this.maxReports - 1);
      await pipeline.exec();
      
      logger.info('Stored network report');
    } catch (error) {
      logger.error('Error storing network report:', error);
      throw error;
    }
  }

  async getNetworkReports(limit: number = 100): Promise<z.infer<typeof networkReportSchema>[]> {
    try {
      const reports = await this.redis.lrange(NETWORK_REPORTS_KEY, 0, limit - 1);
      return reports.map(report => JSON.parse(report));
    } catch (error) {
      logger.error('Error fetching network reports:', error);
      throw error;
    }
  }

  // Dashboard data
  async getDashboardData(): Promise<{
    performance: {
      metrics: z.infer<typeof performanceMetricSchema>[];
      summary: {
        totalMetrics: number;
        averageResponseTime: number;
        successRate: number;
      };
    };
    errors: {
      reports: z.infer<typeof errorReportSchema>[];
      summary: {
        totalErrors: number;
        errorRate: number;
        mostCommonErrors: { name: string; count: number }[];
      };
    };
    network: {
      reports: z.infer<typeof networkReportSchema>[];
      summary: {
        averageResponseTime: number;
        averageResponseSize: number;
        successRate: number;
      };
    };
  }> {
    try {
      const [performanceMetrics, errorReports, networkReports] = await Promise.all([
        this.getPerformanceMetrics(),
        this.getErrorReports(),
        this.getNetworkReports(),
      ]);

      // Calculate performance summary
      const performanceSummary = {
        totalMetrics: performanceMetrics.length,
        averageResponseTime: this.calculateAverageResponseTime(performanceMetrics),
        successRate: this.calculateSuccessRate(performanceMetrics),
      };

      // Calculate error summary
      const errorSummary = {
        totalErrors: errorReports.length,
        errorRate: this.calculateErrorRate(errorReports),
        mostCommonErrors: this.getMostCommonErrors(errorReports),
      };

      // Calculate network summary
      const networkSummary = {
        averageResponseTime: this.calculateAverageNetworkResponseTime(networkReports),
        averageResponseSize: this.calculateAverageResponseSize(networkReports),
        successRate: this.calculateNetworkSuccessRate(networkReports),
      };

      return {
        performance: {
          metrics: performanceMetrics,
          summary: performanceSummary,
        },
        errors: {
          reports: errorReports,
          summary: errorSummary,
        },
        network: {
          reports: networkReports,
          summary: networkSummary,
        },
      };
    } catch (error) {
      logger.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Helper methods
  private calculateAverageResponseTime(metrics: z.infer<typeof performanceMetricSchema>[]): number {
    if (metrics.length === 0) return 0;
    const total = metrics.reduce((sum, metric) => sum + metric.value, 0);
    return total / metrics.length;
  }

  private calculateSuccessRate(metrics: z.infer<typeof performanceMetricSchema>[]): number {
    if (metrics.length === 0) return 0;
    const goodMetrics = metrics.filter(metric => metric.rating === 'good').length;
    return (goodMetrics / metrics.length) * 100;
  }

  private calculateErrorRate(reports: z.infer<typeof errorReportSchema>[]): number {
    if (reports.length === 0) return 0;
    const timeWindow = 24 * 60 * 60 * 1000; // 24 hours
    const recentErrors = reports.filter(report => 
      Date.now() - report.timestamp < timeWindow
    ).length;
    return (recentErrors / reports.length) * 100;
  }

  private getMostCommonErrors(reports: z.infer<typeof errorReportSchema>[]): { name: string; count: number }[] {
    const errorCounts = reports.reduce((counts, report) => {
      const name = report.error.name;
      counts[name] = (counts[name] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return Object.entries(errorCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculateAverageNetworkResponseTime(reports: z.infer<typeof networkReportSchema>[]): number {
    if (reports.length === 0) return 0;
    const allRequests = reports.flatMap(report => report.requests);
    const completedRequests = allRequests.filter(req => req.endTime);
    if (completedRequests.length === 0) return 0;

    const totalTime = completedRequests.reduce((sum, req) => {
      return sum + ((req.endTime || 0) - req.startTime);
    }, 0);

    return totalTime / completedRequests.length;
  }

  private calculateAverageResponseSize(reports: z.infer<typeof networkReportSchema>[]): number {
    if (reports.length === 0) return 0;
    const allRequests = reports.flatMap(report => report.requests);
    const requestsWithSize = allRequests.filter(req => req.responseSize);
    if (requestsWithSize.length === 0) return 0;

    const totalSize = requestsWithSize.reduce((sum, req) => {
      return sum + (req.responseSize || 0);
    }, 0);

    return totalSize / requestsWithSize.length;
  }

  private calculateNetworkSuccessRate(reports: z.infer<typeof networkReportSchema>[]): number {
    if (reports.length === 0) return 0;
    const allRequests = reports.flatMap(report => report.requests);
    const completedRequests = allRequests.filter(req => req.status);
    if (completedRequests.length === 0) return 0;

    const successfulRequests = completedRequests.filter(req => 
      req.status && req.status >= 200 && req.status < 300
    );

    return (successfulRequests.length / completedRequests.length) * 100;
  }
}

export default MonitoringService; 