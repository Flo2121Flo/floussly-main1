import { SNS } from 'aws-sdk';
import { logger } from '../utils/logger';
import { User } from '../models/User';
import { redis } from '../utils/redis';
import {
  sendEmail,
  sendTransactionNotification,
  sendSecurityAlert,
  sendMFACode
} from '../utils/email';
import { validatePhoneNumber } from '../utils/validators';
import { encryptSensitiveData } from '../utils/encryption';
import { RateLimiter } from '../utils/rateLimiter';

interface NotificationOptions {
  userId: string;
  type: 'TRANSACTION' | 'SECURITY' | 'SYSTEM' | 'MARKETING';
  title: string;
  message: string;
  data?: any;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  channels?: ('EMAIL' | 'SMS' | 'PUSH' | 'IN_APP')[];
}

export class NotificationService {
  private static instance: NotificationService;
  private readonly sns: SNS;
  private readonly rateLimiter: RateLimiter;
  private readonly NOTIFICATION_TTL = 60 * 60 * 24 * 7; // 7 days
  private readonly MAX_NOTIFICATIONS = 1000;

  private constructor() {
    this.sns = new SNS({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'eu-west-1'
    });
    this.rateLimiter = new RateLimiter({
      points: 100,
      duration: 60, // 100 notifications per minute
      blockDuration: 60 * 5 // Block for 5 minutes if limit exceeded
    });
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async sendNotification(options: NotificationOptions): Promise<void> {
    try {
      // Rate limiting check
      const canProceed = await this.rateLimiter.consume(options.userId);
      if (!canProceed) {
        throw new Error('Rate limit exceeded for notifications');
      }

      const user = await User.findById(options.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate and sanitize notification data
      const sanitizedData = this.sanitizeNotificationData(options.data);

      // Get user's preferred notification channels
      const channels = options.channels || await this.getUserChannels(user);

      // Send notifications through each channel
      await Promise.all(
        channels.map(channel => this.sendThroughChannel(channel, user, {
          ...options,
          data: sanitizedData
        }))
      );

      // Store notification in history with encryption
      await this.storeNotification({
        ...options,
        data: sanitizedData
      });

      // Log notification (without sensitive data)
      logger.info('Notification sent', {
        userId: options.userId,
        type: options.type,
        channels,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error sending notification', {
        error: error.message,
        userId: options.userId,
        type: options.type,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  private sanitizeNotificationData(data: any): any {
    if (!data) return {};
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    const sanitized = { ...data };
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        delete sanitized[key];
      }
    });

    return sanitized;
  }

  private async getUserChannels(user: any): Promise<('EMAIL' | 'SMS' | 'PUSH' | 'IN_APP')[]> {
    const channels: ('EMAIL' | 'SMS' | 'PUSH' | 'IN_APP')[] = ['IN_APP'];

    if (user.preferences?.notifications) {
      if (user.email) channels.push('EMAIL');
      if (user.phone) channels.push('SMS');
      if (user.deviceTokens?.length > 0) channels.push('PUSH');
    }

    return channels;
  }

  private async sendThroughChannel(
    channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP',
    user: any,
    options: NotificationOptions
  ): Promise<void> {
    switch (channel) {
      case 'EMAIL':
        await this.sendEmailNotification(user, options);
        break;
      case 'SMS':
        await this.sendSMSNotification(user, options);
        break;
      case 'PUSH':
        await this.sendPushNotification(user, options);
        break;
      case 'IN_APP':
        await this.sendInAppNotification(user, options);
        break;
    }
  }

  private async sendEmailNotification(user: any, options: NotificationOptions): Promise<void> {
    try {
      switch (options.type) {
        case 'TRANSACTION':
          await sendTransactionNotification(user.email, options.data);
          break;
        case 'SECURITY':
          await sendSecurityAlert(user.email, options.data);
          break;
        default:
          await sendEmail({
            to: user.email,
            subject: options.title,
            template: 'notification',
            data: {
              title: options.title,
              message: options.message,
              ...options.data
            }
          });
      }
    } catch (error) {
      logger.error('Error sending email notification', {
        error: error.message,
        userId: user.id,
        type: options.type
      });
    }
  }

  private async sendSMSNotification(user: any, options: NotificationOptions): Promise<void> {
    try {
      if (!validatePhoneNumber(user.phone)) {
        throw new Error('Invalid phone number');
      }

      const params = {
        Message: `${options.title}\n${options.message}`,
        PhoneNumber: user.phone,
        MessageAttributes: {
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: 'FLOUSSLY'
          },
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional'
          }
        }
      };

      const result = await this.sns.publish(params).promise();
      
      // Log successful SMS delivery
      logger.info('SMS notification sent', {
        userId: user.id,
        messageId: result.MessageId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error sending SMS notification', {
        error: error.message,
        userId: user.id,
        type: options.type
      });
      throw error;
    }
  }

  private async sendPushNotification(user: any, options: NotificationOptions): Promise<void> {
    try {
      const message = {
        default: options.message,
        GCM: JSON.stringify({
          data: {
            title: options.title,
            message: options.message,
            type: options.type,
            ...options.data
          }
        }),
        APNS: JSON.stringify({
          aps: {
            alert: {
              title: options.title,
              body: options.message
            },
            sound: 'default',
            badge: 1
          },
          data: {
            type: options.type,
            ...options.data
          }
        })
      };

      await Promise.all(
        user.deviceTokens.map(async (device: any) => {
          const params = {
            TargetArn: device.token,
            Message: JSON.stringify(message),
            MessageStructure: 'json'
          };

          await this.sns.publish(params).promise();
        })
      );
    } catch (error) {
      logger.error('Error sending push notification', {
        error: error.message,
        userId: user.id,
        type: options.type
      });
    }
  }

  private async sendInAppNotification(user: any, options: NotificationOptions): Promise<void> {
    try {
      const notification = {
        userId: user.id,
        type: options.type,
        title: options.title,
        message: options.message,
        data: options.data,
        priority: options.priority || 'LOW',
        read: false,
        createdAt: new Date()
      };

      // Store in Redis for real-time delivery
      await redis.lpush(`notifications:${user.id}`, JSON.stringify(notification));
      await redis.ltrim(`notifications:${user.id}`, 0, 99); // Keep last 100 notifications
    } catch (error) {
      logger.error('Error sending in-app notification', {
        error: error.message,
        userId: user.id,
        type: options.type
      });
    }
  }

  private async storeNotification(options: NotificationOptions): Promise<void> {
    try {
      const notification = {
        id: crypto.randomUUID(),
        userId: options.userId,
        type: options.type,
        title: options.title,
        message: options.message,
        data: options.data,
        priority: options.priority || 'LOW',
        createdAt: new Date()
      };

      // Encrypt sensitive data
      const encryptedData = await encryptSensitiveData(notification.data);
      notification.data = encryptedData;

      // Store in Redis with TTL
      const key = `notification_history:${options.userId}`;
      await redis.lpush(key, JSON.stringify(notification));
      await redis.ltrim(key, 0, this.MAX_NOTIFICATIONS - 1);
      await redis.expire(key, this.NOTIFICATION_TTL);
    } catch (error) {
      logger.error('Error storing notification', {
        error: error.message,
        userId: options.userId
      });
      throw error;
    }
  }

  async getNotifications(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const notifications = await redis.lrange(`notifications:${userId}`, 0, limit - 1);
      return notifications.map(n => JSON.parse(n));
    } catch (error) {
      logger.error('Error getting notifications', {
        error: error.message,
        userId
      });
      return [];
    }
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      const notifications = await redis.lrange(`notifications:${userId}`, 0, -1);
      const updatedNotifications = notifications.map(n => {
        const notification = JSON.parse(n);
        if (notification.id === notificationId) {
          notification.read = true;
        }
        return JSON.stringify(notification);
      });

      await redis.del(`notifications:${userId}`);
      if (updatedNotifications.length > 0) {
        await redis.rpush(`notifications:${userId}`, ...updatedNotifications);
      }
    } catch (error) {
      logger.error('Error marking notification as read', {
        error: error.message,
        userId,
        notificationId
      });
    }
  }

  async getNotificationHistory(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const notifications = await redis.lrange(`notification_history:${userId}`, 0, limit - 1);
      return notifications.map(n => JSON.parse(n));
    } catch (error) {
      logger.error('Error getting notification history', {
        error: error.message,
        userId
      });
      return [];
    }
  }
}

export default NotificationService; 