import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { LimitViolation } from '../models/LimitViolation';
import { NotificationService } from './NotificationService';
import { timezone } from '../utils/timezone';

export enum UserTier {
  STANDARD = 'STANDARD',
  VERIFIED = 'VERIFIED',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN'
}

export enum LimitType {
  SOFT = 'SOFT',
  HARD = 'HARD'
}

interface LimitConfig {
  dailyAmount: { value: number; type: LimitType };
  monthlyAmount: { value: number; type: LimitType };
  transactionCount: { value: number; type: LimitType };
  velocityWindow: number; // in minutes
  velocityCount: { value: number; type: LimitType };
  perTransactionMax: { value: number; type: LimitType };
}

interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  remainingLimits?: {
    dailyAmount: number;
    monthlyAmount: number;
    transactionCount: number;
    velocityCount: number;
  };
  warnings?: string[];
}

export class WalletLimitService {
  private static instance: WalletLimitService;
  private readonly redis: Redis;
  private readonly notificationService: NotificationService;
  private readonly tierLimits: Record<UserTier, LimitConfig>;

  private constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.notificationService = NotificationService.getInstance();
    this.tierLimits = {
      [UserTier.STANDARD]: {
        dailyAmount: { value: 5000, type: LimitType.HARD },
        monthlyAmount: { value: 50000, type: LimitType.HARD },
        transactionCount: { value: 20, type: LimitType.HARD },
        velocityWindow: 60,
        velocityCount: { value: 5, type: LimitType.HARD },
        perTransactionMax: { value: 1000, type: LimitType.HARD }
      },
      [UserTier.VERIFIED]: {
        dailyAmount: { value: 10000, type: LimitType.HARD },
        monthlyAmount: { value: 100000, type: LimitType.HARD },
        transactionCount: { value: 50, type: LimitType.HARD },
        velocityWindow: 60,
        velocityCount: { value: 10, type: LimitType.HARD },
        perTransactionMax: { value: 5000, type: LimitType.HARD }
      },
      [UserTier.AGENT]: {
        dailyAmount: { value: 50000, type: LimitType.HARD },
        monthlyAmount: { value: 500000, type: LimitType.HARD },
        transactionCount: { value: 200, type: LimitType.HARD },
        velocityWindow: 60,
        velocityCount: { value: 50, type: LimitType.HARD },
        perTransactionMax: { value: 25000, type: LimitType.HARD }
      },
      [UserTier.ADMIN]: {
        dailyAmount: { value: 1000000, type: LimitType.SOFT },
        monthlyAmount: { value: 10000000, type: LimitType.SOFT },
        transactionCount: { value: 1000, type: LimitType.SOFT },
        velocityWindow: 60,
        velocityCount: { value: 100, type: LimitType.SOFT },
        perTransactionMax: { value: 100000, type: LimitType.SOFT }
      }
    };
  }

  public static getInstance(): WalletLimitService {
    if (!WalletLimitService.instance) {
      WalletLimitService.instance = new WalletLimitService();
    }
    return WalletLimitService.instance;
  }

  async checkLimits(
    userId: string,
    amount: number
  ): Promise<LimitCheckResult> {
    const session = await this.redis.multi();
    const warnings: string[] = [];
    const remainingLimits: any = {};

    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const limits = user.walletLimits || this.tierLimits[user.tier || UserTier.STANDARD];
      const userTimezone = user.timezone || 'UTC';

      // Get current time in user's timezone
      const now = timezone.getCurrentTime(userTimezone);
      const today = now.format('YYYY-MM-DD');
      const month = now.format('YYYY-MM');

      // Check per-transaction limit
      if (amount > limits.perTransactionMax.value) {
        if (limits.perTransactionMax.type === LimitType.HARD) {
          return { allowed: false, reason: 'PER_TRANSACTION_LIMIT_EXCEEDED' };
        }
        warnings.push('Transaction amount exceeds recommended limit');
      }

      // Check daily amount
      const dailyKey = `wallet:${userId}:daily:${today}`;
      const dailyAmount = await this.redis.incrby(dailyKey, amount);
      await this.redis.expire(dailyKey, 86400);
      remainingLimits.dailyAmount = Math.max(0, limits.dailyAmount.value - dailyAmount);

      if (dailyAmount > limits.dailyAmount.value) {
        if (limits.dailyAmount.type === LimitType.HARD) {
          await this.logViolation(userId, 'DAILY_AMOUNT', dailyAmount, limits.dailyAmount.value);
          return { allowed: false, reason: 'DAILY_LIMIT_EXCEEDED' };
        }
        warnings.push('Daily limit exceeded');
      } else if (dailyAmount > limits.dailyAmount.value * 0.8) {
        await this.notifyLimitWarning(userId, 'DAILY_AMOUNT', dailyAmount, limits.dailyAmount.value);
      }

      // Check monthly amount
      const monthKey = `wallet:${userId}:monthly:${month}`;
      const monthlyAmount = await this.redis.incrby(monthKey, amount);
      await this.redis.expire(monthKey, 2592000);
      remainingLimits.monthlyAmount = Math.max(0, limits.monthlyAmount.value - monthlyAmount);

      if (monthlyAmount > limits.monthlyAmount.value) {
        if (limits.monthlyAmount.type === LimitType.HARD) {
          await this.logViolation(userId, 'MONTHLY_AMOUNT', monthlyAmount, limits.monthlyAmount.value);
          return { allowed: false, reason: 'MONTHLY_LIMIT_EXCEEDED' };
        }
        warnings.push('Monthly limit exceeded');
      } else if (monthlyAmount > limits.monthlyAmount.value * 0.8) {
        await this.notifyLimitWarning(userId, 'MONTHLY_AMOUNT', monthlyAmount, limits.monthlyAmount.value);
      }

      // Check transaction count
      const countKey = `wallet:${userId}:count:${today}`;
      const count = await this.redis.incr(countKey);
      await this.redis.expire(countKey, 86400);
      remainingLimits.transactionCount = Math.max(0, limits.transactionCount.value - count);

      if (count > limits.transactionCount.value) {
        if (limits.transactionCount.type === LimitType.HARD) {
          await this.logViolation(userId, 'TRANSACTION_COUNT', count, limits.transactionCount.value);
          return { allowed: false, reason: 'TRANSACTION_COUNT_EXCEEDED' };
        }
        warnings.push('Transaction count limit exceeded');
      } else if (count > limits.transactionCount.value * 0.8) {
        await this.notifyLimitWarning(userId, 'TRANSACTION_COUNT', count, limits.transactionCount.value);
      }

      // Check velocity
      const velocityKey = `wallet:${userId}:velocity:${Date.now()}`;
      const velocityCount = await this.redis.incr(velocityKey);
      await this.redis.expire(velocityKey, limits.velocityWindow * 60);
      remainingLimits.velocityCount = Math.max(0, limits.velocityCount.value - velocityCount);

      if (velocityCount > limits.velocityCount.value) {
        if (limits.velocityCount.type === LimitType.HARD) {
          await this.logViolation(userId, 'VELOCITY', velocityCount, limits.velocityCount.value);
          return { allowed: false, reason: 'VELOCITY_LIMIT_EXCEEDED' };
        }
        warnings.push('Transaction velocity limit exceeded');
      }

      await session.exec();

      return {
        allowed: true,
        warnings: warnings.length > 0 ? warnings : undefined,
        remainingLimits
      };
    } catch (error) {
      logger.error('Error checking wallet limits', {
        userId,
        error: error.message
      });
      // Fail open for system errors, but log them
      return { allowed: true };
    }
  }

  private async logViolation(
    userId: string,
    limitType: string,
    currentValue: number,
    limitValue: number
  ): Promise<void> {
    await LimitViolation.create({
      userId,
      limitType,
      currentValue,
      limitValue,
      timestamp: new Date()
    });
  }

  private async notifyLimitWarning(
    userId: string,
    limitType: string,
    currentValue: number,
    limitValue: number
  ): Promise<void> {
    const percentage = Math.round((currentValue / limitValue) * 100);
    await this.notificationService.sendLimitWarning({
      userId,
      limitType,
      percentage,
      currentValue,
      limitValue
    });
  }

  async getAvailableLimits(userId: string): Promise<LimitCheckResult['remainingLimits']> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const limits = user.walletLimits || this.tierLimits[user.tier || UserTier.STANDARD];
      const userTimezone = user.timezone || 'UTC';
      const now = timezone.getCurrentTime(userTimezone);
      const today = now.format('YYYY-MM-DD');
      const month = now.format('YYYY-MM');

      const [dailyAmount, monthlyAmount, count, velocityCount] = await Promise.all([
        this.redis.get(`wallet:${userId}:daily:${today}`),
        this.redis.get(`wallet:${userId}:monthly:${month}`),
        this.redis.get(`wallet:${userId}:count:${today}`),
        this.redis.get(`wallet:${userId}:velocity:${Date.now()}`)
      ]);

      return {
        dailyAmount: Math.max(0, limits.dailyAmount.value - (parseInt(dailyAmount || '0'))),
        monthlyAmount: Math.max(0, limits.monthlyAmount.value - (parseInt(monthlyAmount || '0'))),
        transactionCount: Math.max(0, limits.transactionCount.value - (parseInt(count || '0'))),
        velocityCount: Math.max(0, limits.velocityCount.value - (parseInt(velocityCount || '0')))
      };
    } catch (error) {
      logger.error('Error getting available limits', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  async updateLimits(
    userId: string,
    limits: Partial<LimitConfig>
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Only allow limit updates for admin users
      if (user.tier !== UserTier.ADMIN) {
        throw new Error('Unauthorized to update limits');
      }

      await User.findByIdAndUpdate(userId, {
        $set: { walletLimits: limits }
      });

      logger.info('Updated wallet limits', { userId, limits });
    } catch (error) {
      logger.error('Error updating wallet limits', {
        userId,
        error: error.message
      });
      throw error;
    }
  }

  async getTransactionHistory(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    return Transaction.find({
      $or: [{ senderId: userId }, { recipientId: userId }],
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });
  }

  async resetLimits(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Only allow limit resets for admin users
      if (user.tier !== UserTier.ADMIN) {
        throw new Error('Unauthorized to reset limits');
      }

      await User.findByIdAndUpdate(userId, {
        $unset: { walletLimits: 1 }
      });

      logger.info('Reset wallet limits to default', { userId });
    } catch (error) {
      logger.error('Error resetting wallet limits', {
        userId,
        error: error.message
      });
      throw error;
    }
  }
} 