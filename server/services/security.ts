import { redis } from '../redis/redis';
import logger from './logging';
import { config } from '../config';
import { User } from '../models/user';
import { Transaction } from '../models/transaction';
import crypto from 'crypto';
import { Request } from 'express';
import { CloudWatch } from 'aws-sdk';
import { SNS } from 'aws-sdk';

// Initialize AWS services
const cloudWatch = new CloudWatch({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

const sns = new SNS({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

// Security thresholds
const SECURITY_THRESHOLDS = {
  maxLoginAttempts: 5,
  maxFailedTransactions: 3,
  maxSuspiciousActivities: 5,
  maxIPChanges: 3,
  maxDeviceChanges: 2,
  maxLocationChanges: 3,
  maxVelocityThreshold: 10000, // $10,000 per hour
  maxTransactionAmount: 50000, // $50,000
  maxDailyTransactions: 100,
  maxConcurrentSessions: 3,
  sessionTimeout: 30 * 60, // 30 minutes
  passwordMinLength: 12,
  requireSpecialChars: true,
  requireNumbers: true,
  requireUppercase: true,
  requireLowercase: true,
};

// Security service class
export class SecurityService {
  private static instance: SecurityService;
  
  private constructor() {}
  
  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Check request security
  public async checkRequestSecurity(req: Request): Promise<{
    isSecure: boolean;
    reason?: string;
    riskScore: number;
  }> {
    try {
      const securityChecks = await Promise.all([
        this.checkIPSecurity(req),
        this.checkDeviceSecurity(req),
        this.checkLocationSecurity(req),
        this.checkBehaviorSecurity(req),
        this.checkSessionSecurity(req),
        this.checkRateLimitSecurity(req),
      ]);

      const riskScore = this.calculateRiskScore(securityChecks);
      const isSecure = riskScore < 0.7; // 70% risk threshold
      const reason = !isSecure ? this.getSecurityReason(securityChecks) : undefined;

      // Log security check results
      logger.info('Security check result', {
        ip: req.ip,
        userId: req.user?.id,
        riskScore,
        isSecure,
        reason,
        checks: securityChecks,
      });

      return {
        isSecure,
        reason,
        riskScore,
      };
    } catch (error) {
      logger.error('Error in security check', { error });
      throw error;
    }
  }

  // Check IP security
  private async checkIPSecurity(req: Request): Promise<{
    type: string;
    isSecure: boolean;
    risk: number;
  }> {
    const ip = req.ip;
    const userId = req.user?.id;

    // Check for known malicious IPs
    const isMaliciousIP = await this.isMaliciousIP(ip);
    if (isMaliciousIP) {
      return {
        type: 'IP',
        isSecure: false,
        risk: 1.0,
      };
    }

    // Check for IP changes
    if (userId) {
      const ipChanges = await this.getIPChanges(userId, ip);
      if (ipChanges > SECURITY_THRESHOLDS.maxIPChanges) {
        return {
          type: 'IP',
          isSecure: false,
          risk: 0.8,
        };
      }
    }

    // Check for IP reputation
    const ipReputation = await this.getIPReputation(ip);
    return {
      type: 'IP',
      isSecure: ipReputation > 0.7,
      risk: 1 - ipReputation,
    };
  }

  // Check device security
  private async checkDeviceSecurity(req: Request): Promise<{
    type: string;
    isSecure: boolean;
    risk: number;
  }> {
    const deviceId = req.headers['x-device-id'] as string;
    const userId = req.user?.id;

    if (!deviceId) {
      return {
        type: 'Device',
        isSecure: false,
        risk: 0.9,
      };
    }

    // Check for known malicious devices
    const isMaliciousDevice = await this.isMaliciousDevice(deviceId);
    if (isMaliciousDevice) {
      return {
        type: 'Device',
        isSecure: false,
        risk: 1.0,
      };
    }

    // Check for device changes
    if (userId) {
      const deviceChanges = await this.getDeviceChanges(userId, deviceId);
      if (deviceChanges > SECURITY_THRESHOLDS.maxDeviceChanges) {
        return {
          type: 'Device',
          isSecure: false,
          risk: 0.8,
        };
      }
    }

    return {
      type: 'Device',
      isSecure: true,
      risk: 0.2,
    };
  }

  // Check location security
  private async checkLocationSecurity(req: Request): Promise<{
    type: string;
    isSecure: boolean;
    risk: number;
  }> {
    const location = req.body.location;
    const userId = req.user?.id;

    if (!location) {
      return {
        type: 'Location',
        isSecure: false,
        risk: 0.9,
      };
    }

    // Check for known malicious locations
    const isMaliciousLocation = await this.isMaliciousLocation(location);
    if (isMaliciousLocation) {
      return {
        type: 'Location',
        isSecure: false,
        risk: 1.0,
      };
    }

    // Check for location changes
    if (userId) {
      const locationChanges = await this.getLocationChanges(userId, location);
      if (locationChanges > SECURITY_THRESHOLDS.maxLocationChanges) {
        return {
          type: 'Location',
          isSecure: false,
          risk: 0.8,
        };
      }
    }

    return {
      type: 'Location',
      isSecure: true,
      risk: 0.2,
    };
  }

  // Check behavior security
  private async checkBehaviorSecurity(req: Request): Promise<{
    type: string;
    isSecure: boolean;
    risk: number;
  }> {
    const userId = req.user?.id;
    if (!userId) {
      return {
        type: 'Behavior',
        isSecure: true,
        risk: 0.2,
      };
    }

    // Check for suspicious behavior patterns
    const suspiciousActivities = await this.getSuspiciousActivities(userId);
    if (suspiciousActivities > SECURITY_THRESHOLDS.maxSuspiciousActivities) {
      return {
        type: 'Behavior',
        isSecure: false,
        risk: 0.8,
      };
    }

    // Check for unusual time patterns
    const isUnusualTime = this.isUnusualTime();
    if (isUnusualTime) {
      return {
        type: 'Behavior',
        isSecure: false,
        risk: 0.7,
      };
    }

    return {
      type: 'Behavior',
      isSecure: true,
      risk: 0.2,
    };
  }

  // Check session security
  private async checkSessionSecurity(req: Request): Promise<{
    type: string;
    isSecure: boolean;
    risk: number;
  }> {
    const userId = req.user?.id;
    if (!userId) {
      return {
        type: 'Session',
        isSecure: true,
        risk: 0.2,
      };
    }

    // Check for concurrent sessions
    const concurrentSessions = await this.getConcurrentSessions(userId);
    if (concurrentSessions > SECURITY_THRESHOLDS.maxConcurrentSessions) {
      return {
        type: 'Session',
        isSecure: false,
        risk: 0.8,
      };
    }

    // Check session age
    const sessionAge = await this.getSessionAge(userId);
    if (sessionAge > SECURITY_THRESHOLDS.sessionTimeout) {
      return {
        type: 'Session',
        isSecure: false,
        risk: 0.7,
      };
    }

    return {
      type: 'Session',
      isSecure: true,
      risk: 0.2,
    };
  }

  // Check rate limit security
  private async checkRateLimitSecurity(req: Request): Promise<{
    type: string;
    isSecure: boolean;
    risk: number;
  }> {
    const userId = req.user?.id;
    const ip = req.ip;

    // Check for rate limit violations
    const rateLimitViolations = await this.getRateLimitViolations(userId || ip);
    if (rateLimitViolations > 0) {
      return {
        type: 'RateLimit',
        isSecure: false,
        risk: 0.8,
      };
    }

    return {
      type: 'RateLimit',
      isSecure: true,
      risk: 0.2,
    };
  }

  // Calculate risk score
  private calculateRiskScore(checks: Array<{ type: string; isSecure: boolean; risk: number }>): number {
    const weights = {
      IP: 0.2,
      Device: 0.2,
      Location: 0.15,
      Behavior: 0.15,
      Session: 0.15,
      RateLimit: 0.15,
    };

    return checks.reduce(
      (score, check) => score + check.risk * weights[check.type as keyof typeof weights],
      0
    );
  }

  // Get security reason
  private getSecurityReason(checks: Array<{ type: string; isSecure: boolean; risk: number }>): string {
    const highRiskChecks = checks
      .filter(check => check.risk > 0.7)
      .map(check => check.type);

    if (highRiskChecks.length === 0) {
      return 'Multiple security risks detected';
    }

    return `High risk detected in: ${highRiskChecks.join(', ')}`;
  }

  // Helper methods
  private async isMaliciousIP(ip: string): Promise<boolean> {
    const key = `malicious:ip:${ip}`;
    const isMalicious = await redis.get(key);
    
    if (isMalicious) {
      return isMalicious === 'true';
    }

    // TODO: Implement IP reputation check with external service
    return false;
  }

  private async isMaliciousDevice(deviceId: string): Promise<boolean> {
    const key = `malicious:device:${deviceId}`;
    const isMalicious = await redis.get(key);
    
    if (isMalicious) {
      return isMalicious === 'true';
    }

    // TODO: Implement device reputation check
    return false;
  }

  private async isMaliciousLocation(location: any): Promise<boolean> {
    const key = `malicious:location:${location.lat}:${location.lon}`;
    const isMalicious = await redis.get(key);
    
    if (isMalicious) {
      return isMalicious === 'true';
    }

    // TODO: Implement location reputation check
    return false;
  }

  private async getIPChanges(userId: string, ip: string): Promise<number> {
    const key = `user:ips:${userId}`;
    await redis.sadd(key, ip);
    const ipCount = await redis.scard(key);
    await redis.expire(key, 86400); // 24 hours expiry
    return ipCount;
  }

  private async getDeviceChanges(userId: string, deviceId: string): Promise<number> {
    const key = `user:devices:${userId}`;
    await redis.sadd(key, deviceId);
    const deviceCount = await redis.scard(key);
    await redis.expire(key, 86400); // 24 hours expiry
    return deviceCount;
  }

  private async getLocationChanges(userId: string, location: any): Promise<number> {
    const key = `user:locations:${userId}`;
    await redis.sadd(key, `${location.lat}:${location.lon}`);
    const locationCount = await redis.scard(key);
    await redis.expire(key, 86400); // 24 hours expiry
    return locationCount;
  }

  private async getSuspiciousActivities(userId: string): Promise<number> {
    const key = `suspicious:activities:${userId}`;
    const count = await redis.incr(key);
    await redis.expire(key, 3600); // 1 hour expiry
    return count;
  }

  private isUnusualTime(): boolean {
    const hour = new Date().getHours();
    return hour >= 1 && hour <= 5; // 1 AM - 5 AM
  }

  private async getConcurrentSessions(userId: string): Promise<number> {
    const key = `user:sessions:${userId}`;
    const count = await redis.scard(key);
    return count;
  }

  private async getSessionAge(userId: string): Promise<number> {
    const key = `user:session:${userId}`;
    const sessionStart = await redis.get(key);
    
    if (!sessionStart) {
      return 0;
    }

    return Math.floor((Date.now() - parseInt(sessionStart)) / 1000);
  }

  private async getRateLimitViolations(identifier: string): Promise<number> {
    const key = `ratelimit:violations:${identifier}`;
    const count = await redis.incr(key);
    await redis.expire(key, 3600); // 1 hour expiry
    return count;
  }

  private async getIPReputation(ip: string): Promise<number> {
    // TODO: Implement IP reputation check with external service
    return 0.8;
  }

  // Alert methods
  private async sendSecurityAlert(
    type: string,
    details: Record<string, any>
  ): Promise<void> {
    try {
      // Send alert to CloudWatch
      await cloudWatch.putMetricData({
        Namespace: 'Floussly/Security',
        MetricData: [
          {
            MetricName: 'SecurityAlert',
            Value: 1,
            Unit: 'Count',
            Timestamp: new Date(),
            Dimensions: [
              {
                Name: 'AlertType',
                Value: type,
              },
            ],
          },
        ],
      }).promise();

      // Send alert to SNS
      await sns.publish({
        TopicArn: config.aws.snsSecurityTopic,
        Message: JSON.stringify({
          type,
          details,
          timestamp: new Date().toISOString(),
        }),
      }).promise();

      logger.warn('Security alert sent', {
        type,
        details,
      });
    } catch (error) {
      logger.error('Failed to send security alert', {
        error,
        type,
        details,
      });
    }
  }
}

export default SecurityService.getInstance(); 