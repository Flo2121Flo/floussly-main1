import { Pool } from 'pg';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { config } from '../config/appConfig';
import { NotificationService } from './NotificationService';
import { AuditService, AuditEventType } from './AuditService';
import { v4 as uuidv4 } from 'uuid';

// Withdrawal status enum
export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

// Withdrawal review interface
export interface WithdrawalReview {
  id: string;
  withdrawalId: string;
  userId: string;
  amount: number;
  currency: string;
  status: WithdrawalStatus;
  reviewerId?: string;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
}

// Withdrawal review service class
export class WithdrawalReviewService {
  private static instance: WithdrawalReviewService;
  private pool: Pool;
  private notificationService: NotificationService;
  private auditService: AuditService;

  private constructor() {
    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: config.NODE_ENV === 'production'
    });
    this.notificationService = NotificationService.getInstance();
    this.auditService = AuditService.getInstance();
  }

  public static getInstance(): WithdrawalReviewService {
    if (!WithdrawalReviewService.instance) {
      WithdrawalReviewService.instance = new WithdrawalReviewService();
    }
    return WithdrawalReviewService.instance;
  }

  // Check if withdrawal needs review
  private async needsReview(amount: number, userId: string): Promise<boolean> {
    try {
      // Get user's KYC level
      const kycResult = await this.pool.query(
        'SELECT kyc_level FROM users WHERE id = $1',
        [userId]
      );
      const kycLevel = kycResult.rows[0]?.kyc_level || 0;

      // Get user's withdrawal history
      const historyResult = await this.pool.query(
        `SELECT SUM(amount) as total_amount 
         FROM withdrawals 
         WHERE user_id = $1 
         AND status = 'completed'
         AND created_at > NOW() - INTERVAL '30 days'`,
        [userId]
      );
      const monthlyTotal = historyResult.rows[0]?.total_amount || 0;

      // Define review thresholds based on KYC level
      const thresholds = {
        0: 100, // Basic KYC
        1: 1000, // Enhanced KYC
        2: 5000, // Full KYC
        3: 10000 // Premium KYC
      };

      return amount > thresholds[kycLevel] || 
             (amount + monthlyTotal) > thresholds[kycLevel] * 2;
    } catch (error) {
      logger.error('Failed to check withdrawal review status', { error: error.message });
      return true; // Default to requiring review on error
    }
  }

  // Create withdrawal review
  public async createReview(
    withdrawalId: string,
    userId: string,
    amount: number,
    currency: string
  ): Promise<WithdrawalReview> {
    const reviewId = uuidv4();
    const timestamp = new Date();

    try {
      // Check if review is needed
      const requiresReview = await this.needsReview(amount, userId);

      if (!requiresReview) {
        return null;
      }

      // Create review record
      const result = await this.pool.query(
        `INSERT INTO withdrawal_reviews (
          id, withdrawal_id, user_id, amount, currency,
          status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          reviewId,
          withdrawalId,
          userId,
          amount,
          currency,
          WithdrawalStatus.PENDING,
          timestamp,
          timestamp
        ]
      );

      const review = result.rows[0];

      // Notify user
      await this.notificationService.sendNotification(userId, {
        type: 'withdrawal_review',
        title: 'Withdrawal Under Review',
        message: `Your withdrawal of ${amount} ${currency} is being reviewed for security purposes.`,
        data: { withdrawalId, reviewId }
      });

      // Log audit event
      await this.auditService.logEvent({
        eventType: AuditEventType.TRANSACTION_REVIEW,
        userId,
        details: {
          withdrawalId,
          reviewId,
          amount,
          currency,
          status: WithdrawalStatus.PENDING
        },
        severity: 'medium'
      });

      return review;
    } catch (error) {
      logger.error('Failed to create withdrawal review', { error: error.message });
      throw error;
    }
  }

  // Approve withdrawal
  public async approveReview(
    reviewId: string,
    reviewerId: string,
    notes?: string
  ): Promise<WithdrawalReview> {
    const timestamp = new Date();

    try {
      // Get review details
      const reviewResult = await this.pool.query(
        'SELECT * FROM withdrawal_reviews WHERE id = $1',
        [reviewId]
      );

      if (reviewResult.rows.length === 0) {
        throw new Error('Review not found');
      }

      const review = reviewResult.rows[0];

      // Update review status
      const result = await this.pool.query(
        `UPDATE withdrawal_reviews 
         SET status = $1, reviewer_id = $2, review_notes = $3,
             reviewed_at = $4, updated_at = $4
         WHERE id = $5
         RETURNING *`,
        [
          WithdrawalStatus.APPROVED,
          reviewerId,
          notes,
          timestamp,
          reviewId
        ]
      );

      const updatedReview = result.rows[0];

      // Update withdrawal status
      await this.pool.query(
        `UPDATE withdrawals 
         SET status = 'approved', updated_at = $1
         WHERE id = $2`,
        [timestamp, review.withdrawalId]
      );

      // Notify user
      await this.notificationService.sendNotification(review.userId, {
        type: 'withdrawal_approved',
        title: 'Withdrawal Approved',
        message: `Your withdrawal of ${review.amount} ${review.currency} has been approved.`,
        data: { withdrawalId: review.withdrawalId, reviewId }
      });

      // Log audit event
      await this.auditService.logEvent({
        eventType: AuditEventType.TRANSACTION_APPROVE,
        userId: review.userId,
        details: {
          withdrawalId: review.withdrawalId,
          reviewId,
          amount: review.amount,
          currency: review.currency,
          reviewerId,
          notes
        },
        severity: 'medium'
      });

      return updatedReview;
    } catch (error) {
      logger.error('Failed to approve withdrawal review', { error: error.message });
      throw error;
    }
  }

  // Reject withdrawal
  public async rejectReview(
    reviewId: string,
    reviewerId: string,
    notes: string
  ): Promise<WithdrawalReview> {
    const timestamp = new Date();

    try {
      // Get review details
      const reviewResult = await this.pool.query(
        'SELECT * FROM withdrawal_reviews WHERE id = $1',
        [reviewId]
      );

      if (reviewResult.rows.length === 0) {
        throw new Error('Review not found');
      }

      const review = reviewResult.rows[0];

      // Update review status
      const result = await this.pool.query(
        `UPDATE withdrawal_reviews 
         SET status = $1, reviewer_id = $2, review_notes = $3,
             reviewed_at = $4, updated_at = $4
         WHERE id = $5
         RETURNING *`,
        [
          WithdrawalStatus.REJECTED,
          reviewerId,
          notes,
          timestamp,
          reviewId
        ]
      );

      const updatedReview = result.rows[0];

      // Update withdrawal status
      await this.pool.query(
        `UPDATE withdrawals 
         SET status = 'rejected', updated_at = $1
         WHERE id = $2`,
        [timestamp, review.withdrawalId]
      );

      // Notify user
      await this.notificationService.sendNotification(review.userId, {
        type: 'withdrawal_rejected',
        title: 'Withdrawal Rejected',
        message: `Your withdrawal of ${review.amount} ${review.currency} has been rejected.`,
        data: { withdrawalId: review.withdrawalId, reviewId, notes }
      });

      // Log audit event
      await this.auditService.logEvent({
        eventType: AuditEventType.TRANSACTION_REJECT,
        userId: review.userId,
        details: {
          withdrawalId: review.withdrawalId,
          reviewId,
          amount: review.amount,
          currency: review.currency,
          reviewerId,
          notes
        },
        severity: 'high'
      });

      return updatedReview;
    } catch (error) {
      logger.error('Failed to reject withdrawal review', { error: error.message });
      throw error;
    }
  }

  // Get pending reviews
  public async getPendingReviews(
    limit: number = 10,
    offset: number = 0
  ): Promise<WithdrawalReview[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM withdrawal_reviews 
         WHERE status = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [WithdrawalStatus.PENDING, limit, offset]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to get pending reviews', { error: error.message });
      throw error;
    }
  }

  // Get review by ID
  public async getReviewById(reviewId: string): Promise<WithdrawalReview> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM withdrawal_reviews WHERE id = $1',
        [reviewId]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Failed to get review by ID', { error: error.message });
      throw error;
    }
  }

  // Get user's review history
  public async getUserReviewHistory(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<WithdrawalReview[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM withdrawal_reviews 
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to get user review history', { error: error.message });
      throw error;
    }
  }
} 