import { logger } from '../utils/logger';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { Group } from '../models/Group';

export class GDPR {
  private readonly DATA_RETENTION_PERIOD = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

  async handleDataSubjectRequest(userId: string, requestType: 'access' | 'deletion' | 'rectification'): Promise<any> {
    try {
      switch (requestType) {
        case 'access':
          return await this.handleDataAccessRequest(userId);
        case 'deletion':
          return await this.handleDataDeletionRequest(userId);
        case 'rectification':
          return await this.handleDataRectificationRequest(userId);
        default:
          throw new Error('Invalid request type');
      }
    } catch (error) {
      logger.error('GDPR request handling error:', error);
      throw error;
    }
  }

  private async handleDataAccessRequest(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const transactions = await Transaction.find({ userId });
    const groups = await Group.find({ members: userId });

    return {
      personalData: {
        profile: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          kycStatus: user.kycStatus,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        },
        preferences: user.preferences,
        settings: user.settings
      },
      transactions: transactions.map(t => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        timestamp: t.timestamp,
        description: t.description
      })),
      groups: groups.map(g => ({
        id: g._id,
        name: g.name,
        role: g.members.find(m => m.userId.toString() === userId)?.role,
        joinedAt: g.members.find(m => m.userId.toString() === userId)?.joinedAt
      }))
    };
  }

  private async handleDataDeletionRequest(userId: string): Promise<void> {
    // Anonymize user data
    await User.findByIdAndUpdate(userId, {
      $set: {
        name: 'DELETED_USER',
        email: `deleted_${userId}@deleted.com`,
        phone: null,
        address: null,
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    // Anonymize transactions
    await Transaction.updateMany(
      { userId },
      {
        $set: {
          description: 'DELETED_TRANSACTION',
          metadata: { deleted: true, deletedAt: new Date() }
        }
      }
    );

    // Remove user from groups
    await Group.updateMany(
      { members: userId },
      {
        $pull: { members: { userId } }
      }
    );

    logger.info(`User ${userId} data deleted in compliance with GDPR`);
  }

  private async handleDataRectificationRequest(userId: string): Promise<void> {
    // Implement data rectification logic
    // This would typically involve updating incorrect data
    logger.info(`Data rectification request received for user ${userId}`);
  }

  async checkDataRetention(): Promise<void> {
    const cutoffDate = new Date(Date.now() - this.DATA_RETENTION_PERIOD);

    // Find and handle expired data
    const expiredUsers = await User.find({
      isDeleted: true,
      deletedAt: { $lt: cutoffDate }
    });

    for (const user of expiredUsers) {
      await this.permanentlyDeleteUserData(user._id);
    }

    logger.info(`Data retention check completed. ${expiredUsers.length} expired records found.`);
  }

  private async permanentlyDeleteUserData(userId: string): Promise<void> {
    // Permanently delete user data
    await User.findByIdAndDelete(userId);
    await Transaction.deleteMany({ userId });
    
    // Remove user from groups
    await Group.updateMany(
      { members: userId },
      {
        $pull: { members: { userId } }
      }
    );

    logger.info(`User ${userId} data permanently deleted after retention period`);
  }

  async generatePrivacyPolicy(): Promise<string> {
    return `
# Privacy Policy

## 1. Data Collection
We collect the following personal data:
- Name
- Email address
- Phone number
- Address
- KYC documents
- Transaction history
- Group membership information

## 2. Data Usage
Your data is used for:
- Account management
- Transaction processing
- Group savings management
- KYC verification
- Customer support

## 3. Data Protection
We implement the following security measures:
- Encryption at rest and in transit
- Regular security audits
- Access controls
- Data minimization

## 4. Data Retention
- Active accounts: Data retained while account is active
- Deleted accounts: Data anonymized for 1 year
- KYC documents: Retained for 5 years as per regulatory requirements

## 5. Your Rights
You have the right to:
- Access your data
- Request data deletion
- Request data rectification
- Withdraw consent
- Data portability

## 6. Contact
For privacy-related inquiries, contact:
- Email: privacy@floussly.com
- Phone: +1234567890
    `;
  }

  async generateDataProcessingAgreement(): Promise<string> {
    return `
# Data Processing Agreement

## 1. Purpose
This agreement outlines how we process your personal data in compliance with GDPR.

## 2. Data Controller
Floussly acts as the data controller for your personal information.

## 3. Data Processing
We process your data for:
- Account management
- Transaction processing
- Group savings
- KYC verification
- Customer support

## 4. Security Measures
We implement:
- Encryption
- Access controls
- Regular audits
- Staff training

## 5. Data Transfers
- All data transfers are encrypted
- Third-party processors are GDPR compliant
- No data transfers outside EEA without adequate safeguards

## 6. Breach Notification
We will notify you of any data breaches within 72 hours of discovery.

## 7. Compliance
We regularly review and update our practices to ensure GDPR compliance.
    `;
  }
} 