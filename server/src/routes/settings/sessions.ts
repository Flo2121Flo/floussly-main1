import { Router } from 'express';
import { z } from 'zod';
import { SessionService } from '../../services/SessionService';
import { logger } from '../../utils/logger';
import { requireAuth } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';

const router = Router();
const sessionService = SessionService.getInstance();

// Request validation schemas
const sessionListSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional()
});

// Get user's active sessions
router.get(
  '/',
  requireAuth,
  validateRequest({ query: sessionListSchema }),
  async (req, res) => {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const sessions = await sessionService.getUserSessions(
        req.user.id,
        Number(limit),
        Number(offset)
      );

      res.json({
        status: 'success',
        data: sessions
      });
    } catch (error) {
      logger.error('Failed to get user sessions', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get sessions'
      });
    }
  }
);

// Terminate specific session
router.delete(
  '/:sessionId',
  requireAuth,
  async (req, res) => {
    try {
      const { sessionId } = req.params;

      // Verify session belongs to user
      const session = await sessionService.getSessionById(sessionId);
      if (!session || session.userId !== req.user.id) {
        return res.status(404).json({
          status: 'error',
          message: 'Session not found'
        });
      }

      await sessionService.terminateSession(sessionId, req.user.id);

      res.json({
        status: 'success',
        message: 'Session terminated successfully'
      });
    } catch (error) {
      logger.error('Failed to terminate session', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to terminate session'
      });
    }
  }
);

// Terminate all sessions
router.delete(
  '/',
  requireAuth,
  async (req, res) => {
    try {
      await sessionService.terminateAllSessions(req.user.id);

      res.json({
        status: 'success',
        message: 'All sessions terminated successfully'
      });
    } catch (error) {
      logger.error('Failed to terminate all sessions', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to terminate all sessions'
      });
    }
  }
);

// Get suspicious sessions
router.get(
  '/suspicious',
  requireAuth,
  async (req, res) => {
    try {
      const suspiciousSessions = await sessionService.checkSuspiciousSessions(req.user.id);

      res.json({
        status: 'success',
        data: suspiciousSessions
      });
    } catch (error) {
      logger.error('Failed to get suspicious sessions', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get suspicious sessions'
      });
    }
  }
);

export default router; 