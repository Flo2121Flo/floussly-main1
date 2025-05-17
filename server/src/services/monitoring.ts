import { logger } from '../utils/logger';
import * as prometheus from 'prom-client';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

interface MetricThreshold {
  name: string;
  value: number;
  operator: 'gt' | 'lt' | 'eq';
  severity: 'critical' | 'warning';
}

interface Alert {
  timestamp: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'critical' | 'warning';
  message: string;
}

export class Monitoring extends EventEmitter {
  private readonly metrics: { [key: string]: prometheus.Metric } = {};
  private readonly thresholds: MetricThreshold[] = [];
  private readonly alerts: Alert[] = [];
  private readonly ALERTS_RETENTION_PERIOD = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor() {
    super();
    this.initializeMetrics();
    this.setupThresholds();
  }

  private initializeMetrics(): void {
    // HTTP Metrics
    this.metrics.httpRequestDuration = new prometheus.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });

    this.metrics.httpRequestsTotal = new prometheus.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    // WebSocket Metrics
    this.metrics.wsConnections = new prometheus.Gauge({
      name: 'websocket_connections',
      help: 'Number of active WebSocket connections',
    });

    this.metrics.wsMessages = new prometheus.Counter({
      name: 'websocket_messages_total',
      help: 'Total number of WebSocket messages',
      labelNames: ['type'],
    });

    // Database Metrics
    this.metrics.dbQueryDuration = new prometheus.Histogram({
      name: 'database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1],
    });

    this.metrics.dbConnections = new prometheus.Gauge({
      name: 'database_connections',
      help: 'Number of active database connections',
    });

    // Cache Metrics
    this.metrics.cacheHits = new prometheus.Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache'],
    });

    this.metrics.cacheMisses = new prometheus.Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache'],
    });

    // System Metrics
    this.metrics.memoryUsage = new prometheus.Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
    });

    this.metrics.cpuUsage = new prometheus.Gauge({
      name: 'cpu_usage_percent',
      help: 'CPU usage percentage',
    });

    // Business Metrics
    this.metrics.activeUsers = new prometheus.Gauge({
      name: 'active_users',
      help: 'Number of active users',
    });

    this.metrics.transactionsTotal = new prometheus.Counter({
      name: 'transactions_total',
      help: 'Total number of transactions',
      labelNames: ['type', 'status'],
    });
  }

  private setupThresholds(): void {
    this.thresholds = [
      {
        name: 'http_request_duration_seconds',
        value: 0.2, // 200ms
        operator: 'gt',
        severity: 'warning',
      },
      {
        name: 'http_request_duration_seconds',
        value: 0.5, // 500ms
        operator: 'gt',
        severity: 'critical',
      },
      {
        name: 'memory_usage_bytes',
        value: 1024 * 1024 * 1024, // 1GB
        operator: 'gt',
        severity: 'warning',
      },
      {
        name: 'cpu_usage_percent',
        value: 80,
        operator: 'gt',
        severity: 'warning',
      },
      {
        name: 'database_connections',
        value: 100,
        operator: 'gt',
        severity: 'warning',
      },
    ];
  }

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    this.metrics.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    this.metrics.httpRequestsTotal.inc({ method, route, status_code: statusCode });
    this.checkThresholds('http_request_duration_seconds', duration);
  }

  recordWebSocketConnection(connected: boolean): void {
    if (connected) {
      this.metrics.wsConnections.inc();
    } else {
      this.metrics.wsConnections.dec();
    }
  }

  recordWebSocketMessage(type: string): void {
    this.metrics.wsMessages.inc({ type });
  }

  recordDatabaseQuery(operation: string, table: string, duration: number): void {
    this.metrics.dbQueryDuration.observe({ operation, table }, duration);
    this.checkThresholds('database_query_duration_seconds', duration);
  }

  recordDatabaseConnection(connected: boolean): void {
    if (connected) {
      this.metrics.dbConnections.inc();
    } else {
      this.metrics.dbConnections.dec();
    }
    this.checkThresholds('database_connections', this.metrics.dbConnections.get());
  }

  recordCacheOperation(cache: string, hit: boolean): void {
    if (hit) {
      this.metrics.cacheHits.inc({ cache });
    } else {
      this.metrics.cacheMisses.inc({ cache });
    }
  }

  recordSystemMetrics(memoryUsage: number, cpuUsage: number): void {
    this.metrics.memoryUsage.set(memoryUsage);
    this.metrics.cpuUsage.set(cpuUsage);
    this.checkThresholds('memory_usage_bytes', memoryUsage);
    this.checkThresholds('cpu_usage_percent', cpuUsage);
  }

  recordBusinessMetrics(activeUsers: number, transactions: { type: string; status: string }[]): void {
    this.metrics.activeUsers.set(activeUsers);
    transactions.forEach(tx => {
      this.metrics.transactionsTotal.inc({ type: tx.type, status: tx.status });
    });
  }

  private checkThresholds(metricName: string, value: number): void {
    const relevantThresholds = this.thresholds.filter(t => t.name === metricName);

    relevantThresholds.forEach(threshold => {
      let triggered = false;
      switch (threshold.operator) {
        case 'gt':
          triggered = value > threshold.value;
          break;
        case 'lt':
          triggered = value < threshold.value;
          break;
        case 'eq':
          triggered = value === threshold.value;
          break;
      }

      if (triggered) {
        this.createAlert(metricName, value, threshold);
      }
    });
  }

  private createAlert(metric: string, value: number, threshold: MetricThreshold): void {
    const alert: Alert = {
      timestamp: new Date().toISOString(),
      metric,
      value,
      threshold: threshold.value,
      severity: threshold.severity,
      message: `${metric} ${threshold.operator} ${threshold.value} (current: ${value})`,
    };

    this.alerts.push(alert);
    this.emit('alert', alert);
    this.cleanupOldAlerts();
  }

  private cleanupOldAlerts(): void {
    const cutoffTime = Date.now() - this.ALERTS_RETENTION_PERIOD;
    this.alerts = this.alerts.filter(alert => new Date(alert.timestamp).getTime() > cutoffTime);
  }

  async generateMetricsReport(): Promise<string> {
    const metrics = await prometheus.register.metrics();
    const alerts = this.getActiveAlerts();

    return `
# Monitoring Report

## Current Metrics
${metrics}

## Active Alerts
${alerts.length > 0 ? alerts.map(alert => `- ${alert.message} (${alert.severity})`).join('\n') : 'No active alerts'}

## Recommendations
${this.generateRecommendations()}
    `;
  }

  private getActiveAlerts(): Alert[] {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return this.alerts.filter(alert => new Date(alert.timestamp).getTime() > oneHourAgo);
  }

  private generateRecommendations(): string {
    const recommendations: string[] = [];
    const alerts = this.getActiveAlerts();

    if (alerts.some(a => a.metric === 'http_request_duration_seconds' && a.severity === 'critical')) {
      recommendations.push('- Optimize slow endpoints to reduce response times');
    }

    if (alerts.some(a => a.metric === 'memory_usage_bytes' && a.severity === 'warning')) {
      recommendations.push('- Investigate memory leaks and optimize memory usage');
    }

    if (alerts.some(a => a.metric === 'cpu_usage_percent' && a.severity === 'warning')) {
      recommendations.push('- Consider horizontal scaling to reduce CPU load');
    }

    if (alerts.some(a => a.metric === 'database_connections' && a.severity === 'warning')) {
      recommendations.push('- Optimize database connection pool and query patterns');
    }

    return recommendations.join('\n');
  }

  async saveMetricsSnapshot(): Promise<void> {
    const metrics = await prometheus.register.metrics();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(process.cwd(), 'metrics', `metrics-${timestamp}.txt`);
    await fs.promises.writeFile(filePath, metrics);
  }
} 