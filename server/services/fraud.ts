import { PrismaClient } from "@prisma/client";
import { Redis } from "ioredis";
import { config } from "../config";
import { logger } from "../utils/logger";
import { AppError } from "../utils/error";
import { KMS } from "aws-sdk";
import { createHash } from "crypto";
import { OpenAI } from 'openai';

const prisma = new PrismaClient();
const redis = new Redis(config.redis.url);
const kms = new KMS({ region: config.aws.region });
const openai = new OpenAI({ apiKey: config.openai.apiKey });

export class FraudDetectionService {
  private static readonly RISK_THRESHOLD = 0.7; // 70% risk threshold
  private static readonly PATTERN_WINDOW = 24 * 60 * 60; // 24 hours
  private static readonly MAX_TRANSACTIONS_PER_HOUR = 10;
  private static readonly AMOUNT_THRESHOLD = 10000; // 10,000 MAD

  /**
   * Check for suspicious transaction patterns with ML-based risk scoring
   */
  static async checkTransactionPatterns(data: {
    userId: string;
    amount: number;
    type: string;
    ip: string;
    deviceFingerprint: string;
    location?: { lat: number; lng: number };
  }): Promise<{ isSuspicious: boolean; reason?: string; riskScore?: number }> {
    const { userId, amount, type, ip, deviceFingerprint, location } = data;

    try {
      // Get user's transaction history
      const userPatterns = await this.getUserPatterns(userId);
      
      // Calculate risk factors
      const riskFactors = await this.calculateRiskFactors({
        userId,
        amount,
        type,
        ip,
        deviceFingerprint,
        location,
        userPatterns,
      });

      // Calculate risk score using ML model
      const riskScore = await this.calculateRiskScore(riskFactors);

      // Check if transaction is suspicious
      const isSuspicious = riskScore > this.RISK_THRESHOLD;
      const reason = isSuspicious ? this.getSuspiciousReason(riskFactors) : undefined;

      // Log risk assessment
      logger.info("Transaction risk assessment", {
        userId,
        amount,
        type,
        riskScore,
        isSuspicious,
        reason,
        riskFactors,
      });

      return { isSuspicious, reason, riskScore };
    } catch (error) {
      logger.error("Fraud detection failed:", error);
      // Fail open - allow transaction but log the error
      return { isSuspicious: false };
    }
  }

  /**
   * Get user's transaction patterns
   */
  private static async getUserPatterns(userId: string): Promise<any[]> {
    const patternKey = `user:${userId}:patterns`;
    const patterns = await redis.get(patternKey);
    return patterns ? JSON.parse(patterns) : [];
  }

  /**
   * Calculate risk factors for a transaction
   */
  private static async calculateRiskFactors(data: {
    userId: string;
    amount: number;
    type: string;
    ip: string;
    deviceFingerprint: string;
    location?: { lat: number; lng: number };
    userPatterns: any[];
  }): Promise<Record<string, number>> {
    const { userId, amount, type, ip, deviceFingerprint, location, userPatterns } = data;

    const riskFactors: Record<string, number> = {};

    // Amount risk
    riskFactors.amountRisk = await this.calculateAmountRisk(amount, userPatterns);

    // Frequency risk
    riskFactors.frequencyRisk = await this.calculateFrequencyRisk(userId);

    // Device risk
    riskFactors.deviceRisk = await this.calculateDeviceRisk(userId, deviceFingerprint);

    // Location risk
    if (location) {
      riskFactors.locationRisk = await this.calculateLocationRisk(userId, location);
    }

    // IP risk
    riskFactors.ipRisk = await this.calculateIPRisk(ip);

    // Pattern risk
    riskFactors.patternRisk = await this.calculatePatternRisk(userPatterns, {
      amount,
      type,
      timestamp: new Date(),
    });

    // Time risk
    riskFactors.timeRisk = await this.calculateTimeRisk(userPatterns);

    return riskFactors;
  }

  /**
   * Calculate risk score using ML model
   */
  private static async calculateRiskScore(riskFactors: Record<string, number>): Promise<number> {
    try {
      // Prepare input for ML model
      const input = {
        riskFactors,
        timestamp: new Date().toISOString(),
      };

      // Get risk score from ML model
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a fraud detection expert. Analyze the risk factors and return a risk score between 0 and 1. Consider the following factors: amount risk, frequency risk, device risk, location risk, IP risk, pattern risk, and time risk."
          },
          {
            role: "user",
            content: JSON.stringify(input)
          }
        ],
        temperature: 0.3,
        max_tokens: 10
      });

      const score = parseFloat(completion.choices[0].message.content?.trim() || "0");
      return Math.min(Math.max(score, 0), 1); // Ensure score is between 0 and 1
    } catch (error) {
      logger.error("Risk score calculation failed:", error);
      // Fallback to simple average
      return Object.values(riskFactors).reduce((a, b) => a + b, 0) / Object.keys(riskFactors).length;
    }
  }

  /**
   * Calculate amount-based risk
   */
  private static async calculateAmountRisk(amount: number, userPatterns: any[]): Promise<number> {
    if (amount > this.AMOUNT_THRESHOLD) {
      return 0.8;
    }

    const avgAmount = userPatterns.reduce((sum, p) => sum + p.amount, 0) / userPatterns.length;
    const stdDev = Math.sqrt(
      userPatterns.reduce((sum, p) => sum + Math.pow(p.amount - avgAmount, 2), 0) / userPatterns.length
    );

    const zScore = (amount - avgAmount) / stdDev;
    return Math.min(Math.max(zScore / 3, 0), 1); // Normalize to 0-1
  }

  /**
   * Calculate frequency-based risk
   */
  private static async calculateFrequencyRisk(userId: string): Promise<number> {
    const key = `user:${userId}:transactions:frequency`;
    const count = await redis.incr(key);
    await redis.expire(key, 3600); // 1 hour

    return Math.min(count / this.MAX_TRANSACTIONS_PER_HOUR, 1);
  }

  /**
   * Calculate device-based risk
   */
  private static async calculateDeviceRisk(userId: string, deviceFingerprint: string): Promise<number> {
    const key = `user:${userId}:devices`;
    const devices = await redis.smembers(key);

    if (!devices.includes(deviceFingerprint)) {
      await redis.sadd(key, deviceFingerprint);
      return 0.7; // New device
    }

    return 0.1; // Known device
  }

  /**
   * Calculate location-based risk
   */
  private static async calculateLocationRisk(userId: string, location: { lat: number; lng: number }): Promise<number> {
    const key = `user:${userId}:locations`;
    const locations = await redis.get(key);
    const userLocations = locations ? JSON.parse(locations) : [];

    if (userLocations.length === 0) {
      userLocations.push(location);
      await redis.set(key, JSON.stringify(userLocations), 'EX', this.PATTERN_WINDOW);
      return 0.3; // First location
    }

    // Calculate distance from known locations
    const distances = userLocations.map(loc => this.calculateDistance(location, loc));
    const minDistance = Math.min(...distances);

    if (minDistance > 100) { // More than 100km from known locations
      return 0.8;
    }

    return Math.min(minDistance / 100, 1);
  }

  /**
   * Calculate IP-based risk
   */
  private static async calculateIPRisk(ip: string): Promise<number> {
    const key = `ip:${ip}:risk`;
    const cachedRisk = await redis.get(key);
    
    if (cachedRisk) {
      return parseFloat(cachedRisk);
    }

    // Check if IP is in known VPN/proxy ranges
    const isVPN = await this.checkVPN(ip);
    const risk = isVPN ? 0.7 : 0.1;

    await redis.set(key, risk.toString(), 'EX', 3600);
    return risk;
  }

  /**
   * Calculate pattern-based risk
   */
  private static async calculatePatternRisk(userPatterns: any[], currentTransaction: any): Promise<number> {
    if (userPatterns.length < 5) {
      return 0.3; // Not enough data
    }

    // Calculate pattern similarity
    const similarities = userPatterns.map(pattern => 
      this.calculatePatternSimilarity(pattern, currentTransaction)
    );

    return 1 - Math.max(...similarities); // Higher similarity = lower risk
  }

  /**
   * Calculate time-based risk
   */
  private static async calculateTimeRisk(userPatterns: any[]): Promise<number> {
    if (userPatterns.length < 5) {
      return 0.3; // Not enough data
    }

    const currentHour = new Date().getHours();
    const hourPatterns = userPatterns.map(p => new Date(p.timestamp).getHours());
    
    const hourFrequency = hourPatterns.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const maxFrequency = Math.max(...Object.values(hourFrequency));
    const currentFrequency = hourFrequency[currentHour] || 0;

    return 1 - (currentFrequency / maxFrequency);
  }

  /**
   * Get reason for suspicious transaction
   */
  private static getSuspiciousReason(riskFactors: Record<string, number>): string {
    const highRiskFactors = Object.entries(riskFactors)
      .filter(([_, value]) => value > 0.7)
      .map(([key]) => key);

    if (highRiskFactors.length === 0) {
      return "Multiple risk factors detected";
    }

    const reasons: Record<string, string> = {
      amountRisk: "Unusual transaction amount",
      frequencyRisk: "High transaction frequency",
      deviceRisk: "New or suspicious device",
      locationRisk: "Unusual location",
      ipRisk: "Suspicious IP address",
      patternRisk: "Unusual transaction pattern",
      timeRisk: "Unusual transaction time",
    };

    return reasons[highRiskFactors[0]] || "Suspicious activity detected";
  }

  /**
   * Calculate distance between two points
   */
  private static calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLon = this.toRad(point2.lng - point1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.lat)) * Math.cos(this.toRad(point2.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate pattern similarity
   */
  private static calculatePatternSimilarity(pattern1: any, pattern2: any): number {
    const factors = [
      this.normalizeAmount(pattern1.amount, pattern2.amount),
      pattern1.type === pattern2.type ? 1 : 0,
      this.normalizeTime(pattern1.timestamp, pattern2.timestamp),
    ];

    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  }

  /**
   * Normalize amount difference
   */
  private static normalizeAmount(amount1: number, amount2: number): number {
    const maxAmount = Math.max(amount1, amount2);
    const diff = Math.abs(amount1 - amount2);
    return 1 - (diff / maxAmount);
  }

  /**
   * Normalize time difference
   */
  private static normalizeTime(time1: string | Date, time2: string | Date): number {
    const diff = Math.abs(new Date(time1).getTime() - new Date(time2).getTime());
    const maxDiff = 24 * 60 * 60 * 1000; // 24 hours
    return 1 - (diff / maxDiff);
  }

  /**
   * Check if IP is a VPN/proxy
   */
  private static async checkVPN(ip: string): Promise<boolean> {
    // Implement VPN/proxy detection logic
    // This is a placeholder - you should use a proper IP intelligence service
    return false;
  }
} 