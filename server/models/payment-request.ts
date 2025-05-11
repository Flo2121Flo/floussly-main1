import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export enum PaymentRequestStatus {
  PENDING = 'pending',
  PAID = 'paid',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

export interface PaymentRequest {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  message?: string;
  status: PaymentRequestStatus;
  createdAt: Date;
  updatedAt: Date;
  fulfilledAt?: Date;
  expiresAt: Date;
  metadata?: Record<string, any>;
}

export interface CreatePaymentRequestDTO {
  senderId: string;
  receiverId: string;
  amount: number;
  currency: string;
  message?: string;
  expiresIn?: number; // Duration in hours
}

export interface UpdatePaymentRequestDTO {
  status: PaymentRequestStatus;
  fulfilledAt?: Date;
  metadata?: Record<string, any>;
}

const prisma = new PrismaClient();

export class PaymentRequestModel {
  static async create(data: CreatePaymentRequestDTO): Promise<PaymentRequest> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (data.expiresIn || 24)); // Default 24 hours expiry

      const paymentRequest = await prisma.paymentRequest.create({
        data: {
          id: crypto.randomUUID(),
          senderId: data.senderId,
          receiverId: data.receiverId,
          amount: data.amount,
          currency: data.currency,
          message: data.message,
          status: PaymentRequestStatus.PENDING,
          expiresAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      logger.info('Payment request created', { paymentRequestId: paymentRequest.id });
      return paymentRequest;
    } catch (error) {
      logger.error('Error creating payment request', { error });
      throw error;
    }
  }

  static async findById(id: string): Promise<PaymentRequest | null> {
    try {
      return await prisma.paymentRequest.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('Error finding payment request', { error, id });
      throw error;
    }
  }

  static async update(id: string, data: UpdatePaymentRequestDTO): Promise<PaymentRequest> {
    try {
      const paymentRequest = await prisma.paymentRequest.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      logger.info('Payment request updated', { paymentRequestId: id, status: data.status });
      return paymentRequest;
    } catch (error) {
      logger.error('Error updating payment request', { error, id });
      throw error;
    }
  }

  static async findBySender(senderId: string): Promise<PaymentRequest[]> {
    try {
      return await prisma.paymentRequest.findMany({
        where: { senderId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Error finding payment requests by sender', { error, senderId });
      throw error;
    }
  }

  static async findByReceiver(receiverId: string): Promise<PaymentRequest[]> {
    try {
      return await prisma.paymentRequest.findMany({
        where: { receiverId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Error finding payment requests by receiver', { error, receiverId });
      throw error;
    }
  }

  static async findPending(): Promise<PaymentRequest[]> {
    try {
      return await prisma.paymentRequest.findMany({
        where: {
          status: PaymentRequestStatus.PENDING,
          expiresAt: {
            gt: new Date(),
          },
        },
      });
    } catch (error) {
      logger.error('Error finding pending payment requests', { error });
      throw error;
    }
  }

  static async markExpired(): Promise<void> {
    try {
      await prisma.paymentRequest.updateMany({
        where: {
          status: PaymentRequestStatus.PENDING,
          expiresAt: {
            lt: new Date(),
          },
        },
        data: {
          status: PaymentRequestStatus.EXPIRED,
          updatedAt: new Date(),
        },
      });

      logger.info('Expired payment requests marked');
    } catch (error) {
      logger.error('Error marking expired payment requests', { error });
      throw error;
    }
  }
} 