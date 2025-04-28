import { Transaction } from '../types/transaction';
import { User } from '../types/user';

export class AIAdvisor {
  private static readonly HIGH_BALANCE_THRESHOLD = 0.8; // 80% of balance
  private static readonly FREQUENT_CASHOUT_THRESHOLD = 3; // 3 times per week
  private static readonly SAVINGS_RECOMMENDATION = 0.1; // 10% savings recommendation

  static analyzeTransactions(user: User, transactions: Transaction[]): string[] {
    const advice: string[] = [];
    const recentTransactions = this.getRecentTransactions(transactions, 7); // Last 7 days

    // Check balance usage
    const totalTransferred = recentTransactions
      .filter(t => t.type === 'WALLET_TO_WALLET' || t.type === 'MERCHANT_PAYMENT')
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalTransferred > user.balance * this.HIGH_BALANCE_THRESHOLD) {
      advice.push(`You've transferred ${Math.round((totalTransferred / user.balance) * 100)}% of your balance this week. Consider planning your expenses ahead.`);
    }

    // Check cash-out frequency
    const cashOutCount = recentTransactions
      .filter(t => t.type === 'AGENT_CASHOUT' || t.type === 'BANK_WITHDRAWAL')
      .length;

    if (cashOutCount >= this.FREQUENT_CASHOUT_THRESHOLD) {
      advice.push(`You've made ${cashOutCount} withdrawals this week. Frequent withdrawals may lead to higher fees. Consider keeping more funds in your wallet.`);
    }

    // Savings recommendation
    const incomingAmount = recentTransactions
      .filter(t => t.type === 'CARD_TOPUP' || t.type === 'AGENT_TOPUP')
      .reduce((sum, t) => sum + t.amount, 0);

    if (incomingAmount > 0) {
      const recommendedSavings = incomingAmount * this.SAVINGS_RECOMMENDATION;
      advice.push(`Consider saving ${recommendedSavings.toFixed(2)} MAD (10%) from your recent top-ups for future needs.`);
    }

    return advice;
  }

  private static getRecentTransactions(transactions: Transaction[], days: number): Transaction[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return transactions.filter(t => new Date(t.date) >= cutoffDate);
  }
} 