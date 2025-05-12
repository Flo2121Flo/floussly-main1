import { v4 as uuidv4 } from 'uuid';
import { Transaction, TransactionLimit, TransactionQR, AMLCheck, TransactionStatus, TransactionType } from '../types/transaction';
import { UserProfile } from '../types/user';
import { Currency } from '../types/common';
import { logger } from '../utils/logger';
import { redis } from '../lib/redis';
import { db } from '../lib/db';
import { NotificationService } from './NotificationService';
import { AMLCheckService } from './AMLCheckService';

export class TransactionService {
  private static instance: TransactionService;
  private notificationService: NotificationService;
  private amlCheckService: AMLCheckService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
    this.amlCheckService = AMLCheckService.getInstance();
  }

  public static getInstance(): TransactionService {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService();
    }
    return TransactionService.instance;
  }

  async createTransaction(
    senderWalletId: string,
    receiverWalletId: string,
    amount: number,
    currency: Currency,
    type: TransactionType,
    description?: string
  ): Promise<Transaction> {
    const txId = uuidv4();
    const now = new Date();

    // Get sender and receiver wallets
    const [senderWallet, receiverWallet] = await Promise.all([
      db.wallets.findById(senderWalletId),
      db.wallets.findById(receiverWalletId),
    ]);

    if (!senderWallet || !receiverWallet) {
      throw new Error('Invalid wallet IDs');
    }

    // Get sender and receiver users
    const [sender, receiver] = await Promise.all([
      db.users.findById(senderWallet.userId),
      db.users.findById(receiverWallet.userId),
    ]);

    if (!sender || !receiver) {
      throw new Error('Invalid user IDs');
    }

    // Validate transaction
    await this.validateTransaction(sender, amount, currency, type);

    // Create transaction
    const transaction: Transaction = {
      txId,
      senderWalletId,
      receiverWalletId,
      amount,
      currency,
      status: TransactionStatus.PENDING,
      type,
      description,
      createdAt: now,
      updatedAt: now,
    };

    // Run AML check
    const amlCheck = await this.amlCheckService.checkTransaction(transaction);
    if (amlCheck.status === 'blocked') {
      throw new Error('Transaction blocked by AML check');
    }

    // Store transaction
    await db.transactions.create(transaction);

    // Update wallet balances
    await this.updateWalletBalances(transaction);

    // Send notifications
    await this.notifyTransaction(transaction, sender, receiver);

    return transaction;
  }

  async createTransactionQR(
    userId: string,
    walletId: string,
    displayName: string,
    amount?: number,
    currency: Currency = Currency.MAD
  ): Promise<TransactionQR> {
    const qrId = uuidv4();
    const now = new Date();

    const qr: TransactionQR = {
      qrId,
      userId,
      walletId,
      displayName,
      amount,
      currency,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.transactionQRs.create(qr);
    return qr;
  }

  async processTransactionQR(
    qrId: string,
    senderWalletId: string,
    amount?: number
  ): Promise<Transaction> {
    const qr = await db.transactionQRs.findById(qrId);
    if (!qr || !qr.isActive) {
      throw new Error('Invalid or inactive QR code');
    }

    // Use QR amount if not provided
    const transactionAmount = amount || qr.amount;
    if (!transactionAmount) {
      throw new Error('Amount is required');
    }

    return this.createTransaction(
      senderWalletId,
      qr.walletId,
      transactionAmount,
      qr.currency,
      TransactionType.P2P
    );
  }

  private async validateTransaction(
    user: UserProfile,
    amount: number,
    currency: Currency,
    type: TransactionType
  ): Promise<void> {
    // Check daily limit
    const dailyLimit = await this.getDailyLimit(user.userId, currency);
    const dailyTotal = await this.getDailyTotal(user.userId, currency);

    if (dailyTotal + amount > dailyLimit) {
      throw new Error('Daily transaction limit exceeded');
    }

    // Check wallet balance
    const wallet = await db.wallets.findByUserId(user.userId);
    if (!wallet || wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Check KYC level
    if (type === TransactionType.P2P && user.kycLevel === 'level_0') {
      throw new Error('KYC verification required for P2P transfers');
    }
  }

  private async updateWalletBalances(transaction: Transaction): Promise<void> {
    const [senderWallet, receiverWallet] = await Promise.all([
      db.wallets.findById(transaction.senderWalletId),
      db.wallets.findById(transaction.receiverWalletId),
    ]);

    if (!senderWallet || !receiverWallet) {
      throw new Error('Invalid wallet IDs');
    }

    // Update balances
    await Promise.all([
      db.wallets.update(senderWallet.walletId, {
        balance: senderWallet.balance - transaction.amount,
      }),
      db.wallets.update(receiverWallet.walletId, {
        balance: receiverWallet.balance + transaction.amount,
      }),
    ]);

    // Update transaction status
    await db.transactions.update(transaction.txId, {
      status: TransactionStatus.COMPLETED,
      completedAt: new Date(),
    });
  }

  private async notifyTransaction(
    transaction: Transaction,
    sender: UserProfile,
    receiver: UserProfile
  ): Promise<void> {
    await Promise.all([
      this.notificationService.sendNotification({
        userId: sender.userId,
        type: 'TRANSACTION',
        title: 'Transaction Sent',
        message: `You sent ${transaction.amount} ${transaction.currency} to ${receiver.username}`,
        data: { transactionId: transaction.txId },
      }),
      this.notificationService.sendNotification({
        userId: receiver.userId,
        type: 'TRANSACTION',
        title: 'Money Received',
        message: `You received ${transaction.amount} ${transaction.currency} from ${sender.username}`,
        data: { transactionId: transaction.txId },
      }),
    ]);
  }

  private async getDailyLimit(userId: string, currency: Currency): Promise<number> {
    const limit = await db.transactionLimits.findOne({
      userId,
      currency,
      type: 'DAILY',
    });
    return limit?.amount || 1000; // Default limit
  }

  private async getDailyTotal(userId: string, currency: Currency): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transactions = await db.transactions.find({
      senderWalletId: { $in: await db.wallets.findByUserId(userId).map(w => w.walletId) },
      currency,
      createdAt: { $gte: today },
      status: TransactionStatus.COMPLETED,
    });

    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }
} 