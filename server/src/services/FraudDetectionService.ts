import { logger } from '../utils/logger';
import { redis } from '../utils/redis';
import { User } from '../models/User';
import { sendSecurityAlert } from '../utils/email';

interface RiskScore {
  score: number;
  factors: string[];
  level: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface TransactionContext {
  userId: string;
  amount: number;
  type: string;
  location?: {
    ip: string;
    country: string;
    city: string;
  };
  deviceInfo?: {
    deviceId: string;
    userAgent: string;
    platform: string;
  };
}

export class FraudDetectionService {
  private static instance: FraudDetectionService;
  private readonly RISK_THRESHOLDS = {
    LOW: 30,
    MEDIUM: 60,
    HIGH: 80
  };

  private constructor() {}

  public static getInstance(): FraudDetectionService {
    if (!FraudDetectionService.instance) {
      FraudDetectionService.instance = new FraudDetectionService();
    }
    return FraudDetectionService.instance;
  }

  async assessTransactionRisk(context: TransactionContext): Promise<RiskScore> {
    try {
      const factors: string[] = [];
      let score = 0;

      // Check transaction amount
      const amountRisk = await this.assessAmountRisk(context.amount, context.userId);
      score += amountRisk.score;
      factors.push(...amountRisk.factors);

      // Check velocity
      const velocityRisk = await this.assessVelocityRisk(context);
      score += velocityRisk.score;
      factors.push(...velocityRisk.factors);

      // Check location
      if (context.location) {
        const locationRisk = await this.assessLocationRisk(context);
        score += locationRisk.score;
        factors.push(...locationRisk.factors);
      }

      // Check device
      if (context.deviceInfo) {
        const deviceRisk = await this.assessDeviceRisk(context);
        score += deviceRisk.score;
        factors.push(...deviceRisk.factors);
      }

      // Determine risk level
      const level = this.determineRiskLevel(score);

      // Log risk assessment
      logger.info('Transaction risk assessment', {
        userId: context.userId,
        score,
        level,
        factors,
        timestamp: new Date().toISOString()
      });

      return { score, factors, level };
    } catch (error) {
      logger.error('Error assessing transaction risk', {
        error: error.message,
        context,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  private async assessAmountRisk(amount: number, userId: string): Promise<RiskScore> {
    const factors: string[] = [];
    let score = 0;

    // Get user's transaction history
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check against user's typical transaction amounts
    const avgAmount = await this.getAverageTransactionAmount(userId);
    if (amount > avgAmount * 3) {
      score += 20;
      factors.push('Amount significantly higher than average');
    }

    // Check against tier limits
    const tierLimits = this.getTierLimits(user.tier);
    if (amount > tierLimits.maxTransaction) {
      score += 30;
      factors.push('Amount exceeds tier limit');
    }

    return { score, factors, level: this.determineRiskLevel(score) };
  }

  private async assessVelocityRisk(context: TransactionContext): Promise<RiskScore> {
    const factors: string[] = [];
    let score = 0;

    // Check transaction frequency
    const key = `transactions:${context.userId}:count`;
    const count = await redis.incr(key);
    await redis.expire(key, 3600); // 1 hour window

    if (count > 10) {
      score += 25;
      factors.push('High transaction frequency');
    }

    // Check amount velocity
    const amountKey = `transactions:${context.userId}:amount`;
    const totalAmount = await redis.incrbyfloat(amountKey, context.amount);
    await redis.expire(amountKey, 3600);

    if (totalAmount > 10000) { // 10,000 MAD threshold
      score += 30;
      factors.push('High amount velocity');
    }

    return { score, factors, level: this.determineRiskLevel(score) };
  }

  private async assessLocationRisk(context: TransactionContext): Promise<RiskScore> {
    const factors: string[] = [];
    let score = 0;

    // Check if location is in user's typical locations
    const userLocations = await this.getUserLocations(context.userId);
    const isKnownLocation = userLocations.some(
      loc => loc.country === context.location?.country
    );

    if (!isKnownLocation) {
      score += 20;
      factors.push('Unusual location');
    }

    // Check for high-risk countries
    if (this.isHighRiskCountry(context.location?.country)) {
      score += 25;
      factors.push('High-risk country');
    }

    return { score, factors, level: this.determineRiskLevel(score) };
  }

  private async assessDeviceRisk(context: TransactionContext): Promise<RiskScore> {
    const factors: string[] = [];
    let score = 0;

    // Check if device is known
    const knownDevices = await this.getUserDevices(context.userId);
    const isKnownDevice = knownDevices.some(
      device => device.deviceId === context.deviceInfo?.deviceId
    );

    if (!isKnownDevice) {
      score += 15;
      factors.push('New device');
    }

    // Check for suspicious user agent
    if (this.isSuspiciousUserAgent(context.deviceInfo?.userAgent)) {
      score += 20;
      factors.push('Suspicious user agent');
    }

    return { score, factors, level: this.determineRiskLevel(score) };
  }

  private determineRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (score >= this.RISK_THRESHOLDS.HIGH) return 'HIGH';
    if (score >= this.RISK_THRESHOLDS.MEDIUM) return 'MEDIUM';
    return 'LOW';
  }

  private async getAverageTransactionAmount(userId: string): Promise<number> {
    // Implement logic to calculate average transaction amount
    return 1000; // Placeholder
  }

  private getTierLimits(tier: string): { maxTransaction: number } {
    const limits = {
      STANDARD: 5000,
      PREMIUM: 20000,
      BUSINESS: 50000,
      ADMIN: 100000
    };
    return { maxTransaction: limits[tier as keyof typeof limits] || 5000 };
  }

  private async getUserLocations(userId: string): Promise<Array<{ country: string }>> {
    // Implement logic to get user's typical locations
    return [{ country: 'MA' }]; // Placeholder
  }

  private isHighRiskCountry(country?: string): boolean {
    const highRiskCountries = ['XX', 'YY', 'ZZ']; // Placeholder
    return country ? highRiskCountries.includes(country) : false;
  }

  private async getUserDevices(userId: string): Promise<Array<{ deviceId: string }>> {
    // Implement logic to get user's known devices
    return [{ deviceId: 'default' }]; // Placeholder
  }

  private isSuspiciousUserAgent(userAgent?: string): boolean {
    if (!userAgent) return true;
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /headless/i
    ];
    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  async handleHighRiskTransaction(context: TransactionContext): Promise<void> {
    try {
      const user = await User.findById(context.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Send security alert
      await sendSecurityAlert(user.email, {
        type: 'HIGH_RISK_TRANSACTION',
        deviceInfo: context.deviceInfo,
        location: context.location,
        action: 'Transaction blocked'
      });

      // Log security event
      logger.warn('High-risk transaction detected', {
        userId: context.userId,
        context,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error handling high-risk transaction', {
        error: error.message,
        context,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
}

export default FraudDetectionService; 