import { Router } from 'express';
import { HealthController } from '../controllers/health';

const router = Router();
const healthController = new HealthController();

// Health check routes
router.get('/', healthController.checkHealth.bind(healthController));
router.get('/database', healthController.checkDatabase.bind(healthController));
router.get('/redis', healthController.checkRedis.bind(healthController));

export default router; 