import { CloudWatch } from 'aws-sdk';
import { SNS } from 'aws-sdk';
import { logger } from '../utils/logger';
import { redis } from '../config/redis';
import { config } from '../config/appConfig';
import { Pool } from 'pg';

export class MonitoringService {
  private static instance: MonitoringService;
  private cloudWatch: CloudWatch;
  private sns: SNS;
  private pool: Pool;

  private constructor() {
    this.cloudWatch = new CloudWatch();
    this.sns = new SNS();
    this.pool = new Pool({
      connectionString: config.DATABASE_URL
    });
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // System Health Checks
  public async checkSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
  }> {
    const checks: Record<string, boolean> = {};

    try {
      // Check database connection
      checks.database = await this.checkDatabaseConnection();

      // Check Redis connection
      checks.redis = await this.checkRedisConnection();

      // Check S3 access
      checks.s3 = await this.checkS3Access();

      // Check API endpoints
      checks.api = await this.checkAPIEndpoints();

      // Determine overall status
      const status = this.determineHealthStatus(checks);

      // Log health check results
      logger.info('System health check completed', {
        status,
        checks
      });

      return { status, checks };
    } catch (error) {
      logger.error('Health check failed', {
        error: error.message
      });

      return {
        status: 'unhealthy',
        checks
      };
    }
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      const result = await this.pool.query('SELECT 1');
      return result.rows[0]?.['?column?'] === 1;
    } catch (error) {
      logger.error('Database health check failed', {
        error: error.message
      });
      return false;
    }
  }

  private async checkRedisConnection(): Promise<boolean> {
    try {
      await redis.ping();
      return true;
    } catch (error) {
      logger.error('Redis health check failed', {
        error: error.message
      });
      return false;
    }
  }

  private async checkS3Access(): Promise<boolean> {
    try {
      // Implement S3 health check
      return true;
    } catch (error) {
      logger.error('S3 health check failed', {
        error: error.message
      });
      return false;
    }
  }

  private async checkAPIEndpoints(): Promise<boolean> {
    try {
      // Implement API health check
      return true;
    } catch (error) {
      logger.error('API health check failed', {
        error: error.message
      });
      return false;
    }
  }

  private determineHealthStatus(checks: Record<string, boolean>): 'healthy' | 'degraded' | 'unhealthy' {
    const allChecks = Object.values(checks);
    const passedChecks = allChecks.filter(check => check);

    if (passedChecks.length === allChecks.length) {
      return 'healthy';
    } else if (passedChecks.length >= allChecks.length * 0.7) {
      return 'degraded';
    } else {
      return 'unhealthy';
    }
  }

  // Metrics Collection
  public async collectMetrics(): Promise<void> {
    try {
      // Collect system metrics
      const metrics = await this.gatherSystemMetrics();

      // Send metrics to CloudWatch
      await this.sendMetricsToCloudWatch(metrics);

      // Store metrics in Redis for quick access
      await this.cacheMetrics(metrics);
    } catch (error) {
      logger.error('Failed to collect metrics', {
        error: error.message
      });
    }
  }

  private async gatherSystemMetrics(): Promise<Record<string, number>> {
    const metrics: Record<string, number> = {};

    try {
      // CPU Usage
      metrics.cpuUsage = await this.getCPUUsage();

      // Memory Usage
      metrics.memoryUsage = await this.getMemoryUsage();

      // Database Connections
      metrics.dbConnections = await this.getDatabaseConnections();

      // Redis Memory Usage
      metrics.redisMemory = await this.getRedisMemoryUsage();

      // API Response Times
      metrics.apiResponseTime = await this.getAPIResponseTime();

      // Error Rates
      metrics.errorRate = await this.getErrorRate();

      return metrics;
    } catch (error) {
      logger.error('Failed to gather system metrics', {
        error: error.message
      });
      return metrics;
    }
  }

  private async getCPUUsage(): Promise<number> {
    // Implement CPU usage check
    return 0;
  }

  private async getMemoryUsage(): Promise<number> {
    // Implement memory usage check
    return 0;
  }

  private async getDatabaseConnections(): Promise<number> {
    try {
      const result = await this.pool.query(
        'SELECT count(*) FROM pg_stat_activity'
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error('Failed to get database connections', {
        error: error.message
      });
      return 0;
    }
  }

  private async getRedisMemoryUsage(): Promise<number> {
    try {
      const info = await redis.info('memory');
      const usedMemory = info.match(/used_memory:(\d+)/)?.[1];
      return usedMemory ? parseInt(usedMemory) : 0;
    } catch (error) {
      logger.error('Failed to get Redis memory usage', {
        error: error.message
      });
      return 0;
    }
  }

  private async getAPIResponseTime(): Promise<number> {
    // Implement API response time check
    return 0;
  }

  private async getErrorRate(): Promise<number> {
    // Implement error rate calculation
    return 0;
  }

  private async sendMetricsToCloudWatch(metrics: Record<string, number>): Promise<void> {
    try {
      const metricData = Object.entries(metrics).map(([name, value]) => ({
        MetricName: name,
        Value: value,
        Unit: 'Count',
        Timestamp: new Date()
      }));

      await this.cloudWatch.putMetricData({
        Namespace: 'Floussly/System',
        MetricData: metricData
      }).promise();
    } catch (error) {
      logger.error('Failed to send metrics to CloudWatch', {
        error: error.message
      });
    }
  }

  private async cacheMetrics(metrics: Record<string, number>): Promise<void> {
    try {
      await redis.hset('system:metrics', metrics);
      await redis.expire('system:metrics', 300); // Cache for 5 minutes
    } catch (error) {
      logger.error('Failed to cache metrics', {
        error: error.message
      });
    }
  }

  // Alert Management
  public async createAlert(
    name: string,
    description: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    metric: string,
    threshold: number,
    operator: '>' | '<' | '>=' | '<=',
    duration: number
  ): Promise<void> {
    try {
      // Create CloudWatch alarm
      await this.cloudWatch.putMetricAlarm({
        AlarmName: name,
        AlarmDescription: description,
        MetricName: metric,
        Namespace: 'Floussly/System',
        Statistic: 'Average',
        Period: 60,
        EvaluationPeriods: Math.ceil(duration / 60),
        Threshold: threshold,
        ComparisonOperator: operator === '>' ? 'GreaterThanThreshold' :
                          operator === '<' ? 'LessThanThreshold' :
                          operator === '>=' ? 'GreaterThanOrEqualToThreshold' :
                          'LessThanOrEqualToThreshold',
        AlarmActions: [config.SNS_TOPIC_ARN],
        OKActions: [config.SNS_TOPIC_ARN]
      }).promise();

      // Store alert configuration
      await redis.hset('system:alerts', name, JSON.stringify({
        name,
        description,
        severity,
        metric,
        threshold,
        operator,
        duration,
        createdAt: new Date().toISOString()
      }));

      logger.info('Alert created successfully', {
        name,
        severity,
        metric
      });
    } catch (error) {
      logger.error('Failed to create alert', {
        error: error.message,
        name,
        severity
      });
      throw error;
    }
  }

  public async sendAlert(
    name: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<void> {
    try {
      // Send SNS notification
      await this.sns.publish({
        TopicArn: config.SNS_TOPIC_ARN,
        Subject: `[${severity.toUpperCase()}] ${name}`,
        Message: message
      }).promise();

      // Log alert
      logger.warn('Alert sent', {
        name,
        severity,
        message
      });
    } catch (error) {
      logger.error('Failed to send alert', {
        error: error.message,
        name,
        severity
      });
    }
  }
} 