import { Pool } from 'pg';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';
import { config } from '../config/appConfig';
import { AuditService, AuditEventType } from './AuditService';
import { NotificationService } from './NotificationService';
import { v4 as uuidv4 } from 'uuid';

// Checklist item status enum
export enum ChecklistItemStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

// Checklist item type enum
export enum ChecklistItemType {
  ID_VERIFICATION = 'id_verification',
  ADDRESS_VERIFICATION = 'address_verification',
  BANK_ACCOUNT = 'bank_account',
  TAX_INFO = 'tax_info',
  EMPLOYMENT = 'employment',
  BUSINESS_INFO = 'business_info'
}

// Checklist item interface
export interface ChecklistItem {
  id: string;
  userId: string;
  type: ChecklistItemType;
  status: ChecklistItemStatus;
  title: string;
  description: string;
  required: boolean;
  order: number;
  data: any;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

// Onboarding progress interface
export interface OnboardingProgress {
  userId: string;
  totalItems: number;
  completedItems: number;
  requiredItems: number;
  completedRequiredItems: number;
  percentage: number;
  lastUpdated: Date;
}

// Onboarding service class
export class OnboardingService {
  private static instance: OnboardingService;
  private pool: Pool;
  private auditService: AuditService;
  private notificationService: NotificationService;
  private cacheTTL: number = 3600; // 1 hour

  private constructor() {
    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: config.NODE_ENV === 'production'
    });
    this.auditService = AuditService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService();
    }
    return OnboardingService.instance;
  }

  // Initialize onboarding checklist for user
  public async initializeChecklist(userId: string): Promise<ChecklistItem[]> {
    try {
      // Check if checklist already exists
      const existing = await this.getChecklist(userId);
      if (existing.length > 0) {
        return existing;
      }

      // Create default checklist items
      const items = await this.createDefaultChecklist(userId);

      // Log initialization
      await this.logChecklistInitialization(userId, items);

      return items;
    } catch (error) {
      logger.error('Failed to initialize checklist', { error: error.message });
      throw error;
    }
  }

  // Get user's checklist
  public async getChecklist(userId: string): Promise<ChecklistItem[]> {
    try {
      // Check cache first
      const cached = await redis.get(`checklist:${userId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      const result = await this.pool.query(
        `SELECT * FROM onboarding_checklist 
         WHERE user_id = $1
         ORDER BY "order" ASC`,
        [userId]
      );

      const items = result.rows;

      // Cache the result
      await redis.set(
        `checklist:${userId}`,
        JSON.stringify(items),
        'EX',
        this.cacheTTL
      );

      return items;
    } catch (error) {
      logger.error('Failed to get checklist', { error: error.message });
      throw error;
    }
  }

  // Update checklist item status
  public async updateItemStatus(
    userId: string,
    itemId: string,
    itemType: ChecklistItemType,
    oldStatus: ChecklistItemStatus,
    newStatus: ChecklistItemStatus
  ): Promise<void> {
    try {
      // Update item status in database
      // ... implementation ...

      // Log the status update
      await this.auditService.logEvent({
        eventType: AuditEventType.ONBOARDING_ITEM_UPDATED,
        userId,
        details: {
          itemId,
          itemType,
          oldStatus,
          newStatus
        },
        severity: 'medium'
      });
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to log item status update', { error: err.message });
      throw new Error(`Failed to update item status: ${err.message}`);
    }
  }

  // Get onboarding progress
  public async getProgress(userId: string): Promise<OnboardingProgress> {
    try {
      // Check cache first
      const cached = await redis.get(`progress:${userId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      const result = await this.pool.query(
        `SELECT 
          COUNT(*) as total_items,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_items,
          COUNT(CASE WHEN required THEN 1 END) as required_items,
          COUNT(CASE WHEN required AND status = 'completed' THEN 1 END) as completed_required_items
         FROM onboarding_checklist
         WHERE user_id = $1`,
        [userId]
      );

      const {
        total_items,
        completed_items,
        required_items,
        completed_required_items
      } = result.rows[0];

      const progress: OnboardingProgress = {
        userId,
        totalItems: parseInt(total_items),
        completedItems: parseInt(completed_items),
        requiredItems: parseInt(required_items),
        completedRequiredItems: parseInt(completed_required_items),
        percentage: Math.round((parseInt(completed_items) / parseInt(total_items)) * 100),
        lastUpdated: new Date()
      };

      // Cache the result
      await redis.set(
        `progress:${userId}`,
        JSON.stringify(progress),
        'EX',
        this.cacheTTL
      );

      return progress;
    } catch (error) {
      logger.error('Failed to get progress', { error: error.message });
      throw error;
    }
  }

  // Create default checklist items
  private async createDefaultChecklist(userId: string): Promise<ChecklistItem[]> {
    const items: ChecklistItem[] = [
      {
        id: uuidv4(),
        userId,
        type: ChecklistItemType.EMAIL_VERIFICATION,
        status: ChecklistItemStatus.PENDING,
        title: 'Verify Email Address',
        description: 'Please verify your email address to continue',
        required: true,
        order: 1,
        data: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        userId,
        type: ChecklistItemType.PHONE_VERIFICATION,
        status: ChecklistItemStatus.PENDING,
        title: 'Verify Phone Number',
        description: 'Add and verify your phone number for security',
        required: true,
        order: 2,
        data: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        userId,
        type: ChecklistItemType.KYC,
        status: ChecklistItemStatus.PENDING,
        title: 'Complete KYC',
        description: 'Complete your Know Your Customer verification',
        required: true,
        order: 3,
        data: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        userId,
        type: ChecklistItemType.IDENTITY_VERIFICATION,
        status: ChecklistItemStatus.PENDING,
        title: 'Verify Identity',
        description: 'Upload and verify your ID documents',
        required: true,
        order: 4,
        data: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        userId,
        type: ChecklistItemType.BANK_ACCOUNT,
        status: ChecklistItemStatus.PENDING,
        title: 'Add Bank Account',
        description: 'Link your bank account for transactions',
        required: true,
        order: 5,
        data: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        userId,
        type: ChecklistItemType.SECURITY_SETUP,
        status: ChecklistItemStatus.PENDING,
        title: 'Security Setup',
        description: 'Set up 2FA and security preferences',
        required: true,
        order: 6,
        data: {},
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        userId,
        type: ChecklistItemType.PREFERENCES,
        status: ChecklistItemStatus.PENDING,
        title: 'Set Preferences',
        description: 'Configure your account preferences',
        required: false,
        order: 7,
        data: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Insert items into database
    for (const item of items) {
      await this.pool.query(
        `INSERT INTO onboarding_checklist (
          id, user_id, type, status, title, description,
          required, "order", data, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          item.id,
          item.userId,
          item.type,
          item.status,
          item.title,
          item.description,
          item.required,
          item.order,
          item.data,
          item.createdAt,
          item.updatedAt
        ]
      );
    }

    return items;
  }

  // Check if all required items are completed
  private async checkCompletion(userId: string): Promise<void> {
    try {
      const progress = await this.getProgress(userId);

      if (
        progress.completedRequiredItems === progress.requiredItems &&
        progress.requiredItems > 0
      ) {
        // Update user's onboarding status
        await this.pool.query(
          `UPDATE users 
           SET onboarding_completed = true, updated_at = $1
           WHERE id = $2`,
          [new Date(), userId]
        );

        // Log completion
        await this.logOnboardingCompletion(userId);

        // Notify user
        await this.notificationService.sendNotification(userId, {
          type: 'onboarding_complete',
          title: 'Onboarding Complete',
          message: 'Congratulations! You have completed all required onboarding steps.',
          data: {
            progress
          }
        });
      }
    } catch (error) {
      logger.error('Failed to check completion', { error: error.message });
    }
  }

  // Log checklist initialization
  private async logChecklistInitialization(
    userId: string,
    items: ChecklistItem[]
  ): Promise<void> {
    try {
      await this.auditService.logEvent({
        eventType: AuditEventType.ONBOARDING_INITIALIZED,
        userId,
        details: {
          itemCount: items.length,
          requiredItems: items.filter(i => i.required).length
        }
      });
    } catch (error) {
      logger.error('Failed to log checklist initialization', { error: error.message });
    }
  }

  // Log onboarding completion
  private async logOnboardingCompletion(userId: string): Promise<void> {
    try {
      await this.auditService.logEvent({
        eventType: AuditEventType.ONBOARDING_COMPLETE,
        userId,
        details: {
          completedAt: new Date()
        },
        severity: 'low'
      });
    } catch (error) {
      logger.error('Failed to log onboarding completion', { error: error.message });
    }
  }
} 