import { PrismaClient } from "@prisma/client";
import { Redis } from "ioredis";
import { config } from "../config";
import { logger } from "../utils/logger";
import { AppError } from "../utils/error";
import { SNS } from "aws-sdk";

const prisma = new PrismaClient();
const redis = new Redis(config.redis.url);
const sns = new SNS({ region: config.aws.region });

export class SecurityMonitorService {
  /**
   * Track security event
   */
  static async trackEvent(data: {
    type: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    userId?: string;
    ip?: string;
    deviceFingerprint?: string;
    details: Record<string, any>;
  }): Promise<void> {
    const { type, severity, userId, ip, deviceFingerprint, details } = data;

    try {
      // Create security event log
      const event = await prisma.securityEvent.create({
        data: {
          type,
          severity,
          userId,
          ip,
          deviceFingerprint,
          details,
        },
      });

      // Check for security event patterns
      await this.checkEventPatterns(event);

      // Alert if severity is high or critical
      if (severity === "HIGH" || severity === "CRITICAL") {
        await this.sendAlert(event);
      }

      // Update security metrics
      await this.updateMetrics(event);
    } catch (error) {
      logger.error("Failed to track security event:", {
        error,
        type,
        severity,
        userId,
      });
      throw new AppError("Failed to track security event", 500);
    }
  }

  /**
   * Check for security event patterns
   */
  private static async checkEventPatterns(event: any): Promise<void> {
    const key = `security:events:${event.type}:${event.userId || event.ip}`;
    const count = await redis.incr(key);
    await redis.expire(key, 3600); // 1 hour

    // Check for rapid succession of events
    if (count >= config.security.monitoring.eventThresholds[event.type]) {
      await this.handleThresholdExceeded(event, count);
    }

    // Check for suspicious patterns
    const patterns = await this.detectSuspiciousPatterns(event);
    if (patterns.length > 0) {
      await this.handleSuspiciousPatterns(event, patterns);
    }
  }

  /**
   * Send security alert
   */
  private static async sendAlert(event: any): Promise<void> {
    try {
      const message = {
        default: JSON.stringify({
          type: event.type,
          severity: event.severity,
          userId: event.userId,
          ip: event.ip,
          timestamp: event.createdAt,
          details: event.details,
        }),
      };

      await sns.publish({
        TopicArn: config.aws.sns.securityTopic,
        Message: JSON.stringify(message),
        MessageStructure: "json",
      }).promise();

      logger.info("Security alert sent:", {
        type: event.type,
        severity: event.severity,
        userId: event.userId,
      });
    } catch (error) {
      logger.error("Failed to send security alert:", {
        error,
        event,
      });
    }
  }

  /**
   * Update security metrics
   */
  private static async updateMetrics(event: any): Promise<void> {
    const metrics = {
      total: `security:metrics:total`,
      byType: `security:metrics:type:${event.type}`,
      bySeverity: `security:metrics:severity:${event.severity}`,
      byUser: event.userId ? `security:metrics:user:${event.userId}` : null,
      byIP: event.ip ? `security:metrics:ip:${event.ip}` : null,
    };

    const pipeline = redis.pipeline();
    pipeline.incr(metrics.total);
    pipeline.incr(metrics.byType);
    pipeline.incr(metrics.bySeverity);
    if (metrics.byUser) pipeline.incr(metrics.byUser);
    if (metrics.byIP) pipeline.incr(metrics.byIP);

    await pipeline.exec();
  }

  /**
   * Handle threshold exceeded
   */
  private static async handleThresholdExceeded(event: any, count: number): Promise<void> {
    // Create high severity event
    await this.trackEvent({
      type: "THRESHOLD_EXCEEDED",
      severity: "HIGH",
      userId: event.userId,
      ip: event.ip,
      deviceFingerprint: event.deviceFingerprint,
      details: {
        originalEvent: event.type,
        count,
        threshold: config.security.monitoring.eventThresholds[event.type],
      },
    });

    // Take action based on event type
    switch (event.type) {
      case "FAILED_LOGIN":
        await this.handleFailedLoginThreshold(event);
        break;
      case "SUSPICIOUS_TRANSACTION":
        await this.handleSuspiciousTransactionThreshold(event);
        break;
      case "API_ABUSE":
        await this.handleApiAbuseThreshold(event);
        break;
    }
  }

  /**
   * Detect suspicious patterns
   */
  private static async detectSuspiciousPatterns(event: any): Promise<string[]> {
    const patterns: string[] = [];

    // Check for rapid IP changes
    if (event.userId) {
      const ipChanges = await this.checkRapidIPChanges(event.userId, event.ip);
      if (ipChanges) {
        patterns.push("RAPID_IP_CHANGES");
      }
    }

    // Check for unusual time patterns
    const unusualTime = await this.checkUnusualTimePattern(event);
    if (unusualTime) {
      patterns.push("UNUSUAL_TIME_PATTERN");
    }

    // Check for geographic anomalies
    if (event.details.location) {
      const geoAnomaly = await this.checkGeographicAnomaly(event);
      if (geoAnomaly) {
        patterns.push("GEOGRAPHIC_ANOMALY");
      }
    }

    return patterns;
  }

  /**
   * Handle suspicious patterns
   */
  private static async handleSuspiciousPatterns(event: any, patterns: string[]): Promise<void> {
    // Create high severity event
    await this.trackEvent({
      type: "SUSPICIOUS_PATTERN_DETECTED",
      severity: "HIGH",
      userId: event.userId,
      ip: event.ip,
      deviceFingerprint: event.deviceFingerprint,
      details: {
        originalEvent: event.type,
        patterns,
      },
    });

    // Take action based on patterns
    if (patterns.includes("RAPID_IP_CHANGES")) {
      await this.handleRapidIPChanges(event);
    }
    if (patterns.includes("UNUSUAL_TIME_PATTERN")) {
      await this.handleUnusualTimePattern(event);
    }
    if (patterns.includes("GEOGRAPHIC_ANOMALY")) {
      await this.handleGeographicAnomaly(event);
    }
  }

  /**
   * Check for rapid IP changes
   */
  private static async checkRapidIPChanges(userId: string, currentIP: string): Promise<boolean> {
    const key = `user:${userId}:ips`;
    const recentIPs = await redis.lrange(key, 0, -1);

    if (!recentIPs.includes(currentIP)) {
      await redis.lpush(key, currentIP);
      await redis.ltrim(key, 0, 9); // Keep last 10 IPs
      await redis.expire(key, 3600); // 1 hour
    }

    return recentIPs.length >= 3 && !recentIPs.includes(currentIP);
  }

  /**
   * Check for unusual time patterns
   */
  private static async checkUnusualTimePattern(event: any): Promise<boolean> {
    const hour = new Date(event.createdAt).getHours();
    return hour < 6 || hour > 22; // Unusual if between 10 PM and 6 AM
  }

  /**
   * Check for geographic anomalies
   */
  private static async checkGeographicAnomaly(event: any): Promise<boolean> {
    if (!event.details.location) return false;

    const key = `user:${event.userId}:locations`;
    const recentLocations = await redis.lrange(key, 0, -1);

    if (recentLocations.length === 0) {
      await redis.lpush(key, JSON.stringify(event.details.location));
      await redis.expire(key, 3600); // 1 hour
      return false;
    }

    // Check if location is far from recent locations
    return recentLocations.every((loc) => {
      const knownLoc = JSON.parse(loc);
      const distance = this.calculateDistance(event.details.location, knownLoc);
      return distance > 100; // 100km threshold
    });
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private static calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLon = this.toRad(point2.lng - point1.lng);
    const lat1 = this.toRad(point1.lat);
    const lat2 = this.toRad(point2.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Handle failed login threshold
   */
  private static async handleFailedLoginThreshold(event: any): Promise<void> {
    if (event.userId) {
      await prisma.user.update({
        where: { id: event.userId },
        data: { isActive: false },
      });
    }

    // Block IP
    const key = `blocked:ip:${event.ip}`;
    await redis.set(key, "1", "EX", config.security.fraud.lockoutDuration);
  }

  /**
   * Handle suspicious transaction threshold
   */
  private static async handleSuspiciousTransactionThreshold(event: any): Promise<void> {
    if (event.userId) {
      await prisma.user.update({
        where: { id: event.userId },
        data: { isActive: false },
      });
    }

    // Freeze transactions for user
    const key = `frozen:transactions:${event.userId}`;
    await redis.set(key, "1", "EX", 3600); // 1 hour
  }

  /**
   * Handle API abuse threshold
   */
  private static async handleApiAbuseThreshold(event: any): Promise<void> {
    // Block IP
    const key = `blocked:ip:${event.ip}`;
    await redis.set(key, "1", "EX", config.security.fraud.lockoutDuration);

    // Block API key if present
    if (event.details.apiKey) {
      const apiKeyKey = `blocked:apikey:${event.details.apiKey}`;
      await redis.set(apiKeyKey, "1", "EX", config.security.fraud.lockoutDuration);
    }
  }

  /**
   * Handle rapid IP changes
   */
  private static async handleRapidIPChanges(event: any): Promise<void> {
    if (event.userId) {
      await prisma.user.update({
        where: { id: event.userId },
        data: { isActive: false },
      });
    }

    // Block all involved IPs
    const key = `user:${event.userId}:ips`;
    const ips = await redis.lrange(key, 0, -1);
    const pipeline = redis.pipeline();

    ips.forEach((ip) => {
      pipeline.set(`blocked:ip:${ip}`, "1", "EX", config.security.fraud.lockoutDuration);
    });

    await pipeline.exec();
  }

  /**
   * Handle unusual time pattern
   */
  private static async handleUnusualTimePattern(event: any): Promise<void> {
    // Require additional verification
    const key = `verification:required:${event.userId}`;
    await redis.set(key, "1", "EX", 3600); // 1 hour
  }

  /**
   * Handle geographic anomaly
   */
  private static async handleGeographicAnomaly(event: any): Promise<void> {
    // Require additional verification
    const key = `verification:required:${event.userId}`;
    await redis.set(key, "1", "EX", 3600); // 1 hour

    // Log location for review
    await prisma.securityEvent.create({
      data: {
        type: "GEOGRAPHIC_ANOMALY",
        severity: "MEDIUM",
        userId: event.userId,
        ip: event.ip,
        details: {
          location: event.details.location,
          originalEvent: event.type,
        },
      },
    });
  }
} 