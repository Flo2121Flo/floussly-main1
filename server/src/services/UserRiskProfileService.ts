import { Pool } from 'pg';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { config } from '../config/appConfig';
import { AuditService, AuditEventType } from './AuditService';
import { NotificationService } from './NotificationService';
import { TransactionModel } from '../models/Transaction';

// Risk level enum
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Risk factor interface
export interface RiskFactor {
  name: string;
  weight: number;
  value: number;
  details: any;
}

// Risk profile interface
export interface RiskProfile {
  userId: string;
  riskLevel: RiskLevel;
  riskScore: number;
  factors: RiskFactor[];
  lastUpdated: Date;
  recommendations: string[];
}

export interface RiskScore {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: RiskFactor[];
}

// User risk profile service class
export class UserRiskProfileService {
  private static instance: UserRiskProfileService;
  private pool: Pool;
  private auditService: AuditService;
  private notificationService: NotificationService;
  private cacheTTL: number = 3600; // 1 hour
  private transactionModel: TransactionModel;

  private constructor() {
    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: config.NODE_ENV === 'production'
    });
    this.auditService = AuditService.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.transactionModel = new TransactionModel();
  }

  public static getInstance(): UserRiskProfileService {
    if (!UserRiskProfileService.instance) {
      UserRiskProfileService.instance = new UserRiskProfileService();
    }
    return UserRiskProfileService.instance;
  }

  // Get user's risk profile
  public async getRiskProfile(userId: string): Promise<RiskScore> {
    try {
      const userData = await this.getUserData(userId);
      return this.calculateRiskProfile(userData);
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to get risk profile', { error: err.message });
      throw new Error(`Failed to get risk profile: ${err.message}`);
    }
  }

  // Calculate risk profile
  private async calculateRiskProfile(userData: any): Promise<RiskScore> {
    try {
      // Calculate risk factors
      const factors = await this.calculateRiskFactors(userData);
      
      // Calculate overall risk score
      const riskScore = this.calculateRiskScore(factors);
      
      return riskScore;
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to calculate risk profile', { error: err.message });
      throw new Error(`Failed to calculate risk profile: ${err.message}`);
    }
  }

  // Get user data
  private async getUserData(userId: string): Promise<any> {
    try {
      const result = await this.pool.query(
        `SELECT 
          u.*,
          COUNT(t.id) as total_transactions,
          SUM(t.amount) as total_volume,
          COUNT(DISTINCT t.recipient_id) as unique_recipients,
          COUNT(DISTINCT t.ip_address) as unique_ips,
          COUNT(fe.id) as fraud_events,
          MAX(fe.created_at) as last_fraud_event
         FROM users u
         LEFT JOIN transactions t ON t.user_id = u.id
         LEFT JOIN fraud_events fe ON fe.user_id = u.id
         WHERE u.id = $1
         GROUP BY u.id`,
        [userId]
      );

      return result.rows[0];
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to get user data', { error: err.message });
      throw new Error(`Failed to get user data: ${err.message}`);
    }
  }

  // Calculate risk factors
  private async calculateRiskFactors(userData: any): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = [];

    try {
      // KYC Level Factor
      factors.push({
        name: 'kyc_level',
        weight: 0.2,
        value: this.calculateKYCLevelFactor(userData.kyc_level),
        details: { kyc_level: userData.kyc_level }
      });

      // Account Age Factor
      factors.push(await this.calculateAccountAgeFactor(userData));

      // Transaction History Factor
      factors.push(await this.calculateTransactionHistoryFactor(userData));

      // Recipient Diversity Factor
      factors.push({
        name: 'recipient_diversity',
        weight: 0.1,
        value: this.calculateRecipientDiversityFactor(userData),
        details: {
          unique_recipients: userData.unique_recipients,
          total_transactions: userData.total_transactions
        }
      });

      // Location Diversity Factor
      factors.push(await this.calculateLocationFactor(userData));

      // Fraud History Factor
      factors.push({
        name: 'fraud_history',
        weight: 0.2,
        value: this.calculateFraudHistoryFactor(userData),
        details: {
          fraud_events: userData.fraud_events,
          last_fraud_event: userData.last_fraud_event
        }
      });

      // Device Security Factor
      factors.push(await this.calculateDeviceSecurityFactor(userData));

      return factors;
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to calculate risk factors', { error: err.message });
      throw new Error(`Failed to calculate risk factors: ${err.message}`);
    }
  }

  // Calculate KYC level factor
  private calculateKYCLevelFactor(kycLevel: number): number {
    switch (kycLevel) {
      case 0: return 1.0; // Highest risk
      case 1: return 0.8;
      case 2: return 0.5;
      case 3: return 0.2; // Lowest risk
      default: return 1.0;
    }
  }

  // Calculate account age factor
  private async calculateAccountAgeFactor(userData: any): Promise<RiskFactor> {
    try {
      const accountAge = this.calculateAccountAge(userData.created_at);
      let score = 0;

      if (accountAge < 30) {
        score = 0.8;
      } else if (accountAge < 90) {
        score = 0.5;
      } else if (accountAge < 180) {
        score = 0.3;
      } else {
        score = 0.1;
      }

      return {
        name: 'Account Age',
        weight: 0.2,
        value: score,
        details: `Account age: ${accountAge} days`
      };
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to calculate account age factor', { error: err.message });
      throw new Error(`Failed to calculate account age factor: ${err.message}`);
    }
  }

  // Calculate transaction history factor
  private async calculateTransactionHistoryFactor(userData: any): Promise<RiskFactor> {
    try {
      const transactions = await this.transactionModel.findByUserId(userData.id);
      const totalTransactions = transactions.length;
      const failedTransactions = transactions.filter(t => t.status === 'FAILED').length;
      const score = failedTransactions / totalTransactions || 0;

      return {
        name: 'Transaction History',
        weight: 0.3,
        value: score,
        details: `Failed transactions: ${failedTransactions}/${totalTransactions}`
      };
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to calculate transaction history factor', { error: err.message });
      throw new Error(`Failed to calculate transaction history factor: ${err.message}`);
    }
  }

  // Calculate recipient diversity factor
  private calculateRecipientDiversityFactor(userData: any): number {
    if (!userData.total_transactions) return 1.0;
    
    const diversityRatio = userData.unique_recipients / userData.total_transactions;
    
    if (diversityRatio < 0.2) return 0.8;
    if (diversityRatio < 0.4) return 0.6;
    if (diversityRatio < 0.6) return 0.4;
    return 0.2;
  }

  // Calculate location factor
  private async calculateLocationFactor(userData: any): Promise<RiskFactor> {
    try {
      const locationScore = this.assessLocationRisk(userData.locations);
      return {
        name: 'Location Risk',
        weight: 0.15,
        value: locationScore,
        details: 'Location risk assessment'
      };
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to calculate location factor', { error: err.message });
      throw new Error(`Failed to calculate location factor: ${err.message}`);
    }
  }

  // Calculate fraud history factor
  private calculateFraudHistoryFactor(userData: any): number {
    if (!userData.fraud_events) return 0.2;
    
    if (userData.fraud_events > 5) return 1.0;
    if (userData.fraud_events > 3) return 0.8;
    if (userData.fraud_events > 1) return 0.6;
    return 0.4;
  }

  // Calculate device security factor
  private async calculateDeviceSecurityFactor(userData: any): Promise<RiskFactor> {
    try {
      const deviceScore = this.assessDeviceSecurity(userData.devices);
      return {
        name: 'Device Security',
        weight: 0.2,
        value: deviceScore,
        details: 'Device security assessment'
      };
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to calculate device security factor', { error: err.message });
      throw new Error(`Failed to calculate device security factor: ${err.message}`);
    }
  }

  // Calculate overall risk score
  private calculateRiskScore(factors: RiskFactor[]): RiskScore {
    const totalScore = factors.reduce((sum, factor) => sum + (factor.value * factor.weight), 0);
    const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
    const normalizedScore = totalScore / totalWeight;

    let level: 'LOW' | 'MEDIUM' | 'HIGH';
    if (normalizedScore < 0.3) {
      level = 'LOW';
    } else if (normalizedScore < 0.7) {
      level = 'MEDIUM';
    } else {
      level = 'HIGH';
    }

    return {
      score: normalizedScore,
      level,
      factors
    };
  }

  // Determine risk level
  private determineRiskLevel(riskScore: number): RiskLevel {
    if (riskScore >= 0.8) return RiskLevel.CRITICAL;
    if (riskScore >= 0.6) return RiskLevel.HIGH;
    if (riskScore >= 0.4) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  // Generate recommendations
  private generateRecommendations(
    factors: RiskFactor[],
    riskLevel: RiskLevel
  ): string[] {
    const recommendations: string[] = [];

    // Add general recommendations based on risk level
    if (riskLevel === RiskLevel.CRITICAL) {
      recommendations.push('Immediate account review required');
      recommendations.push('Consider temporary account suspension');
    } else if (riskLevel === RiskLevel.HIGH) {
      recommendations.push('Enhanced monitoring required');
      recommendations.push('Consider additional KYC verification');
    }

    // Add specific recommendations based on risk factors
    factors.forEach(factor => {
      if (factor.value >= 0.8) {
        switch (factor.name) {
          case 'kyc_level':
            recommendations.push('Upgrade KYC level to reduce risk');
            break;
          case 'account_age':
            recommendations.push('Implement additional verification for new accounts');
            break;
          case 'transaction_history':
            recommendations.push('Review large transaction patterns');
            break;
          case 'recipient_diversity':
            recommendations.push('Monitor recipient patterns');
            break;
          case 'location_diversity':
            recommendations.push('Review location patterns');
            break;
          case 'fraud_history':
            recommendations.push('Implement enhanced fraud monitoring');
            break;
          case 'device_security':
            recommendations.push('Review device security settings');
            break;
        }
      }
    });

    return recommendations;
  }

  // Log risk profile update
  private async logRiskProfileUpdate(
    userId: string,
    profile: RiskProfile
  ): Promise<void> {
    try {
      // Log to audit trail
      await this.auditService.logEvent({
        eventType: AuditEventType.RISK_PROFILE_UPDATE,
        userId,
        details: {
          riskLevel: profile.riskLevel,
          riskScore: profile.riskScore,
          factors: profile.factors
        },
        severity: profile.riskLevel
      });

      // Notify if risk level is high or critical
      if (profile.riskLevel === RiskLevel.HIGH || profile.riskLevel === RiskLevel.CRITICAL) {
        await this.notificationService.sendNotification(userId, {
          type: 'risk_alert',
          title: 'Risk Level Update',
          message: `Your account risk level has been updated to ${profile.riskLevel}`,
          data: {
            riskLevel: profile.riskLevel,
            recommendations: profile.recommendations
          }
        });
      }
    } catch (error) {
      logger.error('Failed to log risk profile update', { error: error.message });
    }
  }

  // Get risk profile history
  public async getRiskProfileHistory(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<any[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM risk_profile_history 
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to get risk profile history', { error: error.message });
      throw error;
    }
  }

  // Get risk statistics
  public async getRiskStats(): Promise<any> {
    try {
      const result = await this.pool.query(
        `SELECT 
          risk_level,
          COUNT(*) as user_count,
          AVG(risk_score) as avg_risk_score
         FROM risk_profiles
         GROUP BY risk_level
         ORDER BY risk_level`
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to get risk statistics', { error: error.message });
      throw error;
    }
  }

  private calculateAccountAge(createdAt: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private assessDeviceSecurity(devices: any[]): number {
    // Implement device security assessment logic
    return 0.5;
  }

  private assessLocationRisk(locations: any[]): number {
    // Implement location risk assessment logic
    return 0.5;
  }
} 