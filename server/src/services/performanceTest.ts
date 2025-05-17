import { logger } from '../utils/logger';
import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';

interface PerformanceMetrics {
  timestamp: number;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  error?: string;
}

interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errors: string[];
  throughput: number;
}

export class PerformanceTest extends EventEmitter {
  private metrics: PerformanceMetrics[] = [];
  private readonly METRICS_RETENTION_PERIOD = 24 * 60 * 60 * 1000; // 24 hours

  async runLoadTest(
    endpoint: string,
    method: string,
    concurrency: number,
    duration: number,
    payload?: any
  ): Promise<LoadTestResult> {
    const startTime = Date.now();
    const results: PerformanceMetrics[] = [];
    const errors: string[] = [];

    const makeRequest = async () => {
      const start = performance.now();
      try {
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload ? JSON.stringify(payload) : undefined,
        });

        const end = performance.now();
        results.push({
          timestamp: Date.now(),
          endpoint,
          method,
          responseTime: end - start,
          statusCode: response.status,
        });

        if (!response.ok) {
          errors.push(`Request failed with status ${response.status}`);
        }
      } catch (error) {
        const end = performance.now();
        results.push({
          timestamp: Date.now(),
          endpoint,
          method,
          responseTime: end - start,
          statusCode: 0,
          error: error.message,
        });
        errors.push(error.message);
      }
    };

    // Run concurrent requests
    const workers = Array(concurrency).fill(null).map(() => {
      return new Promise<void>(async (resolve) => {
        while (Date.now() - startTime < duration) {
          await makeRequest();
        }
        resolve();
      });
    });

    await Promise.all(workers);

    return this.calculateLoadTestResults(results, errors, duration);
  }

  private calculateLoadTestResults(
    results: PerformanceMetrics[],
    errors: string[],
    duration: number
  ): LoadTestResult {
    const responseTimes = results.map(r => r.responseTime).sort((a, b) => a - b);
    const successfulRequests = results.filter(r => r.statusCode >= 200 && r.statusCode < 300).length;
    const failedRequests = results.length - successfulRequests;

    return {
      totalRequests: results.length,
      successfulRequests,
      failedRequests,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)],
      p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)],
      errors: [...new Set(errors)],
      throughput: results.length / (duration / 1000), // requests per second
    };
  }

  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    this.emit('metric', metric);
    this.cleanupOldMetrics();
  }

  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - this.METRICS_RETENTION_PERIOD;
    this.metrics = this.metrics.filter(m => m.timestamp > cutoffTime);
  }

  async getPerformanceReport(timeframe: 'hour' | 'day' | 'week'): Promise<any> {
    const now = Date.now();
    let startTime: number;

    switch (timeframe) {
      case 'hour':
        startTime = now - 60 * 60 * 1000;
        break;
      case 'day':
        startTime = now - 24 * 60 * 60 * 1000;
        break;
      case 'week':
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      default:
        throw new Error('Invalid timeframe');
    }

    const relevantMetrics = this.metrics.filter(m => m.timestamp >= startTime);
    const endpoints = [...new Set(relevantMetrics.map(m => m.endpoint))];

    const report = {
      timeframe,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(now).toISOString(),
      totalRequests: relevantMetrics.length,
      endpoints: endpoints.map(endpoint => {
        const endpointMetrics = relevantMetrics.filter(m => m.endpoint === endpoint);
        const responseTimes = endpointMetrics.map(m => m.responseTime);
        const errors = endpointMetrics.filter(m => m.error).map(m => m.error);

        return {
          endpoint,
          totalRequests: endpointMetrics.length,
          averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
          p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)],
          p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)],
          errorRate: errors.length / endpointMetrics.length,
          errors: [...new Set(errors)],
        };
      }),
    };

    return report;
  }

  async monitorEndpoint(
    endpoint: string,
    method: string,
    interval: number,
    duration: number
  ): Promise<void> {
    const startTime = Date.now();
    const monitor = async () => {
      if (Date.now() - startTime >= duration) {
        return;
      }

      const start = performance.now();
      try {
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const end = performance.now();
        this.recordMetric({
          timestamp: Date.now(),
          endpoint,
          method,
          responseTime: end - start,
          statusCode: response.status,
        });

        if (!response.ok) {
          logger.warn(`Endpoint ${endpoint} returned status ${response.status}`);
        }
      } catch (error) {
        const end = performance.now();
        this.recordMetric({
          timestamp: Date.now(),
          endpoint,
          method,
          responseTime: end - start,
          statusCode: 0,
          error: error.message,
        });
        logger.error(`Error monitoring endpoint ${endpoint}:`, error);
      }

      setTimeout(monitor, interval);
    };

    monitor();
  }

  async runDatabasePerformanceTest(): Promise<any> {
    const results = {
      readOperations: await this.testReadOperations(),
      writeOperations: await this.testWriteOperations(),
      concurrentOperations: await this.testConcurrentOperations(),
    };

    return results;
  }

  private async testReadOperations(): Promise<any> {
    const start = performance.now();
    // Implement database read operations test
    const end = performance.now();
    return {
      duration: end - start,
      operationsPerSecond: 0, // Calculate based on actual test
    };
  }

  private async testWriteOperations(): Promise<any> {
    const start = performance.now();
    // Implement database write operations test
    const end = performance.now();
    return {
      duration: end - start,
      operationsPerSecond: 0, // Calculate based on actual test
    };
  }

  private async testConcurrentOperations(): Promise<any> {
    const start = performance.now();
    // Implement concurrent database operations test
    const end = performance.now();
    return {
      duration: end - start,
      operationsPerSecond: 0, // Calculate based on actual test
    };
  }
} 