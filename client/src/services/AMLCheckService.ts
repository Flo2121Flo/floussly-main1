import { v4 as uuidv4 } from 'uuid';
import { AMLCheck, AMLCheckType, AMLCheckStatus, AMLMatch } from '../types/transaction';
import { UserProfile } from '../types/user';
import { logger } from '../utils/logger';
import { redis } from '../lib/redis';
import { db } from '../lib/db';
import { NotificationService } from './NotificationService';

export class AMLCheckService {
  private static instance: AMLCheckService;
  private notificationService: NotificationService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): AMLCheckService {
    if (!AMLCheckService.instance) {
      AMLCheckService.instance = new AMLCheckService();
    }
    return AMLCheckService.instance;
  }

  async checkUser(user: UserProfile): Promise<AMLCheck> {
    const checkId = uuidv4();
    const now = new Date();

    // Check PEP/sanction lists
    const matches = await this.checkPEPAndSanctions(user);

    // Calculate risk score
    const riskScore = this.calculateRiskScore(matches);

    // Determine check status
    const status = this.determineCheckStatus(riskScore);

    const check: AMLCheck = {
      checkId,
      userId: user.userId,
      type: AMLCheckType.USER,
      riskScore,
      status,
      matches,
      createdAt: now,
      updatedAt: now,
    };

    // Store check result
    await db.amlChecks.create(check);

    // Update user risk score
    await db.users.update(user.userId, { riskScore });

    // Notify if high risk
    if (status === AMLCheckStatus.FLAGGED || status === AMLCheckStatus.BLOCKED) {
      await this.notifyHighRiskUser(user, check);
    }

    return check;
  }

  async checkTransaction(transaction: any): Promise<AMLCheck> {
    const checkId = uuidv4();
    const now = new Date();

    // Get sender and receiver
    const [sender, receiver] = await Promise.all([
      db.users.findById(transaction.senderWalletId),
      db.users.findById(transaction.receiverWalletId),
    ]);

    if (!sender || !receiver) {
      throw new Error('Invalid user IDs');
    }

    // Check transaction patterns
    const matches = await this.checkTransactionPatterns(transaction, sender, receiver);

    // Calculate risk score
    const riskScore = this.calculateRiskScore(matches);

    // Determine check status
    const status = this.determineCheckStatus(riskScore);

    const check: AMLCheck = {
      checkId,
      userId: sender.userId,
      type: AMLCheckType.TRANSACTION,
      riskScore,
      status,
      matches,
      createdAt: now,
      updatedAt: now,
    };

    // Store check result
    await db.amlChecks.create(check);

    // Notify if high risk
    if (status === AMLCheckStatus.FLAGGED || status === AMLCheckStatus.BLOCKED) {
      await this.notifyHighRiskTransaction(transaction, check);
    }

    return check;
  }

  private async checkPEPAndSanctions(user: UserProfile): Promise<AMLMatch[]> {
    const matches: AMLMatch[] = [];

    // Check PEP list
    const pepMatch = await this.checkPEPList(user);
    if (pepMatch) {
      matches.push(pepMatch);
    }

    // Check sanctions list
    const sanctionsMatch = await this.checkSanctionsList(user);
    if (sanctionsMatch) {
      matches.push(sanctionsMatch);
    }

    return matches;
  }

  private async checkPEPList(user: UserProfile): Promise<AMLMatch | null> {
    // Implement PEP list check logic
    // This would typically involve calling an external API or checking a database
    return null;
  }

  private async checkSanctionsList(user: UserProfile): Promise<AMLMatch | null> {
    // Implement sanctions list check logic
    // This would typically involve calling an external API or checking a database
    return null;
  }

  private async checkTransactionPatterns(
    transaction: any,
    sender: UserProfile,
    receiver: UserProfile
  ): Promise<AMLMatch[]> {
    const matches: AMLMatch[] = [];

    // Check for unusual amount
    if (this.isUnusualAmount(transaction.amount)) {
      matches.push({
        matchId: uuidv4(),
        checkId: transaction.txId,
        source: 'amount_check',
        matchType: 'unusual_amount',
        confidence: 0.8,
        details: {
          amount: transaction.amount,
          threshold: 10000,
        },
        createdAt: new Date(),
      });
    }

    // Check for unusual frequency
    if (await this.isUnusualFrequency(sender.userId)) {
      matches.push({
        matchId: uuidv4(),
        checkId: transaction.txId,
        source: 'frequency_check',
        matchType: 'unusual_frequency',
        confidence: 0.7,
        details: {
          userId: sender.userId,
          period: '24h',
        },
        createdAt: new Date(),
      });
    }

    return matches;
  }

  private isUnusualAmount(amount: number): boolean {
    // Implement amount check logic
    return amount > 10000; // Example threshold
  }

  private async isUnusualFrequency(userId: string): Promise<boolean> {
    // Implement frequency check logic
    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);

    const transactions = await db.transactions.find({
      senderWalletId: { $in: await db.wallets.findByUserId(userId).map(w => w.walletId) },
      createdAt: { $gte: last24h },
    });

    return transactions.length > 10; // Example threshold
  }

  private calculateRiskScore(matches: AMLMatch[]): number {
    if (matches.length === 0) return 0;

    // Calculate weighted risk score based on matches
    const weights = {
      pep_match: 0.8,
      sanctions_match: 0.9,
      unusual_amount: 0.6,
      unusual_frequency: 0.5,
    };

    return matches.reduce((score, match) => {
      const weight = weights[match.matchType] || 0.5;
      return score + (weight * match.confidence);
    }, 0);
  }

  private determineCheckStatus(riskScore: number): AMLCheckStatus {
    if (riskScore >= 0.8) return AMLCheckStatus.BLOCKED;
    if (riskScore >= 0.5) return AMLCheckStatus.FLAGGED;
    return AMLCheckStatus.PASSED;
  }

  private async notifyHighRiskUser(user: UserProfile, check: AMLCheck): Promise<void> {
    await this.notificationService.sendNotification({
      userId: user.userId,
      type: 'SECURITY',
      title: 'Account Review Required',
      message: 'Your account requires additional verification. Please contact support.',
      data: { checkId: check.checkId },
    });

    logger.warn('High risk user detected', {
      userId: user.userId,
      riskScore: check.riskScore,
      status: check.status,
    });
  }

  private async notifyHighRiskTransaction(transaction: any, check: AMLCheck): Promise<void> {
    await this.notificationService.sendNotification({
      userId: transaction.senderWalletId,
      type: 'SECURITY',
      title: 'Transaction Review Required',
      message: 'Your transaction requires additional verification. Please contact support.',
      data: { checkId: check.checkId, transactionId: transaction.txId },
    });

    logger.warn('High risk transaction detected', {
      transactionId: transaction.txId,
      riskScore: check.riskScore,
      status: check.status,
    });
  }
} 