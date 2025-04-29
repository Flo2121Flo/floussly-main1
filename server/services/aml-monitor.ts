import { Transaction } from '../types/transaction';
import { logger } from '../utils/logger';
import { RedisService } from '../redis/redis';

interface SuspiciousPattern {
  type: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class AMLMonitor {
  private static instance: AMLMonitor;
  private redisService: RedisService;

  private constructor() {
    this.redisService = RedisService.getInstance();
  }

  public static getInstance(): AMLMonitor {
    if (!AMLMonitor.instance) {
      AMLMonitor.instance = new AMLMonitor();
    }
    return AMLMonitor.instance;
  }

  private async checkRapidTransactions(userId: string, transaction: Transaction): Promise<SuspiciousPattern[]> {
    const patterns: SuspiciousPattern[] = [];
    const key = `user:${userId}:transactions:recent`;
    
    // Get recent transactions from Redis
    const recentTransactions = await this.redisService.get(key) || [];
    
    // Add current transaction
    recentTransactions.push(transaction);
    
    // Keep only last 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const filteredTransactions = recentTransactions.filter(t => 
      new Date(t.createdAt).getTime() > oneDayAgo
    );
    
    // Update Redis
    await this.redisService.set(key, filteredTransactions, 24 * 60 * 60);
    
    // Check for rapid transactions
    if (filteredTransactions.length > 20) {
      patterns.push({
        type: 'RAPID_TRANSACTIONS',
        description: 'More than 20 transactions in 24 hours',
        severity: 'MEDIUM'
      });
    }
    
    return patterns;
  }

  private async checkInstantTopupWithdrawal(userId: string, transaction: Transaction): Promise<SuspiciousPattern[]> {
    const patterns: SuspiciousPattern[] = [];
    const key = `user:${userId}:topup:recent`;
    
    if (transaction.type === 'TOPUP') {
      await this.redisService.set(key, transaction, 60 * 60); // Store for 1 hour
    } else if (transaction.type === 'WITHDRAWAL') {
      const recentTopup = await this.redisService.get(key);
      if (recentTopup) {
        patterns.push({
          type: 'INSTANT_WITHDRAWAL',
          description: 'Withdrawal shortly after top-up',
          severity: 'HIGH'
        });
      }
    }
    
    return patterns;
  }

  private async checkMultipleRecipients(userId: string, transaction: Transaction): Promise<SuspiciousPattern[]> {
    const patterns: SuspiciousPattern[] = [];
    const key = `user:${userId}:recipients:recent`;
    
    if (transaction.type === 'TRANSFER') {
      const recentRecipients = await this.redisService.get(key) || [];
      recentRecipients.push(transaction.receiverId);
      
      // Keep unique recipients from last 24 hours
      const uniqueRecipients = [...new Set(recentRecipients)];
      
      if (uniqueRecipients.length > 10) {
        patterns.push({
          type: 'MULTIPLE_RECIPIENTS',
          description: 'Transfers to more than 10 different recipients in 24 hours',
          severity: 'HIGH'
        });
      }
      
      await this.redisService.set(key, uniqueRecipients, 24 * 60 * 60);
    }
    
    return patterns;
  }

  private async checkSmallTransactions(userId: string, transaction: Transaction): Promise<SuspiciousPattern[]> {
    const patterns: SuspiciousPattern[] = [];
    const key = `user:${userId}:small:transactions`;
    
    if (transaction.amount < 100) { // Small transaction threshold
      const smallTransactions = await this.redisService.get(key) || [];
      smallTransactions.push(transaction);
      
      // Keep last 100 small transactions
      const recentSmallTransactions = smallTransactions.slice(-100);
      
      if (recentSmallTransactions.length >= 100) {
        patterns.push({
          type: 'SMALL_TRANSACTIONS',
          description: 'More than 100 small transactions detected',
          severity: 'MEDIUM'
        });
      }
      
      await this.redisService.set(key, recentSmallTransactions, 24 * 60 * 60);
    }
    
    return patterns;
  }

  public async monitorTransaction(transaction: Transaction): Promise<void> {
    try {
      const userId = transaction.userId;
      
      // Check for various suspicious patterns
      const patterns = [
        ...await this.checkRapidTransactions(userId, transaction),
        ...await this.checkInstantTopupWithdrawal(userId, transaction),
        ...await this.checkMultipleRecipients(userId, transaction),
        ...await this.checkSmallTransactions(userId, transaction)
      ];
      
      if (patterns.length > 0) {
        // Log suspicious activity
        logger.warn('Suspicious activity detected', {
          userId,
          transactionId: transaction.id,
          patterns,
        });
        
        // Store in Redis for further analysis
        await this.redisService.set(
          `suspicious:${userId}:${transaction.id}`,
          {
            transaction,
            patterns,
            timestamp: new Date(),
          },
          7 * 24 * 60 * 60 // Store for 7 days
        );
      }
    } catch (error) {
      logger.error('AML monitoring failed', {
        error,
        transactionId: transaction.id,
      });
    }
  }
} 