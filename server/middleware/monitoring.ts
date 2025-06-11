import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../services/metrics-service';
import { MonitoringService } from '../services/monitoring';

export const monitoringMiddleware = (metricsService: MetricsService) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();

    // Record request start
    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds + nanoseconds / 1e9;

      // Record HTTP metrics
      metricsService.recordHttpRequest(
        req.method,
        req.route?.path || req.path,
        res.statusCode,
        duration
      );

      // Record errors if status code is 4xx or 5xx
      if (res.statusCode >= 400) {
        metricsService.recordHttpError(
          req.method,
          req.route?.path || req.path,
          res.statusCode >= 500 ? 'server_error' : 'client_error'
        );
      }
    });

    next();
  };
};

export const errorMonitoringMiddleware = (metricsService: MetricsService) => {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    // Record error metrics
    metricsService.recordHttpError(
      req.method,
      req.route?.path || req.path,
      err.name || 'unknown_error'
    );

    next(err);
  };
};

export const databaseMonitoringMiddleware = (metricsService: MetricsService) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalQuery = req.query;
    const start = process.hrtime();

    // Wrap the query execution
    req.query = async (...args: any[]) => {
      try {
        const result = await originalQuery.apply(req, args);
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds + nanoseconds / 1e9;

        // Record successful query
        metricsService.recordDbQuery(
          req.method,
          req.route?.path || req.path,
          duration
        );

        return result;
      } catch (error) {
        // Record query error
        metricsService.recordDbError(
          req.method,
          error.name || 'unknown_error'
        );
        throw error;
      }
    };

    next();
  };
};

export const cacheMonitoringMiddleware = (metricsService: MetricsService) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalGet = req.cache?.get;
    const originalSet = req.cache?.set;

    if (originalGet) {
      req.cache.get = async (...args: any[]) => {
        try {
          const result = await originalGet.apply(req.cache, args);
          if (result) {
            metricsService.recordCacheHit('http_cache');
          } else {
            metricsService.recordCacheMiss('http_cache');
          }
          return result;
        } catch (error) {
          metricsService.recordCacheError('get', error.name || 'unknown_error');
          throw error;
        }
      };
    }

    if (originalSet) {
      req.cache.set = async (...args: any[]) => {
        try {
          await originalSet.apply(req.cache, args);
        } catch (error) {
          metricsService.recordCacheError('set', error.name || 'unknown_error');
          throw error;
        }
      };
    }

    next();
  };
};

export const businessMetricsMiddleware = (metricsService: MetricsService) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Record transaction metrics if applicable
    if (req.path.includes('/transactions')) {
      const transactionType = req.body.type || 'unknown';
      const status = res.statusCode < 400 ? 'success' : 'failed';
      const amount = req.body.amount;
      const currency = req.body.currency;

      metricsService.recordTransaction(transactionType, status, amount, currency);

      if (res.statusCode >= 400) {
        metricsService.recordFailedTransaction(
          res.statusCode >= 500 ? 'server_error' : 'client_error'
        );
      }
    }

    next();
  };
};

export const requestMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Track response
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;

    MonitoringService.trackRequest({
      path: req.path,
      method: req.method,
      statusCode: res.statusCode,
      responseTime,
      userId: req.user?.id
    });
  });

  // Track errors
  res.on('error', (error) => {
    MonitoringService.trackError({
      error,
      path: req.path,
      method: req.method,
      userId: req.user?.id
    });
  });

  next();
};

export const errorMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function (body) {
    if (res.statusCode >= 400) {
      MonitoringService.trackError({
        error: new Error(typeof body === 'string' ? body : JSON.stringify(body)),
        path: req.path,
        method: req.method,
        userId: req.user?.id
      });
    }

    return originalSend.call(this, body);
  };

  next();
}; 