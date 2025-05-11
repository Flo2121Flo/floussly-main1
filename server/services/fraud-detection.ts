import { redis } from '../redis/redis';
import logger from './logging';
import { User } from '../models/user';
import { Transaction } from '../models/transaction';
import { config } from '../config';

// Fraud detection service
export class FraudDetectionService {
  private static instance: FraudDetectionService;
  
  private constructor() {}
  
  public static getInstance(): FraudDetectionService {
    if (!FraudDetectionService.instance) {
      FraudDetectionService.instance = new FraudDetectionService();
    }
    return FraudDetectionService.instance;
  }

  // Check transaction for fraud
  public async checkTransaction(transaction: Transaction, user: User): Promise<{
    isFraudulent: boolean;
    reason?: string;
    riskScore: number;
  }> {
    try {
      const riskFactors = await this.calculateRiskFactors(transaction, user);
      const riskScore = this.calculateRiskScore(riskFactors);
      
      const isFraudulent = riskScore > 0.7; // 70% risk threshold
      const reason = isFraudulent ? this.getFraudReason(riskFactors) : undefined;

      // Log fraud detection results
      logger.info('Fraud detection result', {
        transactionId: transaction.id,
        userId: user.id,
        riskScore,
        isFraudulent,
        reason,
        riskFactors,
      });

      return {
        isFraudulent,
        reason,
        riskScore,
      };
    } catch (error) {
      logger.error('Error in fraud detection', { error, transactionId: transaction.id });
      throw error;
    }
  }

  // Calculate risk factors
  private async calculateRiskFactors(
    transaction: Transaction,
    user: User
  ): Promise<Record<string, number>> {
    const factors: Record<string, number> = {};

    // Amount-based risk
    factors.amountRisk = await this.calculateAmountRisk(transaction.amount, user);

    // Velocity-based risk
    factors.velocityRisk = await this.calculateVelocityRisk(transaction.amount, user.id);

    // Location-based risk
    factors.locationRisk = await this.calculateLocationRisk(transaction, user);

    // Device-based risk
    factors.deviceRisk = await this.calculateDeviceRisk(transaction, user);

    // Pattern-based risk
    factors.patternRisk = await this.calculatePatternRisk(transaction, user);

    // Time-based risk
    factors.timeRisk = this.calculateTimeRisk(transaction);

    return factors;
  }

  // Calculate amount-based risk
  private async calculateAmountRisk(amount: number, user: User): Promise<number> {
    const userAvgTransaction = await this.getUserAverageTransaction(user.id);
    const userMaxTransaction = await this.getUserMaxTransaction(user.id);

    if (amount > userMaxTransaction * 2) {
      return 0.8;
    }

    if (amount > userAvgTransaction * 3) {
      return 0.6;
    }

    return 0.2;
  }

  // Calculate velocity-based risk
  private async calculateVelocityRisk(amount: number, userId: string): Promise<number> {
    const key = `velocity:${userId}`;
    const currentVelocity = await redis.incrby(key, amount);
    await redis.expire(key, 3600); // 1 hour expiry

    if (currentVelocity > 10000) { // $10,000 per hour
      return 0.9;
    }

    if (currentVelocity > 5000) { // $5,000 per hour
      return 0.7;
    }

    return 0.3;
  }

  // Calculate location-based risk
  private async calculateLocationRisk(
    transaction: Transaction,
    user: User
  ): Promise<number> {
    const userLocations = await this.getUserLocations(user.id);
    const transactionLocation = transaction.location;

    if (!transactionLocation || !userLocations.length) {
      return 0.5;
    }

    const isKnownLocation = userLocations.some(
      loc => this.calculateDistance(loc, transactionLocation) < 50 // 50km radius
    );

    return isKnownLocation ? 0.2 : 0.8;
  }

  // Calculate device-based risk
  private async calculateDeviceRisk(
    transaction: Transaction,
    user: User
  ): Promise<number> {
    const userDevices = await this.getUserDevices(user.id);
    const transactionDevice = transaction.deviceId;

    if (!transactionDevice || !userDevices.length) {
      return 0.5;
    }

    return userDevices.includes(transactionDevice) ? 0.2 : 0.8;
  }

  // Calculate pattern-based risk
  private async calculatePatternRisk(
    transaction: Transaction,
    user: User
  ): Promise<number> {
    const userPatterns = await this.getUserPatterns(user.id);
    const transactionPattern = this.getTransactionPattern(transaction);

    if (!userPatterns.length) {
      return 0.5;
    }

    const isKnownPattern = userPatterns.some(
      pattern => this.comparePatterns(pattern, transactionPattern)
    );

    return isKnownPattern ? 0.2 : 0.8;
  }

  // Calculate time-based risk
  private calculateTimeRisk(transaction: Transaction): number {
    const hour = new Date(transaction.createdAt).getHours();
    
    // Higher risk during unusual hours (e.g., 1 AM - 5 AM)
    if (hour >= 1 && hour <= 5) {
      return 0.8;
    }

    return 0.2;
  }

  // Calculate risk score
  private calculateRiskScore(factors: Record<string, number>): number {
    const weights = {
      amountRisk: 0.3,
      velocityRisk: 0.2,
      locationRisk: 0.15,
      deviceRisk: 0.15,
      patternRisk: 0.1,
      timeRisk: 0.1,
    };

    return Object.entries(factors).reduce(
      (score, [factor, value]) => score + value * weights[factor as keyof typeof weights],
      0
    );
  }

  // Get fraud reason
  private getFraudReason(factors: Record<string, number>): string {
    const highRiskFactors = Object.entries(factors)
      .filter(([_, value]) => value > 0.7)
      .map(([factor]) => factor);

    if (highRiskFactors.length === 0) {
      return 'Multiple risk factors detected';
    }

    return `High risk detected in: ${highRiskFactors.join(', ')}`;
  }

  // Helper methods
  private async getUserAverageTransaction(userId: string): Promise<number> {
    const key = `user:avg:transaction:${userId}`;
    const avg = await redis.get(key);
    
    if (avg) {
      return parseFloat(avg);
    }

    // Calculate from database if not in cache
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100);

    if (transactions.length === 0) {
      return 0;
    }

    const sum = transactions.reduce((acc, t) => acc + t.amount, 0);
    const average = sum / transactions.length;

    await redis.set(key, average.toString(), 'EX', 3600); // 1 hour cache
    return average;
  }

  private async getUserMaxTransaction(userId: string): Promise<number> {
    const key = `user:max:transaction:${userId}`;
    const max = await redis.get(key);
    
    if (max) {
      return parseFloat(max);
    }

    const transaction = await Transaction.findOne({ userId })
      .sort({ amount: -1 });

    const maxAmount = transaction?.amount || 0;
    await redis.set(key, maxAmount.toString(), 'EX', 3600); // 1 hour cache
    return maxAmount;
  }

  private async getUserLocations(userId: string): Promise<any[]> {
    const key = `user:locations:${userId}`;
    const locations = await redis.get(key);
    
    if (locations) {
      return JSON.parse(locations);
    }

    const transactions = await Transaction.find({ userId })
      .select('location')
      .distinct('location');

    await redis.set(key, JSON.stringify(transactions), 'EX', 86400); // 24 hours cache
    return transactions;
  }

  private async getUserDevices(userId: string): Promise<string[]> {
    const key = `user:devices:${userId}`;
    const devices = await redis.get(key);
    
    if (devices) {
      return JSON.parse(devices);
    }

    const transactions = await Transaction.find({ userId })
      .select('deviceId')
      .distinct('deviceId');

    await redis.set(key, JSON.stringify(transactions), 'EX', 86400); // 24 hours cache
    return transactions;
  }

  private async getUserPatterns(userId: string): Promise<any[]> {
    const key = `user:patterns:${userId}`;
    const patterns = await redis.get(key);
    
    if (patterns) {
      return JSON.parse(patterns);
    }

    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100);

    const patternsList = transactions.map(t => this.getTransactionPattern(t));
    await redis.set(key, JSON.stringify(patternsList), 'EX', 86400); // 24 hours cache
    return patternsList;
  }

  private getTransactionPattern(transaction: Transaction): any {
    return {
      amount: transaction.amount,
      time: new Date(transaction.createdAt).getHours(),
      day: new Date(transaction.createdAt).getDay(),
      location: transaction.location,
      deviceId: transaction.deviceId,
    };
  }

  private comparePatterns(pattern1: any, pattern2: any): boolean {
    return (
      Math.abs(pattern1.amount - pattern2.amount) < pattern1.amount * 0.2 &&
      pattern1.time === pattern2.time &&
      pattern1.day === pattern2.day &&
      this.calculateDistance(pattern1.location, pattern2.location) < 50
    );
  }

  private calculateDistance(loc1: any, loc2: any): number {
    if (!loc1 || !loc2) return Infinity;

    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(loc2.lat - loc1.lat);
    const dLon = this.toRad(loc2.lon - loc1.lon);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(loc1.lat)) *
        Math.cos(this.toRad(loc2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}

export default FraudDetectionService.getInstance(); 