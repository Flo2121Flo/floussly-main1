import { User } from '../models/User';
import { logger } from '../utils/logger';
import { redis } from '../utils/redis';
import { NotificationService } from './NotificationService';
import { validateMoroccanID, validateFileType, validateFileSize } from '../utils/validators';
import { encryptSensitiveData } from '../utils/encryption';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

interface KYCDocument {
  type: 'ID_CARD' | 'PASSPORT' | 'DRIVERS_LICENSE';
  number: string;
  issueDate: Date;
  expiryDate: Date;
  frontImage: string;
  backImage?: string;
}

interface KYCVerificationResult {
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  reason?: string;
  riskScore?: number;
}

export class KYCService {
  private static instance: KYCService;
  private readonly s3: S3;
  private readonly notificationService: NotificationService;
  private readonly ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  private constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'eu-west-1'
    });
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): KYCService {
    if (!KYCService.instance) {
      KYCService.instance = new KYCService();
    }
    return KYCService.instance;
  }

  async submitKYC(userId: string, document: KYCDocument): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate document
      if (!validateMoroccanID(document.number)) {
        throw new Error('Invalid document number');
      }

      // Validate images
      if (!validateFileType(document.frontImage, this.ALLOWED_FILE_TYPES)) {
        throw new Error('Invalid front image format');
      }
      if (document.backImage && !validateFileType(document.backImage, this.ALLOWED_FILE_TYPES)) {
        throw new Error('Invalid back image format');
      }

      // Upload images to S3
      const frontImageKey = await this.uploadDocument(userId, document.frontImage, 'front');
      const backImageKey = document.backImage ? 
        await this.uploadDocument(userId, document.backImage, 'back') : 
        undefined;

      // Encrypt sensitive data
      const encryptedDocument = await encryptSensitiveData({
        ...document,
        frontImage: frontImageKey,
        backImage: backImageKey
      });

      // Update user's KYC status
      user.kycStatus = 'PENDING';
      user.kycDocuments = encryptedDocument;
      await user.save();

      // Store verification request
      const verificationId = uuidv4();
      await redis.setex(
        `kyc:${userId}:${verificationId}`,
        24 * 60 * 60, // 24 hours
        JSON.stringify({
          status: 'PENDING',
          document: encryptedDocument,
          submittedAt: new Date()
        })
      );

      // Notify user
      await this.notificationService.sendNotification({
        userId,
        type: 'SYSTEM',
        title: 'KYC Submission Received',
        message: 'Your KYC documents have been received and are being reviewed',
        channels: ['EMAIL', 'IN_APP']
      });

      logger.info('KYC submission received', {
        userId,
        documentType: document.type,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('KYC submission failed', {
        error: error.message,
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async verifyKYC(userId: string, verificationId: string): Promise<KYCVerificationResult> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get verification request
      const key = `kyc:${userId}:${verificationId}`;
      const verificationData = await redis.get(key);
      if (!verificationData) {
        throw new Error('Verification request not found');
      }

      // Perform AML checks
      const amlResult = await this.performAMLCheck(user);
      
      // Perform document verification
      const documentResult = await this.verifyDocument(user.kycDocuments);

      // Calculate risk score
      const riskScore = this.calculateRiskScore(amlResult, documentResult);

      // Determine verification status
      const status = this.determineVerificationStatus(riskScore);

      // Update user's KYC status
      user.kycStatus = status;
      if (status === 'APPROVED') {
        user.tier = 'VERIFIED';
      }
      await user.save();

      // Store verification result
      await redis.setex(
        key,
        30 * 24 * 60 * 60, // 30 days
        JSON.stringify({
          status,
          riskScore,
          verifiedAt: new Date()
        })
      );

      // Notify user
      await this.notificationService.sendNotification({
        userId,
        type: 'SYSTEM',
        title: 'KYC Verification Update',
        message: `Your KYC verification has been ${status.toLowerCase()}`,
        channels: ['EMAIL', 'IN_APP']
      });

      logger.info('KYC verification completed', {
        userId,
        status,
        riskScore,
        timestamp: new Date().toISOString()
      });

      return {
        status,
        riskScore
      };
    } catch (error) {
      logger.error('KYC verification failed', {
        error: error.message,
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  private async uploadDocument(userId: string, base64Image: string, type: string): Promise<string> {
    try {
      const buffer = Buffer.from(base64Image.split(',')[1], 'base64');
      
      if (!validateFileSize(buffer, this.MAX_FILE_SIZE)) {
        throw new Error('File size exceeds limit');
      }

      const key = `kyc/${userId}/${type}-${Date.now()}.jpg`;
      
      await this.s3.putObject({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: 'image/jpeg',
        ServerSideEncryption: 'AES256'
      }).promise();

      return key;
    } catch (error) {
      logger.error('Document upload failed', {
        error: error.message,
        userId,
        type,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  private async performAMLCheck(user: any): Promise<any> {
    // Implement actual AML checks here
    // This could include:
    // - Sanctions list screening
    // - PEP (Politically Exposed Person) screening
    // - Adverse media screening
    // - Risk scoring based on country, occupation, etc.
    return {
      sanctionsMatch: false,
      pepMatch: false,
      adverseMediaMatch: false,
      riskScore: 0
    };
  }

  private async verifyDocument(document: any): Promise<any> {
    // Implement actual document verification here
    // This could include:
    // - OCR text extraction
    // - Face matching
    // - Document authenticity checks
    // - Expiry date validation
    return {
      authenticityScore: 0.9,
      faceMatchScore: 0.8,
      expiryValid: true
    };
  }

  private calculateRiskScore(amlResult: any, documentResult: any): number {
    // Implement risk scoring logic here
    // This should consider:
    // - AML check results
    // - Document verification results
    // - User's country risk
    // - Transaction history
    return 0.5; // Placeholder
  }

  private determineVerificationStatus(riskScore: number): 'APPROVED' | 'REJECTED' | 'PENDING' {
    if (riskScore < 0.3) return 'APPROVED';
    if (riskScore > 0.7) return 'REJECTED';
    return 'PENDING';
  }

  async getKYCStatus(userId: string): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        status: user.kycStatus,
        tier: user.tier,
        lastUpdated: user.updatedAt
      };
    } catch (error) {
      logger.error('Failed to get KYC status', {
        error: error.message,
        userId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
}

export default KYCService; 