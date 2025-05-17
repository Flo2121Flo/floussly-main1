import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { redis } from '../config/redis';
import { config } from '../config/appConfig';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client for immutable audit logs
const s3 = new S3({
  region: config.AWS_REGION,
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY
});

// Audit event types
export enum AuditEventType {
  // User events
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTER = 'USER_REGISTER',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',

  // KYC events
  KYC_SUBMIT = 'KYC_SUBMIT',
  KYC_APPROVE = 'KYC_APPROVE',
  KYC_REJECT = 'KYC_REJECT',
  KYC_UPDATE = 'KYC_UPDATE',

  // Transaction events
  TRANSACTION_CREATE = 'TRANSACTION_CREATE',
  TRANSACTION_APPROVE = 'TRANSACTION_APPROVE',
  TRANSACTION_REJECT = 'TRANSACTION_REJECT',
  TRANSACTION_CANCEL = 'TRANSACTION_CANCEL',

  // AML events
  AML_CHECK = 'AML_CHECK',
  AML_FLAG = 'AML_FLAG',
  AML_CLEAR = 'AML_CLEAR',

  // Security events
  SECURITY_BREACH = 'SECURITY_BREACH',
  SECURITY_ALERT = 'SECURITY_ALERT',
  SECURITY_BLOCK = 'SECURITY_BLOCK',

  // System events
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  SYSTEM_WARNING = 'SYSTEM_WARNING',
  SYSTEM_INFO = 'SYSTEM_INFO'
}

// Audit event interface
export interface AuditEvent {
  eventId: string;
  eventType: AuditEventType;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Audit service class
export class AuditService {
  private static instance: AuditService;
  private pool: Pool;
  private readonly CACHE_TTL = 3600; // 1 hour

  private constructor() {
    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: config.NODE_ENV === 'production'
    });
  }

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  // Log event to database and S3
  public async logEvent(event: Omit<AuditEvent, 'eventId' | 'timestamp'>): Promise<void> {
    const eventId = uuidv4();
    const timestamp = new Date();
    const fullEvent: AuditEvent = {
      ...event,
      eventId,
      timestamp
    };

    try {
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
      await this.cacheEvent(fullEvent);

      // Store in S3 for immutable audit trail
      await this.storeInS3(fullEvent);

      // Log to monitoring service if severity is high or critical
      if (['high', 'critical'].includes(event.severity)) {
        await this.logToMonitoring(fullEvent);
      }

      // Check for suspicious patterns
      await this.checkSuspiciousPatterns(fullEvent);

    } catch (error) {
      logger.error('Failed to log audit event', {
        error: error.message,
        eventId,
        eventType: event.eventType
      });
      throw error;
    }
  }

  // Cache recent events in Redis
  private async cacheEvent(event: AuditEvent): Promise<void> {
    const key = `audit:recent:${event.userId || 'system'}`;
    try {
      await redis.lpush(key, JSON.stringify(event));
      await redis.ltrim(key, 0, 99); // Keep last 100 events
      await redis.expire(key, this.CACHE_TTL);
    } catch (error) {
      logger.error('Failed to cache audit event', {
        error: error.message,
        eventId: event.eventId
      });
    }
  }

  // Store event in S3 for immutable audit trail
  private async storeInS3(event: AuditEvent): Promise<void> {
    const key = `audit-logs/${event.timestamp.getFullYear()}/${event.timestamp.getMonth() + 1}/${event.eventId}.json`;
    
    try {
      await s3.putObject({
        Bucket: config.AUDIT_BUCKET,
        Key: key,
        Body: JSON.stringify(event),
        ContentType: 'application/json',
        ServerSideEncryption: 'AES256',
        Metadata: {
          'event-type': event.eventType,
          'severity': event.severity,
          'user-id': event.userId || 'system'
        }
      }).promise();
    } catch (error) {
      logger.error('Failed to store audit event in S3', {
        error: error.message,
        eventId: event.eventId
      });
    }
  }

  // Log to monitoring service
  private async logToMonitoring(event: AuditEvent): Promise<void> {
    try {
      // Implement your monitoring service integration here
      // Example: CloudWatch, Datadog, etc.
      logger.warn('High severity audit event', {
        eventId: event.eventId,
        eventType: event.eventType,
        severity: event.severity,
        details: event.details
      });
    } catch (error) {
      logger.error('Failed to log to monitoring service', {
        error: error.message,
        eventId: event.eventId
      });
    }
  }

  // Check for suspicious patterns in recent events
  private async checkSuspiciousPatterns(event: AuditEvent): Promise<void> {
    if (!event.userId) return;

    try {
      const recentEvents = await this.getRecentEvents(event.userId);
      
      // Check for multiple failed login attempts
      const failedLogins = recentEvents.filter(e => 
        e.eventType === AuditEventType.USER_LOGIN && 
        e.details.status === 'failed'
      );

      if (failedLogins.length >= 5) {
        await this.logEvent({
          eventType: AuditEventType.SECURITY_ALERT,
          userId: event.userId,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          details: {
            type: 'multiple_failed_logins',
            count: failedLogins.length
          },
          severity: 'high'
        });
      }

      // Check for rapid transactions
      const recentTransactions = recentEvents.filter(e => 
        e.eventType === AuditEventType.TRANSACTION_CREATE &&
        e.timestamp > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
      );

      if (recentTransactions.length >= 10) {
        await this.logEvent({
          eventType: AuditEventType.SECURITY_ALERT,
          userId: event.userId,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          details: {
            type: 'rapid_transactions',
            count: recentTransactions.length
          },
          severity: 'high'
        });
      }

    } catch (error) {
      logger.error('Failed to check suspicious patterns', {
        error: error.message,
        userId: event.userId
      });
    }
  }

  // Get recent events for a user
  public async getRecentEvents(userId: string): Promise<AuditEvent[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM audit_logs 
         WHERE user_id = $1 
         ORDER BY timestamp DESC 
         LIMIT 100`,
        [userId]
      );

      return result.rows.map(row => ({
        ...row,
        details: JSON.parse(row.details)
      }));
    } catch (error) {
      logger.error('Failed to get recent events', {
        error: error.message,
        userId
      });
      return [];
    }
  }

  // Get system events
  public async getSystemEvents(
    startDate: Date,
    endDate: Date,
    severity?: string
  ): Promise<AuditEvent[]> {
    try {
      const query = `
        SELECT * FROM audit_logs 
        WHERE user_id IS NULL 
        AND timestamp BETWEEN $1 AND $2
        ${severity ? 'AND severity = $3' : ''}
        ORDER BY timestamp DESC
      `;

      const params = [startDate, endDate];
      if (severity) params.push(severity);

      const result = await this.pool.query(query, params);

      return result.rows.map(row => ({
        ...row,
        details: JSON.parse(row.details)
      }));
    } catch (error) {
      logger.error('Failed to get system events', {
        error: error.message,
        startDate,
        endDate,
        severity
      });
      return [];
    }
  }
} 