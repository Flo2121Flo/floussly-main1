import { Pool } from 'pg';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { config } from '../config/appConfig';
import { NotificationService } from './NotificationService';
import { AuditService, AuditEventType } from './AuditService';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

// Session interface
export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  ipAddress: string;
  userAgent: string;
  lastActive: Date;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

// Session service class
export class SessionService {
  private static instance: SessionService;
  private pool: Pool;
  private notificationService: NotificationService;
  private auditService: AuditService;

  private constructor() {
    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: config.NODE_ENV === 'production'
    });
    this.notificationService = NotificationService.getInstance();
    this.auditService = AuditService.getInstance();
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  // Create new session
  public async createSession(
    userId: string,
    deviceId: string,
    deviceName: string,
    ipAddress: string,
    userAgent: string
  ): Promise<Session> {
    const sessionId = uuidv4();
    const timestamp = new Date();
    const expiresAt = new Date(timestamp.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    try {
      // Create session record
      const result = await this.pool.query(
        `INSERT INTO sessions (
          id, user_id, device_id, device_name, ip_address,
          user_agent, last_active, created_at, expires_at, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          sessionId,
          userId,
          deviceId,
          deviceName,
          ipAddress,
          userAgent,
          timestamp,
          timestamp,
          expiresAt,
          true
        ]
      );

      const session = result.rows[0];

      // Store session token in Redis
      const token = jwt.sign(
        { sessionId, userId },
        config.JWT_SECRET,
        { expiresIn: '30d' }
      );
      await redis.set(
        `session:${sessionId}`,
        token,
        'EX',
        30 * 24 * 60 * 60 // 30 days
      );

      // Log audit event
      await this.auditService.logEvent({
        eventType: AuditEventType.USER_LOGIN,
        userId,
        details: {
          sessionId,
          deviceId,
          deviceName,
          ipAddress
        },
        severity: 'low'
      });

      return session;
    } catch (error) {
      logger.error('Failed to create session', { error: error.message });
      throw error;
    }
  }

  // Get active sessions for user
  public async getUserSessions(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<Session[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM sessions 
         WHERE user_id = $1 AND is_active = true
         ORDER BY last_active DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      return result.rows;
    } catch (error) {
      logger.error('Failed to get user sessions', { error: error.message });
      throw error;
    }
  }

  // Terminate session
  public async terminateSession(
    sessionId: string,
    userId: string
  ): Promise<void> {
    try {
      // Update session status
      await this.pool.query(
        `UPDATE sessions 
         SET is_active = false, updated_at = $1
         WHERE id = $2 AND user_id = $3`,
        [new Date(), sessionId, userId]
      );

      // Remove session token from Redis
      await redis.del(`session:${sessionId}`);

      // Log audit event
      await this.auditService.logEvent({
        eventType: AuditEventType.USER_LOGOUT,
        userId,
        details: {
          sessionId,
          action: 'terminated'
        },
        severity: 'low'
      });
    } catch (error) {
      logger.error('Failed to terminate session', { error: error.message });
      throw error;
    }
  }

  // Terminate all sessions for user
  public async terminateAllSessions(userId: string): Promise<void> {
    try {
      // Get all active sessions
      const sessions = await this.getUserSessions(userId, 1000, 0);

      // Terminate each session
      for (const session of sessions) {
        await this.terminateSession(session.id, userId);
      }

      // Notify user
      await this.notificationService.sendNotification(userId, {
        type: 'sessions_terminated',
        title: 'All Sessions Terminated',
        message: 'All your active sessions have been terminated for security reasons.',
        data: { action: 'terminate_all' }
      });

      // Log audit event
      await this.auditService.logEvent({
        eventType: AuditEventType.USER_LOGOUT,
        userId,
        details: {
          action: 'terminate_all',
          sessionCount: sessions.length
        },
        severity: 'medium'
      });
    } catch (error) {
      logger.error('Failed to terminate all sessions', { error: error.message });
      throw error;
    }
  }

  // Update session activity
  public async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      await this.pool.query(
        `UPDATE sessions 
         SET last_active = $1
         WHERE id = $2 AND is_active = true`,
        [new Date(), sessionId]
      );
    } catch (error) {
      logger.error('Failed to update session activity', { error: error.message });
      throw error;
    }
  }

  // Validate session token
  public async validateSessionToken(token: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as { sessionId: string };
      const storedToken = await redis.get(`session:${decoded.sessionId}`);

      return storedToken === token;
    } catch (error) {
      return false;
    }
  }

  // Get session by ID
  public async getSessionById(sessionId: string): Promise<Session> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM sessions WHERE id = $1',
        [sessionId]
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Failed to get session by ID', { error: error.message });
      throw error;
    }
  }

  // Check for suspicious sessions
  public async checkSuspiciousSessions(userId: string): Promise<Session[]> {
    try {
      // Get all active sessions
      const sessions = await this.getUserSessions(userId, 1000, 0);
      const suspiciousSessions: Session[] = [];

      // Check for multiple sessions from same IP
      const ipCounts = new Map<string, number>();
      sessions.forEach(session => {
        ipCounts.set(session.ipAddress, (ipCounts.get(session.ipAddress) || 0) + 1);
      });

      // Check for sessions from known VPN/proxy IPs
      const vpnIps = await this.getKnownVPNIPs();
      
      sessions.forEach(session => {
        if (
          ipCounts.get(session.ipAddress) > 3 || // More than 3 sessions from same IP
          vpnIps.includes(session.ipAddress) || // Known VPN IP
          this.isSuspiciousUserAgent(session.userAgent) // Suspicious user agent
        ) {
          suspiciousSessions.push(session);
        }
      });

      return suspiciousSessions;
    } catch (error) {
      logger.error('Failed to check suspicious sessions', { error: error.message });
      throw error;
    }
  }

  // Get known VPN IPs (mock implementation)
  private async getKnownVPNIPs(): Promise<string[]> {
    // In production, this would query a VPN IP database or API
    return [];
  }

  // Check for suspicious user agents
  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /headless/i,
      /phantomjs/i,
      /selenium/i,
      /bot/i,
      /crawler/i,
      /spider/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }
} 