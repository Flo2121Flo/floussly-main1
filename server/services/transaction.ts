import { PrismaClient, Transaction, TransactionType, TransactionStatus } from '@prisma/client';
import { KMS } from 'aws-sdk';
import { config } from '../config';
import { AppError } from '../utils/error';
import { logger } from '../utils/logger';
import { Redis } from 'ioredis';
import { FraudDetectionService } from "./fraud";

const prisma = new PrismaClient();
const kms = new KMS({ region: config.aws.region });
const redis = new Redis(config.redis.url);

export class TransactionService {
  /**
   * Create a new transaction with fraud detection
   */
  static async createTransaction(data: {
    senderId: string;
    receiverId: string;
    amount: number;
    type: string;
    ip: string;
    deviceFingerprint: string;
    location?: { lat: number; lng: number };
  }): Promise<any> {
    const { senderId, receiverId, amount, type, ip, deviceFingerprint, location } = data;

    try {
      // Check for fraud
      const fraudCheck = await FraudDetectionService.checkTransactionPatterns({
        userId: senderId,
        amount,
        type,
        ip,
        deviceFingerprint,
        location,
      });

      if (fraudCheck.isSuspicious) {
        logger.warn("Suspicious transaction detected", {
          senderId,
          receiverId,
          amount,
          type,
          reason: fraudCheck.reason,
        });

        throw new AppError(
          "Transaction flagged for review due to suspicious activity",
          403,
          "FRAUD_CHECK_FAILED",
          { reason: fraudCheck.reason }
        );
      }

      // Validate amount
      if (amount <= 0) {
        throw new AppError("Invalid transaction amount", 400, "INVALID_AMOUNT");
      }

      // Check sender's wallet balance
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: { wallet: true },
      });

      if (!sender || sender.wallet.balance < amount) {
        throw new AppError("Insufficient funds", 400, "INSUFFICIENT_FUNDS");
      }

      // Create transaction with atomic operation
      const transaction = await prisma.$transaction(async (prisma) => {
        // Create transaction record
        const newTransaction = await prisma.transaction.create({
          data: {
            senderId,
            receiverId,
            amount,
            type,
            status: "PENDING",
            metadata: {
              ip,
              deviceFingerprint,
              location,
            },
          },
        });

        // Update sender's wallet
        await prisma.user.update({
          where: { id: senderId },
          data: {
            wallet: {
              update: {
                balance: {
                  decrement: amount,
                },
              },
            },
          },
        });

        // Update receiver's wallet
        await prisma.user.update({
          where: { id: receiverId },
          data: {
            wallet: {
              update: {
                balance: {
                  increment: amount,
                },
              },
            },
          },
        });

        // Create audit log
        await prisma.auditLog.create({
          data: {
            userId: senderId,
            action: "TRANSACTION_CREATED",
            entityType: "TRANSACTION",
            entityId: newTransaction.id,
            oldData: {},
            newData: {
              amount,
              type,
              status: "PENDING",
            },
          },
        });

        return newTransaction;
      });

      // Cache transaction
      await this.cacheTransaction(transaction);

      return transaction;
    } catch (error) {
      logger.error("Transaction creation failed:", {
        error,
        senderId,
        receiverId,
        amount,
        type,
      });
      throw error;
    }
  }

  /**
   * Cache transaction data
   */
  private static async cacheTransaction(transaction: any): Promise<void> {
    const key = `transaction:${transaction.id}`;
    await redis.set(key, JSON.stringify(transaction), "EX", 300); // 5 minutes

    // Cache user's transactions
    const userKey = `user:${transaction.senderId}:transactions`;
    await redis.lpush(userKey, transaction.id);
    await redis.ltrim(userKey, 0, 99); // Keep last 100 transactions
    await redis.expire(userKey, 3600); // 1 hour
  }

  /**
   * Get transaction by ID
   */
  static async getTransaction(id: string): Promise<any> {
    try {
      // Try cache first
      const cached = await redis.get(`transaction:${id}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // Get from database
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: {
          sender: true,
          receiver: true,
        },
      });

      if (!transaction) {
        throw new AppError("Transaction not found", 404, "NOT_FOUND");
      }

      // Cache result
      await this.cacheTransaction(transaction);

      return transaction;
    } catch (error) {
      logger.error("Failed to get transaction:", { error, id });
      throw error;
    }
  }

  /**
   * Get user's transactions
   */
  static async getUserTransactions(userId: string, page = 1, limit = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;

      const transactions = await prisma.transaction.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
        include: {
          sender: true,
          receiver: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      });

      const total = await prisma.transaction.count({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
      });

      return {
        transactions,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Failed to get user transactions:", { error, userId });
      throw error;
    }
  }

  /**
   * Get daily transaction total for a user
   */
  private static async getDailyTransactionTotal(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await prisma.transaction.aggregate({
      where: {
        senderId: userId,
        createdAt: { gte: today },
        status: TransactionStatus.COMPLETED,
      },
      _sum: { amount: true },
    });

    return result._sum.amount || 0;
  }

  /**
   * Process withdrawal transaction
   */
  static async processWithdrawal(data: {
    userId: string;
    amount: number;
    bankAccountId: string;
  }): Promise<Transaction> {
    const { userId, amount, bankAccountId } = data;

    // Calculate fees
    const flatFee = config.fees.withdrawal.flat;
    const percentageFee = (amount * config.fees.withdrawal.percentage) / 100;
    const totalFee = flatFee + percentageFee;
    const totalAmount = amount + totalFee;

    // Check wallet balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.walletBalance < totalAmount) {
      throw new AppError('Insufficient funds', 400);
    }

    // Process withdrawal
    return await prisma.$transaction(async (tx) => {
      try {
        // Create transaction record
        const transaction = await tx.transaction.create({
          data: {
            senderId: userId,
            recipientId: 'SYSTEM', // System account for withdrawals
            amount: totalAmount,
            type: TransactionType.WITHDRAWAL,
            metadata: {
              bankAccountId,
              withdrawalAmount: amount,
              fees: {
                flat: flatFee,
                percentage: percentageFee,
                total: totalFee,
              },
            },
            status: TransactionStatus.PENDING,
          },
        });

        // Update user's wallet balance
        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: { decrement: totalAmount } },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId,
            action: 'WITHDRAWAL',
            entityType: 'Transaction',
            entityId: transaction.id,
            newData: {
              amount: totalAmount,
              fees: {
                flat: flatFee,
                percentage: percentageFee,
                total: totalFee,
              },
            },
          },
        });

        // TODO: Integrate with banking API for actual withdrawal
        // For now, we'll just mark it as completed
        return await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: TransactionStatus.COMPLETED },
        });
      } catch (error) {
        logger.error('Withdrawal failed:', {
          error,
          userId,
          amount,
          bankAccountId,
        });
        throw new AppError('Withdrawal failed', 500);
      }
    });
  }

  /**
   * Process deposit transaction
   */
  static async processDeposit(data: {
    userId: string;
    amount: number;
    bankAccountId: string;
    reference: string;
  }): Promise<Transaction> {
    const { userId, amount, bankAccountId, reference } = data;

    // Validate amount
    if (amount <= 0) {
      throw new AppError('Invalid deposit amount', 400);
    }

    // Process deposit
    return await prisma.$transaction(async (tx) => {
      try {
        // Create transaction record
        const transaction = await tx.transaction.create({
          data: {
            senderId: 'SYSTEM', // System account for deposits
            recipientId: userId,
            amount,
            type: TransactionType.TOP_UP,
            metadata: {
              bankAccountId,
              reference,
            },
            status: TransactionStatus.PENDING,
          },
        });

        // Update user's wallet balance
        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: { increment: amount } },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId,
            action: 'DEPOSIT',
            entityType: 'Transaction',
            entityId: transaction.id,
            newData: {
              amount,
              reference,
            },
          },
        });

        // TODO: Verify deposit with banking API
        // For now, we'll just mark it as completed
        return await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: TransactionStatus.COMPLETED },
        });
      } catch (error) {
        logger.error('Deposit failed:', {
          error,
          userId,
          amount,
          bankAccountId,
          reference,
        });
        throw new AppError('Deposit failed', 500);
      }
    });
  }
} 