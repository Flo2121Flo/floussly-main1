import { PrismaClient, QRCode, QRCodeType, QRCodeStatus } from '@prisma/client';
import { KMS } from 'aws-sdk';
import { config } from '../config';
import { AppError } from '../utils/error';
import { logger } from '../utils/logger';
import QRCodeLib from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const kms = new KMS({ region: config.aws.region });

export class QRCodeService {
  /**
   * Generate a new QR code
   */
  static async generateQRCode(data: {
    userId: string;
    type: QRCodeType;
    amount?: number;
    description?: string;
    metadata?: Record<string, any>;
    expiresAt?: Date;
  }): Promise<{ qrCode: QRCode; imageUrl: string }> {
    const { userId, type, amount, description, metadata, expiresAt } = data;

    // Validate amount for payment QR codes
    if (type === QRCodeType.PAYMENT && (!amount || amount <= 0)) {
      throw new AppError('Invalid amount for payment QR code', 400);
    }

    // Set default expiry if not provided (24 hours)
    const qrExpiry = expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Generate unique QR code data
    const qrData = {
      id: uuidv4(),
      userId,
      type,
      amount,
      description,
      metadata,
      timestamp: Date.now(),
    };

    // Encrypt QR code data
    const encryptedData = await this.encryptQRData(JSON.stringify(qrData));

    // Create QR code record
    const qrCode = await prisma.qRCode.create({
      data: {
        userId,
        type,
        data: encryptedData,
        amount,
        description,
        metadata,
        expiresAt: qrExpiry,
        status: QRCodeStatus.ACTIVE,
      },
    });

    // Generate QR code image
    const imageUrl = await this.generateQRImage(encryptedData);

    return { qrCode, imageUrl };
  }

  /**
   * Process QR code scan
   */
  static async processQRCodeScan(qrCodeId: string, scannerId: string): Promise<{
    type: QRCodeType;
    amount?: number;
    description?: string;
    metadata?: Record<string, any>;
  }> {
    // Get QR code
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: qrCodeId },
    });

    if (!qrCode) {
      throw new AppError('QR code not found', 404);
    }

    if (qrCode.status !== QRCodeStatus.ACTIVE) {
      throw new AppError('QR code is no longer active', 400);
    }

    if (qrCode.expiresAt && qrCode.expiresAt < new Date()) {
      throw new AppError('QR code has expired', 400);
    }

    // Decrypt QR code data
    const decryptedData = await this.decryptQRData(qrCode.data);
    const qrData = JSON.parse(decryptedData);

    // Update scan count
    await prisma.qRCode.update({
      where: { id: qrCodeId },
      data: { scanCount: { increment: 1 } },
    });

    return {
      type: qrCode.type,
      amount: qrCode.amount,
      description: qrCode.description,
      metadata: qrCode.metadata,
    };
  }

  /**
   * Process payment QR code
   */
  static async processPaymentQRCode(
    qrCodeId: string,
    scannerId: string
  ): Promise<{ transactionId: string }> {
    // Get QR code
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: qrCodeId },
    });

    if (!qrCode) {
      throw new AppError('QR code not found', 404);
    }

    if (qrCode.type !== QRCodeType.PAYMENT) {
      throw new AppError('Not a payment QR code', 400);
    }

    if (qrCode.status !== QRCodeStatus.ACTIVE) {
      throw new AppError('QR code is no longer active', 400);
    }

    if (qrCode.expiresAt && qrCode.expiresAt < new Date()) {
      throw new AppError('QR code has expired', 400);
    }

    // Check scanner's wallet balance
    const scanner = await prisma.user.findUnique({
      where: { id: scannerId },
      select: { walletBalance: true },
    });

    if (!scanner) {
      throw new AppError('Scanner not found', 404);
    }

    if (scanner.walletBalance < qrCode.amount!) {
      throw new AppError('Insufficient funds', 400);
    }

    // Process payment
    return await prisma.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          senderId: scannerId,
          recipientId: qrCode.userId,
          amount: qrCode.amount!,
          type: 'PAYMENT',
          description: qrCode.description,
          metadata: {
            qrCodeId,
            ...qrCode.metadata,
          },
          status: 'COMPLETED',
        },
      });

      // Update scanner's wallet balance
      await tx.user.update({
        where: { id: scannerId },
        data: { walletBalance: { decrement: qrCode.amount! } },
      });

      // Update recipient's wallet balance
      await tx.user.update({
        where: { id: qrCode.userId },
        data: { walletBalance: { increment: qrCode.amount! } },
      });

      // Deactivate QR code
      await tx.qRCode.update({
        where: { id: qrCodeId },
        data: { status: QRCodeStatus.USED },
      });

      return { transactionId: transaction.id };
    });
  }

  /**
   * Get user's QR codes
   */
  static async getUserQRCodes(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      type?: QRCodeType;
      status?: QRCodeStatus;
    } = {}
  ) {
    const { page = 1, limit = 20, type, status } = options;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(type && { type }),
      ...(status && { status }),
    };

    const [qrCodes, total] = await Promise.all([
      prisma.qRCode.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.qRCode.count({ where }),
    ]);

    return {
      qrCodes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Deactivate QR code
   */
  static async deactivateQRCode(qrCodeId: string, userId: string): Promise<void> {
    const qrCode = await prisma.qRCode.findUnique({
      where: { id: qrCodeId },
    });

    if (!qrCode) {
      throw new AppError('QR code not found', 404);
    }

    if (qrCode.userId !== userId) {
      throw new AppError('Not authorized to deactivate this QR code', 403);
    }

    await prisma.qRCode.update({
      where: { id: qrCodeId },
      data: { status: QRCodeStatus.DEACTIVATED },
    });
  }

  /**
   * Encrypt QR code data
   */
  private static async encryptQRData(data: string): Promise<string> {
    try {
      const params = {
        KeyId: config.kms.keyId,
        Plaintext: Buffer.from(data),
      };

      const { CiphertextBlob } = await kms.encrypt(params).promise();
      return CiphertextBlob.toString('base64');
    } catch (error) {
      logger.error('Failed to encrypt QR code data:', error);
      throw new AppError('Failed to encrypt QR code data', 500);
    }
  }

  /**
   * Decrypt QR code data
   */
  private static async decryptQRData(encryptedData: string): Promise<string> {
    try {
      const params = {
        CiphertextBlob: Buffer.from(encryptedData, 'base64'),
      };

      const { Plaintext } = await kms.decrypt(params).promise();
      return Plaintext.toString();
    } catch (error) {
      logger.error('Failed to decrypt QR code data:', error);
      throw new AppError('Failed to decrypt QR code data', 500);
    }
  }

  /**
   * Generate QR code image
   */
  private static async generateQRImage(data: string): Promise<string> {
    try {
      return await QRCodeLib.toDataURL(data, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 400,
      });
    } catch (error) {
      logger.error('Failed to generate QR code image:', error);
      throw new AppError('Failed to generate QR code image', 500);
    }
  }
} 