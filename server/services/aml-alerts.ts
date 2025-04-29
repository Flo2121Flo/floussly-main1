import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import { SuspiciousPattern } from './aml-monitor';

interface AlertConfig {
  severity: 'low' | 'medium' | 'high';
  threshold: number;
  cooldown: number; // in seconds
}

interface Alert {
  id: string;
  userId: string;
  pattern: SuspiciousPattern;
  timestamp: number;
  details: Record<string, any>;
}

export class AMLAlerts {
  private static instance: AMLAlerts;
  private redis: Redis;
  private alertConfigs: Record<string, AlertConfig> = {
    rapidTransactions: {
      severity: 'medium',
      threshold: 3, // Number of occurrences before alert
      cooldown: 3600, // 1 hour
    },
    instantTopupWithdrawal: {
      severity: 'high',
      threshold: 2,
      cooldown: 7200, // 2 hours
    },
    multipleRecipients: {
      severity: 'medium',
      threshold: 3,
      cooldown: 3600,
    },
    smallTransactions: {
      severity: 'low',
      threshold: 5,
      cooldown: 1800, // 30 minutes
    },
  };

  private constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  public static getInstance(): AMLAlerts {
    if (!AMLAlerts.instance) {
      AMLAlerts.instance = new AMLAlerts();
    }
    return AMLAlerts.instance;
  }

  private async isInCooldown(userId: string, patternType: string): Promise<boolean> {
    const key = `aml:cooldown:${userId}:${patternType}`;
    const cooldown = await this.redis.get(key);
    return cooldown !== null;
  }

  private async setCooldown(userId: string, patternType: string, cooldown: number): Promise<void> {
    const key = `aml:cooldown:${userId}:${patternType}`;
    await this.redis.setex(key, cooldown, '1');
  }

  private async incrementPatternCount(userId: string, patternType: string): Promise<number> {
    const key = `aml:pattern:${userId}:${patternType}`;
    return await this.redis.incr(key);
  }

  private async resetPatternCount(userId: string, patternType: string): Promise<void> {
    const key = `aml:pattern:${userId}:${patternType}`;
    await this.redis.del(key);
  }

  public async handleSuspiciousActivity(
    userId: string,
    pattern: SuspiciousPattern,
    details: Record<string, any>
  ): Promise<void> {
    try {
      const config = this.alertConfigs[pattern.type];
      if (!config) {
        logger.warn('No alert configuration found for pattern type', { patternType: pattern.type });
        return;
      }

      // Check if in cooldown
      if (await this.isInCooldown(userId, pattern.type)) {
        return;
      }

      // Increment pattern count
      const count = await this.incrementPatternCount(userId, pattern.type);

      // Check if threshold reached
      if (count >= config.threshold) {
        // Create alert
        const alert: Alert = {
          id: `${userId}:${Date.now()}`,
          userId,
          pattern,
          timestamp: Date.now(),
          details,
        };

        // Store alert
        await this.redis.hset(
          `aml:alerts:${userId}`,
          alert.id,
          JSON.stringify(alert)
        );

        // Set cooldown
        await this.setCooldown(userId, pattern.type, config.cooldown);

        // Reset pattern count
        await this.resetPatternCount(userId, pattern.type);

        // Log alert
        logger.warn('AML alert triggered', {
          userId,
          pattern,
          count,
          details,
        });

        // TODO: Send notification to compliance team
        // TODO: Implement notification system
      }
    } catch (error) {
      logger.error('Failed to handle suspicious activity', {
        error,
        userId,
        pattern,
      });
    }
  }

  public async getAlerts(userId: string): Promise<Alert[]> {
    try {
      const alerts = await this.redis.hgetall(`aml:alerts:${userId}`);
      return Object.values(alerts).map(alert => JSON.parse(alert));
    } catch (error) {
      logger.error('Failed to get alerts', { error, userId });
      return [];
    }
  }

  public async clearAlerts(userId: string): Promise<void> {
    try {
      await this.redis.del(`aml:alerts:${userId}`);
    } catch (error) {
      logger.error('Failed to clear alerts', { error, userId });
    }
  }
} 