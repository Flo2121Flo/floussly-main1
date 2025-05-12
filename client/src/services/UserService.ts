import { v4 as uuidv4 } from 'uuid';
import { UserProfile, UserWallet, UserDevice, KYCDocument, AuditLog, KYCStatus, KYCLevel } from '../types/user';
import { Language, Currency, DeviceType } from '../types/common';
import { generateQRCode } from '../utils/qr';
import { uploadToS3 } from '../utils/storage';
import { logger } from '../utils/logger';
import { redis } from '../lib/redis';
import { db } from '../lib/db';

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async createUser(
    username: string,
    phone: string,
    email: string,
    language: Language,
    deviceFingerprint: string
  ): Promise<UserProfile> {
    const userId = uuidv4();
    const now = new Date();

    // Generate QR code
    const qrCode = await generateQRCode({
      userId,
      displayName: username,
    });
    const qrCodeUrl = await uploadToS3(qrCode, `qr/${userId}.png`);

    // Create user profile
    const user: UserProfile = {
      userId,
      username,
      phone,
      email,
      registrationDate: now,
      language,
      deviceFingerprint,
      defaultCurrency: Currency.MAD,
      qrCodeUrl,
      kycStatus: KYCStatus.UNVERIFIED,
      kycLevel: KYCLevel.LEVEL_0,
      riskScore: 0,
      isActive: true,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    };

    // Create wallet
    const wallet = await this.createWallet(userId);

    // Store user data
    await db.users.create(user);
    await this.createAuditLog({
      userId,
      actionType: 'REGISTER',
      details: { username, phone, email },
    });

    // Cache user data
    await this.cacheUserData(userId, user);

    return user;
  }

  async createWallet(userId: string): Promise<UserWallet> {
    const walletId = uuidv4();
    const now = new Date();

    const wallet: UserWallet = {
      walletId,
      userId,
      balance: 0,
      currency: Currency.MAD,
      status: 'active',
      kycLevelRequired: KYCLevel.LEVEL_0,
      createdAt: now,
      updatedAt: now,
    };

    await db.wallets.create(wallet);
    await this.createAuditLog({
      userId,
      actionType: 'WALLET_CREATE',
      details: { walletId },
    });

    return wallet;
  }

  async registerDevice(
    userId: string,
    deviceName: string,
    deviceType: DeviceType
  ): Promise<UserDevice> {
    const deviceId = uuidv4();
    const now = new Date();

    const device: UserDevice = {
      deviceId,
      userId,
      deviceName,
      deviceType,
      lastActiveAt: now,
      isTrusted: false,
      createdAt: now,
    };

    await db.devices.create(device);
    await this.createAuditLog({
      userId,
      actionType: 'DEVICE_ADD',
      details: { deviceId, deviceName, deviceType },
    });

    return device;
  }

  async uploadKYCDocument(
    userId: string,
    documentType: string,
    file: File
  ): Promise<KYCDocument> {
    const documentId = uuidv4();
    const now = new Date();

    // Upload document to S3
    const fileUrl = await uploadToS3(file, `kyc/${userId}/${documentId}`);

    const document: KYCDocument = {
      documentId,
      userId,
      documentType,
      fileName: file.name,
      fileUrl,
      status: 'pending',
      uploadedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await db.kycDocuments.create(document);
    await this.createAuditLog({
      userId,
      actionType: 'KYC_UPLOAD',
      details: { documentId, documentType },
    });

    return document;
  }

  private async createAuditLog(log: Omit<AuditLog, 'logId'>): Promise<void> {
    const logId = uuidv4();
    const auditLog: AuditLog = {
      logId,
      ...log,
    };

    await db.auditLogs.create(auditLog);
    logger.info('Audit log created', { logId, ...log });
  }

  private async cacheUserData(userId: string, user: UserProfile): Promise<void> {
    const key = `user:${userId}`;
    await redis.set(key, JSON.stringify(user), {
      ex: 3600, // 1 hour
    });
  }

  async getUserById(userId: string): Promise<UserProfile | null> {
    // Try cache first
    const cached = await redis.get(`user:${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fallback to database
    const user = await db.users.findById(userId);
    if (user) {
      await this.cacheUserData(userId, user);
    }

    return user;
  }

  async updateUserLanguage(userId: string, language: Language): Promise<void> {
    await db.users.update(userId, { language });
    await this.createAuditLog({
      userId,
      actionType: 'LANGUAGE_CHANGE',
      details: { language },
    });

    // Update cache
    const user = await this.getUserById(userId);
    if (user) {
      await this.cacheUserData(userId, user);
    }
  }

  async updateKYCStatus(
    userId: string,
    status: KYCStatus,
    level: KYCLevel
  ): Promise<void> {
    await db.users.update(userId, { kycStatus: status, kycLevel: level });
    await this.createAuditLog({
      userId,
      actionType: 'KYC_VERIFY',
      details: { status, level },
    });

    // Update cache
    const user = await this.getUserById(userId);
    if (user) {
      await this.cacheUserData(userId, user);
    }
  }
} 