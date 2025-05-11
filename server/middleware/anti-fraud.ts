import { Request, Response, NextFunction } from 'express';
import { redis } from '../redis/redis';
import logger from '../services/logging';
import { config } from '../config';
import { User } from '../models/user';
import { Transaction } from '../models/transaction';

// Fraud detection thresholds
const FRAUD_THRESHOLDS = {
  maxTransactionAmount: 10000, // $10,000
  maxDailyTransactions: 50,
  maxFailedAttempts: 3,
  suspiciousIPThreshold: 5,
  velocityThreshold: 1000, // $1,000 per hour
};

// Fraud detection middleware
export const antiFraudMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const ip = req.ip;
    const path = req.path;
    const method = req.method;

    // Skip fraud checks for non-sensitive endpoints
    if (isNonSensitiveEndpoint(path, method)) {
      return next();
    }

    // Check for suspicious IP
    if (await isSuspiciousIP(ip)) {
      logger.warn('Suspicious IP detected', { ip, userId, path });
      return res.status(403).json({
        error: 'Access denied due to suspicious activity',
        code: 'SUSPICIOUS_IP',
      });
    }

    // Check for failed attempts
    if (await hasTooManyFailedAttempts(userId, ip)) {
      logger.warn('Too many failed attempts', { ip, userId, path });
      return res.status(403).json({
        error: 'Too many failed attempts. Please try again later.',
        code: 'TOO_MANY_FAILED_ATTEMPTS',
      });
    }

    // Check transaction limits
    if (isTransactionEndpoint(path) && req.body.amount) {
      const amount = parseFloat(req.body.amount);
      
      if (await isTransactionSuspicious(userId, amount)) {
        logger.warn('Suspicious transaction detected', {
          userId,
          amount,
          ip,
          path,
        });
        return res.status(403).json({
          error: 'Transaction rejected due to suspicious activity',
          code: 'SUSPICIOUS_TRANSACTION',
        });
      }
    }

    // Check for velocity
    if (isTransactionEndpoint(path) && req.body.amount) {
      const amount = parseFloat(req.body.amount);
      
      if (await isVelocitySuspicious(userId, amount)) {
        logger.warn('Suspicious velocity detected', {
          userId,
          amount,
          ip,
          path,
        });
        return res.status(403).json({
          error: 'Transaction rejected due to high velocity',
          code: 'HIGH_VELOCITY',
        });
      }
    }

    // Check for unusual patterns
    if (await hasUnusualPatterns(userId, ip, path)) {
      logger.warn('Unusual patterns detected', { userId, ip, path });
      return res.status(403).json({
        error: 'Access denied due to unusual patterns',
        code: 'UNUSUAL_PATTERNS',
      });
    }

    next();
  } catch (error) {
    logger.error('Anti-fraud middleware error', { error });
    next(error);
  }
};

// Helper functions
const isNonSensitiveEndpoint = (path: string, method: string): boolean => {
  const nonSensitivePaths = [
    '/health',
    '/metrics',
    '/docs',
    '/static',
  ];
  
  return nonSensitivePaths.some(p => path.startsWith(p)) || method === 'GET';
};

const isTransactionEndpoint = (path: string): boolean => {
  return path.startsWith('/transactions') || path.startsWith('/payments');
};

const isSuspiciousIP = async (ip: string): Promise<boolean> => {
  const key = `suspicious:ip:${ip}`;
  const count = await redis.incr(key);
  await redis.expire(key, 3600); // 1 hour expiry
  
  return count > FRAUD_THRESHOLDS.suspiciousIPThreshold;
};

const hasTooManyFailedAttempts = async (userId: string | undefined, ip: string): Promise<boolean> => {
  const key = `failed:attempts:${userId || ip}`;
  const count = await redis.incr(key);
  await redis.expire(key, 3600); // 1 hour expiry
  
  return count > FRAUD_THRESHOLDS.maxFailedAttempts;
};

const isTransactionSuspicious = async (userId: string | undefined, amount: number): Promise<boolean> => {
  if (!userId) return false;

  // Check amount threshold
  if (amount > FRAUD_THRESHOLDS.maxTransactionAmount) {
    return true;
  }

  // Check daily transaction count
  const today = new Date().toISOString().split('T')[0];
  const key = `transactions:count:${userId}:${today}`;
  const count = await redis.incr(key);
  await redis.expire(key, 86400); // 24 hours expiry

  return count > FRAUD_THRESHOLDS.maxDailyTransactions;
};

const isVelocitySuspicious = async (userId: string | undefined, amount: number): Promise<boolean> => {
  if (!userId) return false;

  const key = `velocity:${userId}`;
  const currentVelocity = await redis.incrby(key, amount);
  await redis.expire(key, 3600); // 1 hour expiry

  return currentVelocity > FRAUD_THRESHOLDS.velocityThreshold;
};

const hasUnusualPatterns = async (userId: string | undefined, ip: string, path: string): Promise<boolean> => {
  if (!userId) return false;

  // Check for multiple IPs
  const userIPsKey = `user:ips:${userId}`;
  await redis.sadd(userIPsKey, ip);
  const ipCount = await redis.scard(userIPsKey);
  await redis.expire(userIPsKey, 86400); // 24 hours expiry

  if (ipCount > 3) {
    return true;
  }

  // Check for unusual time patterns
  const hour = new Date().getHours();
  const key = `activity:hour:${userId}:${hour}`;
  const count = await redis.incr(key);
  await redis.expire(key, 3600); // 1 hour expiry

  return count > 100; // More than 100 requests per hour
};

// Export middleware
export default antiFraudMiddleware; 