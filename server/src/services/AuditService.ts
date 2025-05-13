import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { redis } from '../config/redis';
import { config } from '../config/appConfig';

export enum AuditEventType {
  // User Events
  USER_REGISTRATION = 'USER_REGISTRATION',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  MFA_ENABLE = 'MFA_ENABLE',
  MFA_DISABLE = 'MFA_DISABLE',
  BIOMETRIC_ENABLE = 'BIOMETRIC_ENABLE',
  BIOMETRIC_DISABLE = 'BIOMETRIC_DISABLE',
  
  // KYC Events
  KYC_SUBMISSION = 'KYC_SUBMISSION',
  KYC_APPROVAL = 'KYC_APPROVAL',
  KYC_REJECTION = 'KYC_REJECTION',
  KYC_LEVEL_CHANGE = 'KYC_LEVEL_CHANGE',
  
  // Transaction Events
  TRANSACTION_CREATE = 'TRANSACTION_CREATE',
  TRANSACTION_COMPLETE = 'TRANSACTION_COMPLETE',
  TRANSACTION_FAIL = 'TRANSACTION_FAIL',
  TRANSACTION_REVERSE = 'TRANSACTION_REVERSE',
  
  // AML Events
  AML_CHECK = 'AML_CHECK',
  AML_FLAG = 'AML_FLAG',
  AML_CLEAR = 'AML_CLEAR',
  
  // Security Events
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  FRAUD_ATTEMPT = 'FRAUD_ATTEMPT',
  SECURITY_BREACH = 'SECURITY_BREACH',
  
  // System Events
  CONFIG_CHANGE = 'CONFIG_CHANGE',
  FEATURE_TOGGLE = 'FEATURE_TOGGLE',
  SYSTEM_ERROR = 'SYSTEM_ERROR'
}

interface AuditEvent {
  eventId: string;
  eventType: AuditEventType;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  timestamp: Date;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
}

export class AuditService {
  private static instance: AuditService;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      connectionString: config.DATABASE_URL
    });
  }

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  public async logEvent(event: Omit<AuditEvent, 'eventId' | 'timestamp'>): Promise<void> {
    try {
      const eventId = crypto.randomUUID();
      const timestamp = new Date();

      // Log to database
      await this.pool.query(
        `INSERT INTO audit_logs (
          event_id, event_type, user_id, ip_address, user_agent,
          details, timestamp, severity
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          eventId,
          event.eventType,
          event.userId,
          event.ipAddress,
          event.userAgent,
          JSON.stringify(event.details),
          timestamp,
          event.severity
        ]
      );

      // Cache recent events in Redis
      await this.cacheEvent(eventId, { ...event, eventId, timestamp });

      // Log to monitoring service
      this.logToMonitoring(event);

      // Check for suspicious patterns
      await this.checkSuspiciousPatterns(event);
    } catch (error) {
      logger.error('Failed to log audit event', {
        error: error.message,
        event
      });
    }
  }

  private async cacheEvent(eventId: string, event: AuditEvent): Promise<void> {
    const key = `audit:recent:${event.userId || 'system'}`;
    await redis.lpush(key, JSON.stringify(event));
    await redis.ltrim(key, 0, 99); // Keep last 100 events
    await redis.expire(key, 86400); // Expire after 24 hours
  }

  private logToMonitoring(event: AuditEvent): void {
    // Log to Sentry for errors
    if (event.severity === 'ERROR' || event.severity === 'CRITICAL') {
      logger.error('Audit event', {
        eventType: event.eventType,
        userId: event.userId,
        details: event.details,
        severity: event.severity
      });
    }

    // Log to CloudWatch
    logger.info('Audit event', {
      eventType: event.eventType,
      userId: event.userId,
      severity: event.severity
    });
  }

  private async checkSuspiciousPatterns(event: AuditEvent): Promise<void> {
    if (!event.userId) return;

    const recentEvents = await this.getRecentEvents(event.userId);
    const suspiciousPatterns = this.detectSuspiciousPatterns(recentEvents);

    if (suspiciousPatterns.length > 0) {
      await this.logEvent({
        eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
        userId: event.userId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        details: {
          patterns: suspiciousPatterns,
          triggerEvent: event
        },
        severity: 'WARNING'
      });
    }
  }

  private async getRecentEvents(userId: string): Promise<AuditEvent[]> {
    const key = `audit:recent:${userId}`;
    const events = await redis.lrange(key, 0, -1);
    return events.map(event => JSON.parse(event));
  }

  private detectSuspiciousPatterns(events: AuditEvent[]): string[] {
    const patterns: string[] = [];

    // Check for rapid login attempts
    const loginAttempts = events.filter(
      e => e.eventType === AuditEventType.USER_LOGIN
    );
    if (loginAttempts.length > 5) {
      patterns.push('Multiple login attempts');
    }

    // Check for failed transactions
    const failedTransactions = events.filter(
      e => e.eventType === AuditEventType.TRANSACTION_FAIL
    );
    if (failedTransactions.length > 3) {
      patterns.push('Multiple failed transactions');
    }

    // Check for KYC rejections
    const kycRejections = events.filter(
      e => e.eventType === AuditEventType.KYC_REJECTION
    );
    if (kycRejections.length > 2) {
      patterns.push('Multiple KYC rejections');
    }

    return patterns;
  }

  public async getAuditTrail(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AuditEvent[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM audit_logs 
         WHERE user_id = $1 
         AND timestamp BETWEEN $2 AND $3
         ORDER BY timestamp DESC`,
        [userId, startDate, endDate]
      );

      return result.rows.map(row => ({
        ...row,
        details: JSON.parse(row.details)
      }));
    } catch (error) {
      logger.error('Failed to get audit trail', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  public async getSystemEvents(
    startDate: Date,
    endDate: Date
  ): Promise<AuditEvent[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM audit_logs 
         WHERE user_id IS NULL 
         AND timestamp BETWEEN $1 AND $2
         ORDER BY timestamp DESC`,
        [startDate, endDate]
      );

      return result.rows.map(row => ({
        ...row,
        details: JSON.parse(row.details)
      }));
    } catch (error) {
      logger.error('Failed to get system events', {
        error: error.message
      });
      throw error;
    }
  }
} 