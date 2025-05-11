import { SNS } from 'aws-sdk';
import twilio from 'twilio';
import admin from 'firebase-admin';
import { config } from '../config';
import logger from './logging';

// Initialize services
const sns = new SNS({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

const twilioClient = twilio(
  config.twilio.accountSid,
  config.twilio.authToken
);

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(config.firebase.serviceAccount),
  });
}

// Notification types
export enum NotificationType {
  TRANSACTION = 'TRANSACTION',
  SECURITY = 'SECURITY',
  SYSTEM = 'SYSTEM',
  MARKETING = 'MARKETING',
}

// Notification priority
export enum NotificationPriority {
  HIGH = 'HIGH',
  NORMAL = 'NORMAL',
  LOW = 'LOW',
}

// Notification channel
export enum NotificationChannel {
  PUSH = 'PUSH',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

// Notification interface
interface Notification {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
}

// Notifications service class
export class NotificationsService {
  private static instance: NotificationsService;
  
  private constructor() {}
  
  public static getInstance(): NotificationsService {
    if (!NotificationsService.instance) {
      NotificationsService.instance = new NotificationsService();
    }
    return NotificationsService.instance;
  }
  
  // Send notification
  public async send(notification: Notification): Promise<void> {
    const channels = notification.channels || [NotificationChannel.PUSH];
    
    try {
      await Promise.all(
        channels.map(channel => this.sendToChannel(notification, channel))
      );
      
      logger.info('Notification sent successfully', {
        userId: notification.userId,
        type: notification.type,
        channels,
      });
    } catch (error) {
      logger.error('Failed to send notification', {
        error,
        notification,
      });
      throw error;
    }
  }
  
  // Send to specific channel
  private async sendToChannel(
    notification: Notification,
    channel: NotificationChannel
  ): Promise<void> {
    switch (channel) {
      case NotificationChannel.PUSH:
        await this.sendPushNotification(notification);
        break;
      case NotificationChannel.SMS:
        await this.sendSMS(notification);
        break;
      case NotificationChannel.EMAIL:
        await this.sendEmail(notification);
        break;
      default:
        throw new Error(`Unsupported notification channel: ${channel}`);
    }
  }
  
  // Send push notification
  private async sendPushNotification(notification: Notification): Promise<void> {
    try {
      // Get user's FCM tokens
      const userTokens = await this.getUserFCMTokens(notification.userId);
      
      if (!userTokens.length) {
        logger.warn('No FCM tokens found for user', {
          userId: notification.userId,
        });
        return;
      }
      
      // Prepare message
      const message: admin.messaging.MulticastMessage = {
        tokens: userTokens,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data,
        android: {
          priority: notification.priority === NotificationPriority.HIGH ? 'high' : 'normal',
        },
        apns: {
          payload: {
            aps: {
              sound: notification.priority === NotificationPriority.HIGH ? 'default' : undefined,
            },
          },
        },
      };
      
      // Send message
      const response = await admin.messaging().sendMulticast(message);
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = response.responses
          .map((resp, idx) => resp.success ? null : userTokens[idx])
          .filter(Boolean);
        
        // Remove failed tokens
        await this.removeFailedTokens(notification.userId, failedTokens);
      }
    } catch (error) {
      logger.error('Failed to send push notification', {
        error,
        userId: notification.userId,
      });
      throw error;
    }
  }
  
  // Send SMS
  private async sendSMS(notification: Notification): Promise<void> {
    try {
      // Get user's phone number
      const phoneNumber = await this.getUserPhoneNumber(notification.userId);
      
      if (!phoneNumber) {
        logger.warn('No phone number found for user', {
          userId: notification.userId,
        });
        return;
      }
      
      // Send SMS
      await twilioClient.messages.create({
        body: `${notification.title}\n${notification.body}`,
        to: phoneNumber,
        from: config.twilio.phoneNumber,
      });
    } catch (error) {
      logger.error('Failed to send SMS', {
        error,
        userId: notification.userId,
      });
      throw error;
    }
  }
  
  // Send email
  private async sendEmail(notification: Notification): Promise<void> {
    try {
      // Get user's email
      const email = await this.getUserEmail(notification.userId);
      
      if (!email) {
        logger.warn('No email found for user', {
          userId: notification.userId,
        });
        return;
      }
      
      // Prepare email message
      const message = {
        Subject: {
          Data: notification.title,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: notification.body,
            Charset: 'UTF-8',
          },
          Html: {
            Data: this.generateEmailHtml(notification),
            Charset: 'UTF-8',
          },
        },
      };
      
      // Send email via SNS
      await sns.publish({
        TopicArn: config.aws.snsEmailTopic,
        Message: JSON.stringify({
          email,
          message,
        }),
      }).promise();
    } catch (error) {
      logger.error('Failed to send email', {
        error,
        userId: notification.userId,
      });
      throw error;
    }
  }
  
  // Get user's FCM tokens
  private async getUserFCMTokens(userId: string): Promise<string[]> {
    // TODO: Implement database query to get user's FCM tokens
    return [];
  }
  
  // Get user's phone number
  private async getUserPhoneNumber(userId: string): Promise<string | null> {
    // TODO: Implement database query to get user's phone number
    return null;
  }
  
  // Get user's email
  private async getUserEmail(userId: string): Promise<string | null> {
    // TODO: Implement database query to get user's email
    return null;
  }
  
  // Remove failed FCM tokens
  private async removeFailedTokens(
    userId: string,
    failedTokens: string[]
  ): Promise<void> {
    // TODO: Implement database query to remove failed tokens
  }
  
  // Generate email HTML
  private generateEmailHtml(notification: Notification): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${notification.title}</h1>
            </div>
            <div class="content">
              <p>${notification.body}</p>
              ${notification.data ? this.renderEmailData(notification.data) : ''}
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Floussly. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
  
  // Render email data
  private renderEmailData(data: Record<string, any>): string {
    return Object.entries(data)
      .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
      .join('');
  }
}

// Export singleton instance
export const notifications = NotificationsService.getInstance(); 