import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { redis } from '../config/redis';
import { config } from '../config/appConfig';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { pg } from '../db/pg';

// Initialize S3 client for immutable audit logs
const s3 = new S3({
  region: config.AWS_REGION,
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY
});

// Audit event types
export enum AuditEventType {
  // User events
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTER = 'user_register',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  
  // Transaction events
  TRANSACTION = 'transaction',
  TRANSACTION_REVIEW = 'transaction_review',
  TRANSACTION_APPROVE = 'transaction_approve',
  TRANSACTION_REJECT = 'transaction_reject',
  
  // Profile events
  PROFILE_UPDATE = 'profile_update',
  KYC_SUBMIT = 'kyc_submit',
  KYC_APPROVE = 'kyc_approve',
  KYC_REJECT = 'kyc_reject',
  
  // Onboarding events
  ONBOARDING_START = 'onboarding_start',
  ONBOARDING_COMPLETE = 'onboarding_complete',
  ONBOARDING_ITEM_UPDATED = 'onboarding_item_updated',
  
  // Security events
  SECURITY_ALERT = 'security_alert',
  SECURITY_BREACH = 'security_breach',
  FRAUD_DETECTED = 'fraud_detected',
  RISK_PROFILE_UPDATE = 'risk_profile_update',
  
  // System events
  SYSTEM_DIAGNOSTICS = 'system_diagnostics',
  BACKUP_CREATED = 'backup_created',
  BACKUP_RESTORED = 'backup_restored',
  FAILOVER_INITIATED = 'failover_initiated'
}

// Audit event interface
export interface AuditEvent {
  eventId: string;
  timestamp: Date;
  eventType: AuditEventType;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status?: 'SUCCESS' | 'FAILURE';
  error?: string;
}

// Audit service class
export class AuditService {
  private static instance: AuditService;
  private pool: Pool;
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly s3: S3;

  private constructor() {
    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: config.NODE_ENV === 'production'
    });
    this.s3 = new S3({
      region: config.S3_REGION,
      accessKeyId: config.S3_ACCESS_KEY_ID,
      secretAccessKey: config.S3_SECRET_ACCESS_KEY
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
    const auditEvent: AuditEvent = {
      ...event,
      eventId: uuidv4(),
      timestamp: new Date()
    };

    try {
      // Store in database
      await this.pool.query(
        `INSERT INTO audit_logs (
          event_id, timestamp, event_type, user_id, ip_address, user_agent, details, severity, status, error
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          auditEvent.eventId,
          auditEvent.timestamp,
          auditEvent.eventType,
          auditEvent.userId,
          auditEvent.ipAddress,
          auditEvent.userAgent,
          auditEvent.details,
          auditEvent.severity,
          auditEvent.status || 'SUCCESS',
          auditEvent.error
        ]
      );

      // Cache recent events
      const key = `audit:recent:${auditEvent.userId || 'system'}`;
      await redis.lpush(key, JSON.stringify(auditEvent));
      await redis.ltrim(key, 0, 99); // Keep last 100 events
      await redis.expire(key, this.CACHE_TTL);

      // Archive to S3 if critical
      if (auditEvent.severity === 'critical') {
        await this.archiveToS3(auditEvent);
      }

      logger.info('Audit event logged', {
        eventId: auditEvent.eventId,
        eventType: auditEvent.eventType,
        userId: auditEvent.userId
      });
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to log audit event', {
        error: err.message,
        event: auditEvent
      });
      throw err;
    }
  }

  private async archiveToS3(event: AuditEvent): Promise<void> {
    try {
      const key = `audit-logs/${event.timestamp.toISOString()}/${event.eventId}.json`;
      await this.s3.putObject({
        Bucket: config.S3_BUCKET,
        Key: key,
        Body: JSON.stringify(event),
        ContentType: 'application/json'
      }).promise();

      logger.info('Audit event archived to S3', {
        eventId: event.eventId,
        s3Key: key
      });
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to archive audit event to S3', {
        error: err.message,
        eventId: event.eventId
      });
      throw err;
    }
  }

  // Get recent events for a user
  public async getRecentEvents(userId?: string, limit = 100): Promise<AuditEvent[]> {
    try {
      const key = `audit:recent:${userId || 'system'}`;
      const events = await redis.lrange(key, 0, limit - 1);
      return events.map(event => JSON.parse(event));
    } catch (error: any) {
      logger.error('Failed to get recent audit events', {
        error: error.message,
        userId
      });
      throw error;
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

  static async log(params: {
    userId: string;
    action: AuditEventType;
    details: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    status: 'SUCCESS' | 'FAILURE';
    error?: string;
  }): Promise<AuditEvent> {
    const { userId, action, details, ipAddress, userAgent, status, error } = params;

    try {
      const result = await pg.query(
        `INSERT INTO audit_logs (
          user_id, action, details, ip_address, user_agent, status, error
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [userId, action, details, ipAddress, userAgent, status, error]
      );

      const log = result.rows[0];
      await this.cacheEvent(log);

      // Log to console for development
      if (process.env.NODE_ENV === 'development') {
        logger.info('Audit Log:', {
          action,
          userId,
          status,
          details
        });
      }

      return log;
    } catch (error) {
      logger.error('Failed to create audit log:', error);
      throw error;
    }
  }

  static async getLogs(params: {
    userId?: string;
    action?: AuditEventType;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditEvent[]; total: number }> {
    const { userId, action, startDate, endDate, limit = 50, offset = 0 } = params;

    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const values: any[] = [];
    let valueIndex = 1;

    if (userId) {
      query += ` AND user_id = $${valueIndex}`;
      values.push(userId);
      valueIndex++;
    }

    if (action) {
      query += ` AND event_type = $${valueIndex}`;
      values.push(action);
      valueIndex++;
    }

    if (startDate) {
      query += ` AND timestamp >= $${valueIndex}`;
      values.push(startDate);
      valueIndex++;
    }

    if (endDate) {
      query += ` AND timestamp <= $${valueIndex}`;
      values.push(endDate);
      valueIndex++;
    }

    const countResult = await pg.query(
      `SELECT COUNT(*) FROM (${query}) as count`,
      values
    );

    query += ` ORDER BY timestamp DESC LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`;
    values.push(limit, offset);

    const result = await pg.query(query, values);

    return {
      logs: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  static async getSecurityAlerts(params: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditEvent[]> {
    const { startDate, endDate, limit = 100 } = params;

    let query = `
      SELECT * FROM audit_logs 
      WHERE event_type = $1
      AND event_type IN ('SECURITY_ALERT', 'SECURITY_BREACH')
    `;
    const values: any[] = [AuditEventType.SECURITY_ALERT];

    if (startDate) {
      query += ` AND timestamp >= $2`;
      values.push(startDate);
    }

    if (endDate) {
      query += ` AND timestamp <= $${values.length + 1}`;
      values.push(endDate);
    }

    query += ` ORDER BY timestamp DESC LIMIT $${values.length + 1}`;
    values.push(limit);

    const result = await pg.query(query, values);
    return result.rows;
  }

  private static async cacheEvent(event: AuditEvent): Promise<void> {
    const key = `audit:recent:${event.userId || 'system'}`;
    await redis.lpush(key, JSON.stringify(event));
    await redis.ltrim(key, 0, 99); // Keep last 100 events
    await redis.expire(key, this.CACHE_TTL);
  }

  static async getLogById(id: string): Promise<AuditEvent | null> {
    const cached = await redis.get(`audit:recent:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await pg.query(
      'SELECT * FROM audit_logs WHERE event_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const log = result.rows[0];
    await this.cacheEvent(log);
    return log;
  }

  static async cleanupOldLogs(daysToKeep: number = 90): Promise<void> {
    try {
      await pg.query(
        `DELETE FROM audit_logs 
         WHERE timestamp < NOW() - INTERVAL '${daysToKeep} days'`
      );
      logger.info(`Cleaned up audit logs older than ${daysToKeep} days`);
    } catch (error) {
      logger.error('Failed to cleanup old audit logs:', error);
    }
  }

  public async getEventById(eventId: string): Promise<AuditEvent | null> {
    try {
      const { rows } = await pg.query(
        'SELECT * FROM audit_logs WHERE event_id = $1',
        [eventId]
      );
      return rows[0] || null;
    } catch (error: any) {
      logger.error('Failed to get audit event by ID', {
        error: error.message,
        eventId
      });
      throw error;
    }
  }

  public async searchEvents(params: {
    eventType?: AuditEventType;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<AuditEvent[]> {
    try {
      let query = 'SELECT * FROM audit_logs WHERE 1=1';
      const queryParams: any[] = [];

      if (params.eventType) {
        queryParams.push(params.eventType);
        query += ` AND event_type = $${queryParams.length}`;
      }

      if (params.userId) {
        queryParams.push(params.userId);
        query += ` AND user_id = $${queryParams.length}`;
      }

      if (params.startDate) {
        queryParams.push(params.startDate);
        query += ` AND timestamp >= $${queryParams.length}`;
      }

      if (params.endDate) {
        queryParams.push(params.endDate);
        query += ` AND timestamp <= $${queryParams.length}`;
      }

      if (params.severity) {
        queryParams.push(params.severity);
        query += ` AND severity = $${queryParams.length}`;
      }

      query += ' ORDER BY timestamp DESC';

      const { rows } = await pg.query(query, queryParams);
      return rows;
    } catch (error: any) {
      logger.error('Failed to search audit events', {
        error: error.message,
        params
      });
      throw error;
    }
  }

  public async getAuditStats(): Promise<{
    totalEvents: number;
    eventsByType: Record<AuditEventType, number>;
    eventsBySeverity: Record<string, number>;
    recentCriticalEvents: number;
  }> {
    try {
      const { rows: typeStats } = await pg.query(`
        SELECT event_type, COUNT(*) as count
        FROM audit_logs
        GROUP BY event_type
      `);

      const { rows: severityStats } = await pg.query(`
        SELECT severity, COUNT(*) as count
        FROM audit_logs
        GROUP BY severity
      `);

      const { rows: [{ count: totalEvents }] } = await pg.query(`
        SELECT COUNT(*) as count
        FROM audit_logs
      `);

      const { rows: [{ count: criticalEvents }] } = await pg.query(`
        SELECT COUNT(*) as count
        FROM audit_logs
        WHERE severity = 'critical'
        AND timestamp >= NOW() - INTERVAL '24 hours'
      `);

      return {
        totalEvents: parseInt(totalEvents),
        eventsByType: typeStats.reduce((acc: any, row) => {
          acc[row.event_type] = parseInt(row.count);
          return acc;
        }, {}),
        eventsBySeverity: severityStats.reduce((acc: any, row) => {
          acc[row.severity] = parseInt(row.count);
          return acc;
        }, {}),
        recentCriticalEvents: parseInt(criticalEvents)
      };
    } catch (error: any) {
      logger.error('Failed to get audit statistics', {
        error: error.message
      });
      throw error;
    }
  }
} 