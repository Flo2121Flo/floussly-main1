import { Counter, Histogram, Gauge, Registry } from 'prom-client';
import { logger } from '../utils/logger';
import { CacheService } from './cache-service';

export class MetricsService {
  private static instance: MetricsService;
  private registry: Registry;
  private cache: CacheService;

  // HTTP metrics
  private httpRequestDuration: Histogram;
  private httpRequestsTotal: Counter;
  private httpRequestErrors: Counter;

  // Database metrics
  private dbQueryDuration: Histogram;
  private dbConnections: Gauge;
  private dbErrors: Counter;

  // Cache metrics
  private cacheHits: Counter;
  private cacheMisses: Counter;
  private cacheErrors: Counter;

  // Business metrics
  private activeUsers: Gauge;
  private transactionsTotal: Counter;
  private transactionAmount: Counter;
  private failedTransactions: Counter;

  // System metrics
  private memoryUsage: Gauge;
  private cpuUsage: Gauge;
  private eventLoopLag: Gauge;

  private constructor() {
    this.registry = new Registry();
    this.cache = CacheService.getInstance();

    // Initialize HTTP metrics
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestErrors = new Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'error_type'],
      registers: [this.registry],
    });

    // Initialize database metrics
    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.registry],
    });

    this.dbConnections = new Gauge({
      name: 'db_connections',
      help: 'Number of active database connections',
      registers: [this.registry],
    });

    this.dbErrors = new Counter({
      name: 'db_errors_total',
      help: 'Total number of database errors',
      labelNames: ['operation', 'error_type'],
      registers: [this.registry],
    });

    // Initialize cache metrics
    this.cacheHits = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_type'],
      registers: [this.registry],
    });

    this.cacheMisses = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_type'],
      registers: [this.registry],
    });

    this.cacheErrors = new Counter({
      name: 'cache_errors_total',
      help: 'Total number of cache errors',
      labelNames: ['operation', 'error_type'],
      registers: [this.registry],
    });

    // Initialize business metrics
    this.activeUsers = new Gauge({
      name: 'active_users',
      help: 'Number of active users',
      registers: [this.registry],
    });

    this.transactionsTotal = new Counter({
      name: 'transactions_total',
      help: 'Total number of transactions',
      labelNames: ['type', 'status'],
      registers: [this.registry],
    });

    this.transactionAmount = new Counter({
      name: 'transaction_amount_total',
      help: 'Total amount of transactions',
      labelNames: ['currency'],
      registers: [this.registry],
    });

    this.failedTransactions = new Counter({
      name: 'failed_transactions_total',
      help: 'Total number of failed transactions',
      labelNames: ['error_type'],
      registers: [this.registry],
    });

    // Initialize system metrics
    this.memoryUsage = new Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
      registers: [this.registry],
    });

    this.cpuUsage = new Gauge({
      name: 'cpu_usage_percent',
      help: 'CPU usage percentage',
      registers: [this.registry],
    });

    this.eventLoopLag = new Gauge({
      name: 'event_loop_lag_seconds',
      help: 'Event loop lag in seconds',
      registers: [this.registry],
    });

    // Start collecting system metrics
    this.startSystemMetricsCollection();
  }

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  private startSystemMetricsCollection(): void {
    setInterval(() => {
      const memoryUsage = process.memoryUsage();
      this.memoryUsage.set(memoryUsage.heapUsed);

      const cpuUsage = process.cpuUsage();
      this.cpuUsage.set((cpuUsage.user + cpuUsage.system) / 1000000); // Convert to percentage

      // Measure event loop lag
      const start = process.hrtime();
      setImmediate(() => {
        const [seconds, nanoseconds] = process.hrtime(start);
        this.eventLoopLag.set(seconds + nanoseconds / 1e9);
      });
    }, 5000);
  }

  // HTTP metrics methods
  public recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    this.httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
  }

  public recordHttpError(method: string, route: string, errorType: string): void {
    this.httpRequestErrors.inc({ method, route, error_type: errorType });
  }

  // Database metrics methods
  public recordDbQuery(operation: string, table: string, duration: number): void {
    this.dbQueryDuration.observe({ operation, table }, duration);
  }

  public setDbConnections(count: number): void {
    this.dbConnections.set(count);
  }

  public recordDbError(operation: string, errorType: string): void {
    this.dbErrors.inc({ operation, error_type: errorType });
  }

  // Cache metrics methods
  public recordCacheHit(cacheType: string): void {
    this.cacheHits.inc({ cache_type: cacheType });
  }

  public recordCacheMiss(cacheType: string): void {
    this.cacheMisses.inc({ cache_type: cacheType });
  }

  public recordCacheError(operation: string, errorType: string): void {
    this.cacheErrors.inc({ operation, error_type: errorType });
  }

  // Business metrics methods
  public setActiveUsers(count: number): void {
    this.activeUsers.set(count);
  }

  public recordTransaction(type: string, status: string, amount?: number, currency?: string): void {
    this.transactionsTotal.inc({ type, status });
    if (amount && currency) {
      this.transactionAmount.inc({ currency }, amount);
    }
  }

  public recordFailedTransaction(errorType: string): void {
    this.failedTransactions.inc({ error_type: errorType });
  }

  // Metrics collection methods
  public async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  public async getMetricsAsJSON(): Promise<any> {
    return this.registry.getMetricsAsJSON();
  }

  public resetMetrics(): void {
    this.registry.clear();
  }
} 