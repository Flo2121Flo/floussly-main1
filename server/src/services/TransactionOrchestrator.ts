import { Transaction } from '../models/Transaction';
import { Wallet } from '../models/Wallet';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { NotificationService } from './NotificationService';
import { FraudDetectionService } from './FraudDetectionService';
import { WalletLimitService } from './WalletLimitService';

export class TransactionOrchestrator {
  private static instance: TransactionOrchestrator;
  private readonly eventEmitter: EventEmitter;
  private readonly notificationService: NotificationService;
  private readonly fraudDetectionService: FraudDetectionService;
  private readonly walletLimitService: WalletLimitService;

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.notificationService = NotificationService.getInstance();
    this.fraudDetectionService = FraudDetectionService.getInstance();
    this.walletLimitService = WalletLimitService.getInstance();
  }

  public static getInstance(): TransactionOrchestrator {
    if (!TransactionOrchestrator.instance) {
      TransactionOrchestrator.instance = new TransactionOrchestrator();
    }
    return TransactionOrchestrator.instance;
  }

  async initiateTransfer(
    senderId: string,
    recipientId: string,
    amount: number,
    description?: string
  ): Promise<Transaction> {
    const session = await Transaction.startSession();
    session.startTransaction();

    try {
      // Check wallet limits first
      const limitCheck = await this.walletLimitService.checkLimits(senderId, amount);
      if (!limitCheck.allowed) {
        throw new Error(`Transaction limit exceeded: ${limitCheck.reason}`);
      }

      // Check fraud
      const fraudCheck = await this.fraudDetectionService.checkTransaction({
        senderId,
        recipientId,
        amount
      });

      if (!fraudCheck.allowed) {
        throw new Error(`Fraud check failed: ${fraudCheck.reason}`);
      }

      // Get wallets
      const senderWallet = await Wallet.findOne({ userId: senderId }).session(session);
      const recipientWallet = await Wallet.findOne({ userId: recipientId }).session(session);

      if (!senderWallet || !recipientWallet) {
        throw new Error('Wallets not found');
      }

      if (senderWallet.balance < amount) {
        throw new Error('Insufficient funds');
      }

      // Create transaction record
      const transaction = await Transaction.create([{
        senderId,
        recipientId,
        amount,
        description,
        status: 'PENDING'
      }], { session });

      // Update balances
      senderWallet.balance -= amount;
      recipientWallet.balance += amount;

      await senderWallet.save({ session });
      await recipientWallet.save({ session });

      // Update transaction status
      transaction[0].status = 'COMPLETED';
      await transaction[0].save({ session });

      // Commit transaction
      await session.commitTransaction();

      // Send notifications
      await this.notificationService.sendTransactionNotification({
        userId: senderId,
        type: 'TRANSACTION_SENT',
        amount,
        recipientId
      });

      await this.notificationService.sendTransactionNotification({
        userId: recipientId,
        type: 'TRANSACTION_RECEIVED',
        amount,
        senderId
      });

      logger.info('Transfer completed successfully', {
        transactionId: transaction[0]._id,
        senderId,
        recipientId,
        amount
      });

      return transaction[0];
    } catch (error) {
      await session.abortTransaction();
      logger.error('Transfer failed', {
        error: error.message,
        senderId,
        recipientId,
        amount
      });
      throw error;
    } finally {
      session.endSession();
    }
  }

  async compensateTransfer(transactionId: string): Promise<void> {
    const session = await Transaction.startSession();
    session.startTransaction();

    try {
      const transaction = await Transaction.findById(transactionId).session(session);
      if (!transaction || transaction.status !== 'PENDING') {
        throw new Error('Invalid transaction state for compensation');
      }

      const senderWallet = await Wallet.findOne({ userId: transaction.senderId }).session(session);
      const recipientWallet = await Wallet.findOne({ userId: transaction.recipientId }).session(session);

      if (!senderWallet || !recipientWallet) {
        throw new Error('Wallets not found for compensation');
      }

      // Revert balances
      senderWallet.balance += transaction.amount;
      recipientWallet.balance -= transaction.amount;

      await senderWallet.save({ session });
      await recipientWallet.save({ session });

      // Update transaction status
      transaction.status = 'FAILED';
      await transaction.save({ session });

      await session.commitTransaction();

      logger.info('Transfer compensation completed', {
        transactionId,
        senderId: transaction.senderId,
        recipientId: transaction.recipientId,
        amount: transaction.amount
      });
    } catch (error) {
      await session.abortTransaction();
      logger.error('Transfer compensation failed', {
        error: error.message,
        transactionId
      });
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getTransactionStatus(transactionId: string): Promise<string> {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return transaction.status;
  }
} 