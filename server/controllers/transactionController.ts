import { Request, Response } from 'express';
import { FeeCalculator } from '../services/feeCalculator';
import { AMLMonitor } from '../services/amlMonitor';
import { TransactionType } from '../types/transaction';
import { validateTransaction } from '../validation/transactionValidation';

export class TransactionController {
  static async createTransaction(req: Request, res: Response) {
    try {
      const { type, amount, recipientId, metadata } = req.body;
      const userId = req.user.id; // Assuming user is authenticated

      // Validate transaction
      const validationError = validateTransaction(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Check for suspicious activity
      const suspiciousActivity = await AMLMonitor.checkForSuspiciousActivity(
        req.user,
        await this.getUserTransactions(userId)
      );

      if (suspiciousActivity.isSuspicious) {
        return res.status(403).json({
          error: 'Transaction blocked due to suspicious activity',
          reason: suspiciousActivity.reason
        });
      }

      // Calculate fee
      const fee = FeeCalculator.calculateFee(type, amount);
      const totalAmount = FeeCalculator.calculateTotal(amount, fee);

      // Check user balance
      if (type !== TransactionType.CARD_TOPUP && type !== TransactionType.AGENT_TOPUP) {
        const userBalance = await this.getUserBalance(userId);
        if (userBalance < totalAmount) {
          return res.status(400).json({ error: 'Insufficient balance' });
        }
      }

      // Create transaction
      const transaction = await this.saveTransaction({
        userId,
        type,
        amount,
        fee,
        totalAmount,
        recipientId,
        metadata,
        status: 'pending'
      });

      // Process transaction based on type
      switch (type) {
        case TransactionType.WALLET_TO_WALLET:
          await this.processWalletTransfer(transaction);
          break;
        case TransactionType.BANK_WITHDRAWAL:
          await this.processBankWithdrawal(transaction);
          break;
        case TransactionType.AGENT_CASHOUT:
          await this.processAgentCashout(transaction);
          break;
        case TransactionType.AGENT_TOPUP:
          await this.processAgentTopup(transaction);
          break;
        case TransactionType.CARD_TOPUP:
          await this.processCardTopup(transaction);
          break;
        case TransactionType.MERCHANT_PAYMENT:
          await this.processMerchantPayment(transaction);
          break;
      }

      res.status(201).json(transaction);
    } catch (error) {
      console.error('Transaction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getTransactionFee(req: Request, res: Response) {
    try {
      const { type, amount } = req.body;
      const fee = FeeCalculator.calculateFee(type, amount);
      const total = FeeCalculator.calculateTotal(amount, fee);

      res.json({
        fee: FeeCalculator.formatFee(fee),
        total: FeeCalculator.formatFee(total)
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUserTransactions(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const transactions = await this.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Private helper methods
  private static async getUserTransactions(userId: string) {
    // Implementation to fetch user transactions from database
    return [];
  }

  private static async getUserBalance(userId: string) {
    // Implementation to fetch user balance from database
    return 0;
  }

  private static async saveTransaction(transaction: any) {
    // Implementation to save transaction to database
    return transaction;
  }

  private static async processWalletTransfer(transaction: any) {
    // Implementation for wallet-to-wallet transfer
  }

  private static async processBankWithdrawal(transaction: any) {
    // Implementation for bank withdrawal
  }

  private static async processAgentCashout(transaction: any) {
    // Implementation for agent cashout
  }

  private static async processAgentTopup(transaction: any) {
    // Implementation for agent topup
  }

  private static async processCardTopup(transaction: any) {
    // Implementation for card topup
  }

  private static async processMerchantPayment(transaction: any) {
    // Implementation for merchant payment
  }
} 