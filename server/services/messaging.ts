import { PrismaClient, Message, MessageType, MessageStatus } from '@prisma/client';
import { KMS } from 'aws-sdk';
import { config } from '../config';
import { AppError } from '../utils/error';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
const kms = new KMS({ region: config.aws.region });

export class MessagingService {
  /**
   * Send a new message
   */
  static async sendMessage(data: {
    senderId: string;
    recipientId: string;
    type: MessageType;
    content: string;
    metadata?: Record<string, any>;
    expiresAt?: Date;
  }): Promise<Message> {
    const { senderId, recipientId, type, content, metadata, expiresAt } = data;

    // Validate message size
    if (content.length > config.messaging.maxSize) {
      throw new AppError('Message content exceeds maximum size limit', 400);
    }

    // Set default expiry if not provided
    const messageExpiry = expiresAt || new Date(Date.now() + config.messaging.expiryDays * 24 * 60 * 60 * 1000);

    // Encrypt message content
    const encryptedContent = await this.encryptMessage(content);

    // Create message
    return await prisma.message.create({
      data: {
        senderId,
        recipientId,
        type,
        content: encryptedContent,
        metadata,
        expiresAt: messageExpiry,
        status: MessageStatus.SENT,
      },
    });
  }

  /**
   * Send a money message
   */
  static async sendMoneyMessage(data: {
    senderId: string;
    recipientId: string;
    amount: number;
    description?: string;
    expiresAt?: Date;
  }): Promise<Message> {
    const { senderId, recipientId, amount, description, expiresAt } = data;

    // Validate amount
    if (amount <= 0) {
      throw new AppError('Invalid amount', 400);
    }

    // Check sender's wallet balance
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { walletBalance: true },
    });

    if (!sender) {
      throw new AppError('Sender not found', 404);
    }

    if (sender.walletBalance < amount) {
      throw new AppError('Insufficient funds', 400);
    }

    // Set default expiry if not provided
    const messageExpiry = expiresAt || new Date(Date.now() + config.messaging.expiryDays * 24 * 60 * 60 * 1000);

    // Create money message
    return await prisma.$transaction(async (tx) => {
      // Create message
      const message = await tx.message.create({
        data: {
          senderId,
          recipientId,
          type: MessageType.MONEY,
          content: await this.encryptMessage(JSON.stringify({ amount, description })),
          metadata: {
            amount,
            description,
          },
          expiresAt: messageExpiry,
          status: MessageStatus.SENT,
        },
      });

      // Deduct amount from sender's wallet
      await tx.user.update({
        where: { id: senderId },
        data: { walletBalance: { decrement: amount } },
      });

      return message;
    });
  }

  /**
   * Claim money from a money message
   */
  static async claimMoneyMessage(messageId: string, recipientId: string): Promise<Message> {
    // Get message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    if (message.type !== MessageType.MONEY) {
      throw new AppError('Not a money message', 400);
    }

    if (message.recipientId !== recipientId) {
      throw new AppError('Not authorized to claim this message', 403);
    }

    if (message.status !== MessageStatus.SENT) {
      throw new AppError('Message already claimed or expired', 400);
    }

    if (message.expiresAt && message.expiresAt < new Date()) {
      throw new AppError('Message has expired', 400);
    }

    // Process money claim
    return await prisma.$transaction(async (tx) => {
      // Update message status
      const updatedMessage = await tx.message.update({
        where: { id: messageId },
        data: { status: MessageStatus.CLAIMED },
      });

      // Add amount to recipient's wallet
      const amount = (message.metadata as any).amount;
      await tx.user.update({
        where: { id: recipientId },
        data: { walletBalance: { increment: amount } },
      });

      return updatedMessage;
    });
  }

  /**
   * Get user's messages
   */
  static async getUserMessages(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      type?: MessageType;
      status?: MessageStatus;
    } = {}
  ) {
    const { page = 1, limit = 20, type, status } = options;
    const skip = (page - 1) * limit;

    const where = {
      OR: [{ senderId: userId }, { recipientId: userId }],
      ...(type && { type }),
      ...(status && { status }),
      expiresAt: { gt: new Date() },
    };

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.message.count({ where }),
    ]);

    // Decrypt message contents
    const decryptedMessages = await Promise.all(
      messages.map(async (message) => ({
        ...message,
        content: await this.decryptMessage(message.content),
      }))
    );

    return {
      messages: decryptedMessages,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Delete a message
   */
  static async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    if (message.senderId !== userId && message.recipientId !== userId) {
      throw new AppError('Not authorized to delete this message', 403);
    }

    await prisma.message.delete({
      where: { id: messageId },
    });
  }

  /**
   * Encrypt message content
   */
  private static async encryptMessage(content: string): Promise<string> {
    try {
      const params = {
        KeyId: config.kms.keyId,
        Plaintext: Buffer.from(content),
      };

      const { CiphertextBlob } = await kms.encrypt(params).promise();
      return CiphertextBlob.toString('base64');
    } catch (error) {
      logger.error('Failed to encrypt message:', error);
      throw new AppError('Failed to encrypt message', 500);
    }
  }

  /**
   * Decrypt message content
   */
  private static async decryptMessage(encryptedContent: string): Promise<string> {
    try {
      const params = {
        CiphertextBlob: Buffer.from(encryptedContent, 'base64'),
      };

      const { Plaintext } = await kms.decrypt(params).promise();
      return Plaintext.toString();
    } catch (error) {
      logger.error('Failed to decrypt message:', error);
      throw new AppError('Failed to decrypt message', 500);
    }
  }
} 