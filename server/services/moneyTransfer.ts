import { PrismaClient, Transaction, TransactionStatus, TransactionType } from '@prisma/client';
import { z } from 'zod';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Validation schemas
const transferSchema = z.object({
  messageId: z.string().uuid(),
  senderId: z.string().uuid(),
  receiverId: z.string().uuid(),
  amount: z.number().positive(),
  type: z.nativeEnum(TransactionType),
});

const voiceTransferSchema = transferSchema.extend({
  voiceNoteId: z.string().uuid(),
});

const textTransferSchema = transferSchema.extend({
  text: z.string(),
});

// Fee constants
const WITHDRAWAL_FEE_CAP = 13; // Maximum withdrawal fee in MAD
const MERCHANT_FEE_PERCENTAGE = 0.02; // 2% merchant fee (absorbed by Floussly)

export class MoneyTransferService {
  async initiateTransfer(data: z.infer<typeof transferSchema>): Promise<Transaction> {
    const validatedData = transferSchema.parse(data);

    // Check sender's balance (implement your balance checking logic)
    const hasSufficientBalance = await this.checkBalance(validatedData.senderId, validatedData.amount);
    if (!hasSufficientBalance) {
      throw new Error('Insufficient balance');
    }

    // Calculate fees based on transfer type
    const fees = this.calculateFees(validatedData.amount, validatedData.type);

    // Create pending transaction
    const transaction = await prisma.transaction.create({
      data: {
        ...validatedData,
        status: TransactionStatus.PENDING,
        fees: fees.total,
        netAmount: validatedData.amount - fees.total,
      },
      include: {
        message: true,
        sender: true,
        receiver: true,
      },
    });

    // Notify receiver (implement your notification logic)
    await this.notifyReceiver(validatedData.receiverId, {
      type: 'transfer_pending',
      amount: validatedData.amount,
      senderId: validatedData.senderId,
      transactionId: transaction.id,
    });

    return transaction;
  }

  async confirmTransfer(transactionId: string, receiverId: string): Promise<Transaction> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { message: true },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.receiverId !== receiverId) {
      throw new Error('Unauthorized');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new Error('Transaction is not pending');
    }

    // Process the transfer (implement your transfer logic)
    await this.processTransfer(transaction);

    // Update transaction status
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.COMPLETED },
      include: {
        message: true,
        sender: true,
        receiver: true,
      },
    });

    // Notify both parties
    await this.notifySender(transaction.senderId, {
      type: 'transfer_completed',
      amount: transaction.amount,
      receiverId: transaction.receiverId,
      transactionId: transaction.id,
    });

    await this.notifyReceiver(transaction.receiverId, {
      type: 'transfer_received',
      amount: transaction.amount,
      senderId: transaction.senderId,
      transactionId: transaction.id,
    });

    return updatedTransaction;
  }

  async cancelTransfer(transactionId: string, userId: string): Promise<Transaction> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.senderId !== userId && transaction.receiverId !== userId) {
      throw new Error('Unauthorized');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new Error('Transaction cannot be cancelled');
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.CANCELLED },
      include: {
        message: true,
        sender: true,
        receiver: true,
      },
    });

    // Notify both parties
    await this.notifySender(transaction.senderId, {
      type: 'transfer_cancelled',
      amount: transaction.amount,
      receiverId: transaction.receiverId,
      transactionId: transaction.id,
    });

    await this.notifyReceiver(transaction.receiverId, {
      type: 'transfer_cancelled',
      amount: transaction.amount,
      senderId: transaction.senderId,
      transactionId: transaction.id,
    });

    return updatedTransaction;
  }

  async parseTextForTransfer(text: string): Promise<{ amount: number } | null> {
    // Simple regex to match amounts in text
    const amountRegex = /(\d+(?:\.\d{1,2})?)\s*(?:MAD|درهم|dirham)?/i;
    const match = text.match(amountRegex);

    if (match) {
      const amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0) {
        return { amount };
      }
    }

    return null;
  }

  private calculateFees(amount: number, type: TransactionType): { total: number; breakdown: Record<string, number> } {
    const fees: Record<string, number> = {};

    switch (type) {
      case 'TEXT':
      case 'VOICE':
      case 'TREASURE':
        // No fees for P2P transfers within messaging system
        fees.transfer = 0;
        break;

      case 'WITHDRAWAL':
        // Cap withdrawal fees at 13 MAD
        fees.withdrawal = Math.min(amount * 0.01, WITHDRAWAL_FEE_CAP);
        break;

      case 'TONTINE':
        // Keep existing tontine fee logic
        fees.tontine = amount * 0.005; // 0.5% tontine fee
        break;

      case 'MERCHANT':
        // Merchant fees are absorbed by Floussly
        fees.merchant = amount * MERCHANT_FEE_PERCENTAGE;
        break;

      default:
        fees.other = 0;
    }

    const total = Object.values(fees).reduce((sum, fee) => sum + fee, 0);
    return { total, breakdown: fees };
  }

  private async checkBalance(userId: string, amount: number): Promise<boolean> {
    // Implement your balance checking logic here
    // This is a placeholder that always returns true
    return true;
  }

  private async processTransfer(transaction: Transaction): Promise<void> {
    // Implement your transfer processing logic here
    // This could involve updating balances, calling payment APIs, etc.
    logger.info(`Processing transfer: ${transaction.id}`);
  }

  private async notifySender(userId: string, data: any): Promise<void> {
    // Implement your notification logic here
    logger.info(`Notifying sender ${userId}:`, data);
  }

  private async notifyReceiver(userId: string, data: any): Promise<void> {
    // Implement your notification logic here
    logger.info(`Notifying receiver ${userId}:`, data);
  }
} 