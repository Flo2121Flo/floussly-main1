import { PrismaClient } from "@prisma/client";
import { Redis } from "ioredis";
import { config } from "../config";
import { logger } from "../utils/logger";
import { AppError } from "../utils/error";
import { KMS } from "aws-sdk";
import { createHash } from "crypto";

const prisma = new PrismaClient();
const redis = new Redis(config.redis.url);
const kms = new KMS({ region: config.aws.region });

export class FraudDetectionService {
  /**
   * Check for suspicious transaction patterns
   */
  static async checkTransactionPatterns(data: {
    userId: string;
    amount: number;
    type: string;
    ip: string;
    deviceFingerprint: string;
    location?: { lat: number; lng: number };
  }): Promise<{ isSuspicious: boolean; reason?: string }> {
    const { userId, amount, type, ip, deviceFingerprint, location } = data;

    try {
      // Check transaction amount against user's history
      const isUnusualAmount = await this.checkUnusualAmount(userId, amount);
      if (isUnusualAmount) {
        return {
          isSuspicious: true,
          reason: "Unusual transaction amount",
        };
      }

      // Check transaction frequency
      const isHighFrequency = await this.checkHighFrequency(userId);
      if (isHighFrequency) {
        return {
          isSuspicious: true,
          reason: "High transaction frequency",
        };
      }

      // Check for multiple failed attempts
      const hasFailedAttempts = await this.checkFailedAttempts(userId);
      if (hasFailedAttempts) {
        return {
          isSuspicious: true,
          reason: "Multiple failed attempts",
        };
      }

      // Check device fingerprint
      const isNewDevice = await this.checkNewDevice(userId, deviceFingerprint);
      if (isNewDevice) {
        return {
          isSuspicious: true,
          reason: "New device detected",
        };
      }

      // Check location
      if (location) {
        const isUnusualLocation = await this.checkUnusualLocation(userId, location);
        if (isUnusualLocation) {
          return {
            isSuspicious: true,
            reason: "Unusual location detected",
          };
        }
      }

      // Check IP address
      const isSuspiciousIP = await this.checkSuspiciousIP(ip);
      if (isSuspiciousIP) {
        return {
          isSuspicious: true,
          reason: "Suspicious IP address",
        };
      }

      // Check for velocity (multiple transactions in short time)
      const isHighVelocity = await this.checkHighVelocity(userId);
      if (isHighVelocity) {
        return {
          isSuspicious: true,
          reason: "High transaction velocity",
        };
      }

      return { isSuspicious: false };
    } catch (error) {
      logger.error("Fraud detection error:", {
        error,
        userId,
        amount,
        type,
      });
      throw new AppError("Fraud detection failed", 500);
    }
  }

  /**
   * Check for unusual transaction amounts
   */
  private static async checkUnusualAmount(userId: string, amount: number): Promise<boolean> {
    const key = `user:${userId}:transactions:amounts`;
    const recentAmounts = await redis.lrange(key, 0, -1);
    
    if (recentAmounts.length === 0) {
      await redis.lpush(key, amount.toString());
      await redis.expire(key, 86400); // 24 hours
      return false;
    }

    const avgAmount = recentAmounts.reduce((sum, val) => sum + Number(val), 0) / recentAmounts.length;
    const threshold = avgAmount * 3; // 3x average amount

    await redis.lpush(key, amount.toString());
    await redis.ltrim(key, 0, 99); // Keep last 100 transactions

    return amount > threshold;
  }

  /**
   * Check for high transaction frequency
   */
  private static async checkHighFrequency(userId: string): Promise<boolean> {
    const key = `user:${userId}:transactions:frequency`;
    const count = await redis.incr(key);
    await redis.expire(key, 3600); // 1 hour

    return count > config.security.fraud.maxTransactionsPerHour;
  }

  /**
   * Check for failed attempts
   */
  private static async checkFailedAttempts(userId: string): Promise<boolean> {
    const key = `user:${userId}:failed:attempts`;
    const count = await redis.incr(key);
    await redis.expire(key, config.security.fraud.lockoutDuration);

    if (count >= config.security.fraud.maxFailedLogins) {
      await this.lockAccount(userId);
      return true;
    }

    return false;
  }

  /**
   * Check for new device
   */
  private static async checkNewDevice(userId: string, deviceFingerprint: string): Promise<boolean> {
    const key = `user:${userId}:devices`;
    const knownDevices = await redis.smembers(key);

    if (!knownDevices.includes(deviceFingerprint)) {
      await redis.sadd(key, deviceFingerprint);
      return true;
    }

    return false;
  }

  /**
   * Check for unusual location
   */
  private static async checkUnusualLocation(
    userId: string,
    location: { lat: number; lng: number }
  ): Promise<boolean> {
    const key = `user:${userId}:locations`;
    const knownLocations = await redis.lrange(key, 0, -1);

    if (knownLocations.length === 0) {
      await redis.lpush(key, JSON.stringify(location));
      await redis.expire(key, 30 * 86400); // 30 days
      return false;
    }

    // Calculate distance from known locations
    const isUnusual = knownLocations.every((loc) => {
      const knownLoc = JSON.parse(loc);
      const distance = this.calculateDistance(location, knownLoc);
      return distance > 100; // 100km threshold
    });

    if (!isUnusual) {
      await redis.lpush(key, JSON.stringify(location));
      await redis.ltrim(key, 0, 99); // Keep last 100 locations
    }

    return isUnusual;
  }

  /**
   * Check for suspicious IP
   */
  private static async checkSuspiciousIP(ip: string): Promise<boolean> {
    const key = `ip:${ip}:reputation`;
    const reputation = await redis.get(key);

    if (reputation === null) {
      // Check IP against known bad IPs
      const isBadIP = await this.checkBadIPList(ip);
      await redis.set(key, isBadIP ? "0" : "1", "EX", 86400); // 24 hours
      return isBadIP;
    }

    return reputation === "0";
  }

  /**
   * Check for high velocity transactions
   */
  private static async checkHighVelocity(userId: string): Promise<boolean> {
    const key = `user:${userId}:velocity`;
    const now = Date.now();
    const window = 5 * 60 * 1000; // 5 minutes

    const transactions = await redis.zrangebyscore(key, now - window, now);
    await redis.zremrangebyscore(key, 0, now - window);
    await redis.zadd(key, now, now.toString());
    await redis.expire(key, 3600); // 1 hour

    return transactions.length >= 5; // More than 5 transactions in 5 minutes
  }

  /**
   * Lock user account
   */
  private static async lockAccount(userId: string): Promise<void> {
    const key = `user:${userId}:locked`;
    await redis.set(key, "1", "EX", config.security.fraud.lockoutDuration);

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    logger.warn("Account locked due to suspicious activity", {
      userId,
      reason: "Multiple failed attempts",
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
   * Check IP against known bad IPs
   */
  private static async checkBadIPList(ip: string): Promise<boolean> {
    // TODO: Implement IP reputation check using a service like AbuseIPDB
    return false;
  }
} 