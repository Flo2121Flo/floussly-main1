import { Router } from 'express';
import { z } from 'zod';
import { WithdrawalReviewService } from '../../services/WithdrawalReviewService';
import { logger } from '../../utils/logger';
import { requireAdmin } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';

const router = Router();
const withdrawalReviewService = WithdrawalReviewService.getInstance();

// Request validation schemas
const reviewActionSchema = z.object({
  notes: z.string().optional(),
  reason: z.string().optional()
});

const reviewListSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

// Get pending reviews
router.get(
  '/reviews/pending',
  requireAdmin,
  validateRequest({ query: reviewListSchema }),
  async (req, res) => {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const reviews = await withdrawalReviewService.getPendingReviews(
        Number(limit),
        Number(offset)
      );

      res.json({
        status: 'success',
        data: reviews
      });
    } catch (error) {
      logger.error('Failed to get pending reviews', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get pending reviews'
      });
    }
  }
);

// Get review by ID
router.get(
  '/reviews/:reviewId',
  requireAdmin,
  async (req, res) => {
    try {
      const { reviewId } = req.params;
      const review = await withdrawalReviewService.getReviewById(reviewId);

      if (!review) {
        return res.status(404).json({
          status: 'error',
          message: 'Review not found'
        });
      }

      res.json({
        status: 'success',
        data: review
      });
    } catch (error) {
      logger.error('Failed to get review', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get review'
      });
    }
  }
);

// Approve review
router.post(
  '/reviews/:reviewId/approve',
  requireAdmin,
  validateRequest({ body: reviewActionSchema }),
  async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { notes } = req.body;
      const reviewerId = req.user.id;

      const review = await withdrawalReviewService.approveReview(
        reviewId,
        reviewerId,
        notes
      );

      res.json({
        status: 'success',
        data: review
      });
    } catch (error) {
      logger.error('Failed to approve review', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to approve review'
      });
    }
  }
);

// Reject review
router.post(
  '/reviews/:reviewId/reject',
  requireAdmin,
  validateRequest({ body: reviewActionSchema }),
  async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { notes, reason } = req.body;
      const reviewerId = req.user.id;

      if (!notes && !reason) {
        return res.status(400).json({
          status: 'error',
          message: 'Rejection reason or notes are required'
        });
      }

      const review = await withdrawalReviewService.rejectReview(
        reviewId,
        reviewerId,
        notes || reason
      );

      res.json({
        status: 'success',
        data: review
      });
    } catch (error) {
      logger.error('Failed to reject review', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to reject review'
      });
    }
  }
);

// Get review statistics
router.get(
  '/reviews/stats',
  requireAdmin,
  validateRequest({ query: reviewListSchema }),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const query = `
        SELECT * FROM withdrawal_review_stats
        WHERE review_date BETWEEN $1 AND $2
        ORDER BY review_date DESC
      `;
      
      const result = await req.app.locals.db.query(query, [
        startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate || new Date()
      ]);

      res.json({
        status: 'success',
        data: result.rows
      });
    } catch (error) {
      logger.error('Failed to get review statistics', { error: error.message });
      res.status(500).json({
        status: 'error',
        message: 'Failed to get review statistics'
      });
    }
  }
);

export default router; 