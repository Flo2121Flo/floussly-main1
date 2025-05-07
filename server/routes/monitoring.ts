import { Router } from 'express';
import { MonitoringController } from '@/controllers/monitoring';
import { validateRequest } from '@/middleware/validation';
import { authenticate } from '@/middleware/auth';
import { rateLimit } from '@/middleware/rateLimit';
import { z } from 'zod';

const router = Router();

// Rate limiting for monitoring endpoints
const monitoringLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});

// Validation schemas
const performanceMetricsSchema = z.object({
  body: z.array(z.object({
    name: z.string(),
    value: z.number(),
    rating: z.enum(['good', 'needs-improvement', 'poor']),
  })),
});

const errorReportSchema = z.object({
  body: z.object({
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
  }),
});

const networkReportSchema = z.object({
  body: z.object({
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
  }),
});

const queryLimitSchema = z.object({
  query: z.object({
    limit: z.string().optional(),
  }),
});

// Initialize controller
const monitoringController = new MonitoringController(/* inject monitoring service */);

// Apply rate limiting to all monitoring routes
router.use(monitoringLimiter);

// Apply authentication to all monitoring routes
router.use(authenticate);

// Performance metrics routes
router.post(
  '/metrics',
  validateRequest(performanceMetricsSchema),
  monitoringController.storePerformanceMetrics.bind(monitoringController)
);

router.get(
  '/metrics',
  validateRequest(queryLimitSchema),
  monitoringController.getPerformanceMetrics.bind(monitoringController)
);

// Error tracking routes
router.post(
  '/errors',
  validateRequest(errorReportSchema),
  monitoringController.storeErrorReport.bind(monitoringController)
);

router.get(
  '/errors',
  validateRequest(queryLimitSchema),
  monitoringController.getErrorReports.bind(monitoringController)
);

// Network monitoring routes
router.post(
  '/network',
  validateRequest(networkReportSchema),
  monitoringController.storeNetworkReport.bind(monitoringController)
);

router.get(
  '/network',
  validateRequest(queryLimitSchema),
  monitoringController.getNetworkReports.bind(monitoringController)
);

// Dashboard route
router.get(
  '/dashboard',
  monitoringController.getDashboardData.bind(monitoringController)
);

export default router; 