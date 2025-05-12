import { Request, Response } from 'express';
import { WalletLimitService, UserTier } from '../services/WalletLimitService';
import { logger } from '../utils/logger';
import { LimitViolation } from '../models/LimitViolation';

export class WalletLimitController {
  private static instance: WalletLimitController;
  private readonly walletLimitService: WalletLimitService;

  private constructor() {
    this.walletLimitService = WalletLimitService.getInstance();
  }

  public static getInstance(): WalletLimitController {
    if (!WalletLimitController.instance) {
      WalletLimitController.instance = new WalletLimitController();
    }
    return WalletLimitController.instance;
  }

  async getLimits(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const availableLimits = await this.walletLimitService.getAvailableLimits(userId);
      res.json({ limits: availableLimits });
    } catch (error) {
      logger.error('Error getting wallet limits', {
        userId: req.user.id,
        error: error.message
      });
      res.status(500).json({ error: 'Failed to get wallet limits' });
    }
  }

  async updateLimits(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { limits } = req.body;

      // Validate limits
      if (!this.validateLimits(limits)) {
        res.status(400).json({ error: 'Invalid limits provided' });
        return;
      }

      await this.walletLimitService.updateLimits(userId, limits);
      res.json({ message: 'Wallet limits updated successfully' });
    } catch (error) {
      logger.error('Error updating wallet limits', {
        userId: req.user.id,
        error: error.message
      });
      res.status(500).json({ error: 'Failed to update wallet limits' });
    }
  }

  async getTransactionHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({ error: 'Start date and end date are required' });
        return;
      }

      const transactions = await this.walletLimitService.getTransactionHistory(
        userId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({ transactions });
    } catch (error) {
      logger.error('Error getting transaction history', {
        userId: req.user.id,
        error: error.message
      });
      res.status(500).json({ error: 'Failed to get transaction history' });
    }
  }

  async resetLimits(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      await this.walletLimitService.resetLimits(userId);
      res.json({ message: 'Wallet limits reset to default' });
    } catch (error) {
      logger.error('Error resetting wallet limits', {
        userId: req.user.id,
        error: error.message
      });
      res.status(500).json({ error: 'Failed to reset wallet limits' });
    }
  }

  async getLimitViolations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { startDate, endDate, resolved } = req.query;

      const query: any = { userId };
      
      if (startDate && endDate) {
        query.timestamp = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        };
      }

      if (resolved !== undefined) {
        query.resolved = resolved === 'true';
      }

      const violations = await LimitViolation.find(query)
        .sort({ timestamp: -1 })
        .limit(100);

      res.json({ violations });
    } catch (error) {
      logger.error('Error getting limit violations', {
        userId: req.user.id,
        error: error.message
      });
      res.status(500).json({ error: 'Failed to get limit violations' });
    }
  }

  async resolveViolation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { violationId } = req.params;
      const { resolutionNote } = req.body;

      const violation = await LimitViolation.findById(violationId);
      if (!violation) {
        res.status(404).json({ error: 'Violation not found' });
        return;
      }

      if (violation.userId !== userId && req.user.tier !== UserTier.ADMIN) {
        res.status(403).json({ error: 'Unauthorized to resolve this violation' });
        return;
      }

      violation.resolved = true;
      violation.resolvedBy = userId;
      violation.resolutionNote = resolutionNote;
      violation.resolutionTimestamp = new Date();

      await violation.save();
      res.json({ message: 'Violation resolved successfully' });
    } catch (error) {
      logger.error('Error resolving limit violation', {
        userId: req.user.id,
        error: error.message
      });
      res.status(500).json({ error: 'Failed to resolve limit violation' });
    }
  }

  private validateLimits(limits: any): boolean {
    const requiredFields = ['dailyAmount', 'monthlyAmount', 'transactionCount'];
    const hasAllFields = requiredFields.every(field => field in limits);
    
    if (!hasAllFields) return false;

    return (
      typeof limits.dailyAmount === 'number' &&
      typeof limits.monthlyAmount === 'number' &&
      typeof limits.transactionCount === 'number' &&
      limits.dailyAmount > 0 &&
      limits.monthlyAmount > 0 &&
      limits.transactionCount > 0 &&
      limits.dailyAmount <= limits.monthlyAmount
    );
  }
} 