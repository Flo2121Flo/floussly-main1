import { Request, Response } from 'express';
import { PaymentRequestModel, PaymentRequestStatus, CreatePaymentRequestDTO } from '../models/payment-request';
import { UserModel } from '../models/user';
import { TransactionModel } from '../models/transaction';
import { logger } from '../utils/logger';
import { NotificationService } from '../services/notifications';
import { i18n } from '../utils/i18n';
import { validateKYC } from '../utils/kyc';
import { validateBalance } from '../utils/wallet';
import { rateLimit } from '../middleware/rate-limiter';
import { antiFraudMiddleware } from '../middleware/anti-fraud';

export class PaymentRequestController {
  // Create a new payment request
  static async create(req: Request, res: Response) {
    try {
      const { receiverId, amount, currency, message, expiresIn } = req.body;
      const senderId = req.user?.id;

      if (!senderId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate KYC status
      const [senderKYC, receiverKYC] = await Promise.all([
        validateKYC(senderId),
        validateKYC(receiverId),
      ]);

      if (!senderKYC.isVerified || !receiverKYC.isVerified) {
        return res.status(403).json({
          error: 'KYC verification required',
          details: {
            sender: senderKYC.isVerified ? 'verified' : 'unverified',
            receiver: receiverKYC.isVerified ? 'verified' : 'unverified',
          },
        });
      }

      // Create payment request
      const paymentRequest = await PaymentRequestModel.create({
        senderId,
        receiverId,
        amount,
        currency,
        message,
        expiresIn,
      });

      // Send notification to receiver
      await NotificationService.send({
        userId: receiverId,
        type: 'PAYMENT_REQUEST_RECEIVED',
        title: i18n.t('notifications.payment_request.received.title'),
        body: i18n.t('notifications.payment_request.received.body', {
          amount,
          currency,
          sender: senderKYC.name,
        }),
        data: {
          paymentRequestId: paymentRequest.id,
          amount,
          currency,
          senderId,
        },
      });

      return res.status(201).json(paymentRequest);
    } catch (error) {
      logger.error('Error creating payment request', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get payment requests sent by the user
  static async getSent(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const paymentRequests = await PaymentRequestModel.findBySender(userId);
      return res.json(paymentRequests);
    } catch (error) {
      logger.error('Error getting sent payment requests', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get payment requests received by the user
  static async getReceived(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const paymentRequests = await PaymentRequestModel.findByReceiver(userId);
      return res.json(paymentRequests);
    } catch (error) {
      logger.error('Error getting received payment requests', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Pay a payment request
  static async pay(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get payment request
      const paymentRequest = await PaymentRequestModel.findById(id);
      if (!paymentRequest) {
        return res.status(404).json({ error: 'Payment request not found' });
      }

      // Validate receiver
      if (paymentRequest.receiverId !== userId) {
        return res.status(403).json({ error: 'Not authorized to pay this request' });
      }

      // Check if request is still pending
      if (paymentRequest.status !== PaymentRequestStatus.PENDING) {
        return res.status(400).json({ error: 'Payment request is no longer pending' });
      }

      // Validate balance
      const hasBalance = await validateBalance(userId, paymentRequest.amount, paymentRequest.currency);
      if (!hasBalance) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Create transaction
      const transaction = await TransactionModel.create({
        senderId: userId,
        receiverId: paymentRequest.senderId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        type: 'PAYMENT_REQUEST',
        status: 'completed',
        metadata: {
          paymentRequestId: paymentRequest.id,
        },
      });

      // Update payment request status
      await PaymentRequestModel.update(id, {
        status: PaymentRequestStatus.PAID,
        fulfilledAt: new Date(),
        metadata: {
          transactionId: transaction.id,
        },
      });

      // Send notifications
      await Promise.all([
        NotificationService.send({
          userId: paymentRequest.senderId,
          type: 'PAYMENT_REQUEST_PAID',
          title: i18n.t('notifications.payment_request.paid.title'),
          body: i18n.t('notifications.payment_request.paid.body', {
            amount: paymentRequest.amount,
            currency: paymentRequest.currency,
            receiver: userId,
          }),
          data: {
            paymentRequestId: paymentRequest.id,
            transactionId: transaction.id,
          },
        }),
        NotificationService.send({
          userId,
          type: 'PAYMENT_REQUEST_PAID_CONFIRMATION',
          title: i18n.t('notifications.payment_request.paid_confirmation.title'),
          body: i18n.t('notifications.payment_request.paid_confirmation.body', {
            amount: paymentRequest.amount,
            currency: paymentRequest.currency,
            sender: paymentRequest.senderId,
          }),
          data: {
            paymentRequestId: paymentRequest.id,
            transactionId: transaction.id,
          },
        }),
      ]);

      return res.json({
        paymentRequest,
        transaction,
      });
    } catch (error) {
      logger.error('Error paying payment request', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Decline a payment request
  static async decline(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get payment request
      const paymentRequest = await PaymentRequestModel.findById(id);
      if (!paymentRequest) {
        return res.status(404).json({ error: 'Payment request not found' });
      }

      // Validate receiver
      if (paymentRequest.receiverId !== userId) {
        return res.status(403).json({ error: 'Not authorized to decline this request' });
      }

      // Check if request is still pending
      if (paymentRequest.status !== PaymentRequestStatus.PENDING) {
        return res.status(400).json({ error: 'Payment request is no longer pending' });
      }

      // Update payment request status
      await PaymentRequestModel.update(id, {
        status: PaymentRequestStatus.DECLINED,
      });

      // Send notification to sender
      await NotificationService.send({
        userId: paymentRequest.senderId,
        type: 'PAYMENT_REQUEST_DECLINED',
        title: i18n.t('notifications.payment_request.declined.title'),
        body: i18n.t('notifications.payment_request.declined.body', {
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          receiver: userId,
        }),
        data: {
          paymentRequestId: paymentRequest.id,
        },
      });

      return res.json({ message: 'Payment request declined' });
    } catch (error) {
      logger.error('Error declining payment request', { error });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
} 