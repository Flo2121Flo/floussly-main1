import { Router } from 'express';
import { z } from 'zod';
import { OnboardingService, ChecklistItemStatus } from '../../services/OnboardingService';
import { requireAuth } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import { logger } from '../../utils/logger';

const router = Router();
const onboardingService = OnboardingService.getInstance();

// Request validation schemas
const updateItemStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'skipped']),
  data: z.record(z.any()).optional()
});

// Initialize onboarding checklist
router.post(
  '/initialize',
  requireAuth,
  async (req, res) => {
    try {
      const items = await onboardingService.initializeChecklist(req.user.id);
      res.json({ items });
    } catch (error) {
      logger.error('Failed to initialize checklist', { error: error.message });
      res.status(500).json({ error: 'Failed to initialize checklist' });
    }
  }
);

// Get user's checklist
router.get(
  '/checklist',
  requireAuth,
  async (req, res) => {
    try {
      const items = await onboardingService.getChecklist(req.user.id);
      res.json({ items });
    } catch (error) {
      logger.error('Failed to get checklist', { error: error.message });
      res.status(500).json({ error: 'Failed to get checklist' });
    }
  }
);

// Update checklist item status
router.put(
  '/checklist/:itemId',
  requireAuth,
  validateRequest({ body: updateItemStatusSchema }),
  async (req, res) => {
    try {
      const { itemId } = req.params;
      const { status, data } = req.body;

      const item = await onboardingService.updateItemStatus(
        req.user.id,
        itemId,
        status as ChecklistItemStatus,
        data
      );

      res.json({ item });
    } catch (error) {
      logger.error('Failed to update item status', { error: error.message });
      if (error.message === 'Checklist item not found') {
        res.status(404).json({ error: 'Checklist item not found' });
      } else {
        res.status(500).json({ error: 'Failed to update item status' });
      }
    }
  }
);

// Get onboarding progress
router.get(
  '/progress',
  requireAuth,
  async (req, res) => {
    try {
      const progress = await onboardingService.getProgress(req.user.id);
      res.json({ progress });
    } catch (error) {
      logger.error('Failed to get progress', { error: error.message });
      res.status(500).json({ error: 'Failed to get progress' });
    }
  }
);

export default router; 