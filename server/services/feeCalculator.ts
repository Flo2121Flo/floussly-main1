import { TransactionType } from '../types/transaction';

export class FeeCalculator {
  private static readonly BANK_WITHDRAWAL_FEE = 12;
  private static readonly AGENT_TOPUP_FEE = 2;
  private static readonly AGENT_CASHOUT_PERCENTAGE = 0.015;
  private static readonly AGENT_CASHOUT_MIN_FEE = 2.5;
  private static readonly CARD_TOPUP_PERCENTAGE = 0.01;
  private static readonly CARD_TOPUP_MIN_FEE = 3;

  static calculateFee(type: TransactionType, amount: number): number {
    switch (type) {
      case TransactionType.WALLET_TO_WALLET:
      case TransactionType.MERCHANT_PAYMENT:
        return 0;
      
      case TransactionType.BANK_WITHDRAWAL:
        return this.BANK_WITHDRAWAL_FEE;
      
      case TransactionType.AGENT_CASHOUT:
        const percentageFee = amount * this.AGENT_CASHOUT_PERCENTAGE;
        return Math.max(percentageFee, this.AGENT_CASHOUT_MIN_FEE);
      
      case TransactionType.AGENT_TOPUP:
        return this.AGENT_TOPUP_FEE;
      
      case TransactionType.CARD_TOPUP:
        const cardFee = amount * this.CARD_TOPUP_PERCENTAGE;
        return Math.max(cardFee, this.CARD_TOPUP_MIN_FEE);
      
      default:
        return 0;
    }
  }

  static formatFee(fee: number): string {
    return fee.toFixed(2);
  }

  static calculateTotal(amount: number, fee: number): number {
    return Number((amount + fee).toFixed(2));
  }
} 