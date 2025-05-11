import { Router } from 'express';
import {
  basicHealthCheck,
  detailedHealthCheck,
  metrics,
  readiness,
  liveness,
} from '../controllers/health';
import { rateLimit } from '../middleware/rate-limiter';

const router = Router();

// Basic health check - no rate limiting
router.get('/', basicHealthCheck);

// Detailed health check - rate limited
router.get('/detailed', rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
}), detailedHealthCheck);

// Metrics endpoint - rate limited
router.get('/metrics', rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
}), metrics);

// Kubernetes probes - no rate limiting
router.get('/ready', readiness);
router.get('/live', liveness);

export default router; 