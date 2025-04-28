import { Transaction } from '../types/transaction';
import { User } from '../types/user';

export class AMLMonitor {
  private static readonly SUSPICIOUS_AMOUNT_THRESHOLD = 10000; // 10,000 MAD
  private static readonly RAPID_TRANSACTION_THRESHOLD = 5; // 5 transactions in 1 hour
  private static readonly WITHDRAWAL_PATTERN_THRESHOLD = 0.9; // 90% of top-up amount

  static checkForSuspiciousActivity(user: User, transactions: Transaction[]): {
    isSuspicious: boolean;
    reason: string | null;
  } {
    const recentTransactions = this.getRecentTransactions(transactions, 24); // Last 24 hours

    // Check for large amounts
    const largeTransactions = recentTransactions.filter(t => t.amount >= this.SUSPICIOUS_AMOUNT_THRESHOLD);
    if (largeTransactions.length > 0) {
      return {
        isSuspicious: true,
        reason: `Large transaction detected: ${largeTransactions[0].amount} MAD`
      };
    }

    // Check for rapid transactions
    const transactionCount = recentTransactions.length;
    if (transactionCount >= this.RAPID_TRANSACTION_THRESHOLD) {
      return {
        isSuspicious: true,
        reason: `High frequency of transactions: ${transactionCount} in 24 hours`
      };
    }

    // Check for immediate withdrawal patterns
    const topups = recentTransactions.filter(t => t.type === 'CARD_TOPUP' || t.type === 'AGENT_TOPUP');
    const withdrawals = recentTransactions.filter(t => t.type === 'AGENT_CASHOUT' || t.type === 'BANK_WITHDRAWAL');

    for (const topup of topups) {
      const relatedWithdrawals = withdrawals.filter(w => 
        new Date(w.date).getTime() - new Date(topup.date).getTime() < 3600000 // Within 1 hour
      );

      const totalWithdrawn = relatedWithdrawals.reduce((sum, w) => sum + w.amount, 0);
      if (totalWithdrawn >= topup.amount * this.WITHDRAWAL_PATTERN_THRESHOLD) {
        return {
          isSuspicious: true,
          reason: 'Suspicious pattern: Immediate withdrawal after top-up'
        };
      }
    }

    return {
      isSuspicious: false,
      reason: null
    };
  }

  private static getRecentTransactions(transactions: Transaction[], hours: number): Transaction[] {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);
    return transactions.filter(t => new Date(t.date) >= cutoffDate);
  }
} 