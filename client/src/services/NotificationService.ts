import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationType } from '../types/common';
import { logger } from '../utils/logger';
import { db } from '../lib/db';
import { redis } from '../lib/redis';
import { pushNotification } from '../lib/push';

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async sendNotification(notification: Omit<Notification, 'notificationId' | 'createdAt'>): Promise<Notification> {
    const notificationId = uuidv4();
    const now = new Date();

    const newNotification: Notification = {
      ...notification,
      notificationId,
      createdAt: now,
    };

    try {
      // Store notification in database
      await db.notifications.create(newNotification);

      // Cache notification for quick access
      await this.cacheNotification(newNotification);

      // Send push notification if user has devices
      await this.sendPushNotification(newNotification);

      // Log notification
      logger.info('Notification sent', {
        notificationId,
        userId: notification.userId,
        type: notification.type,
      });

      return newNotification;
    } catch (error) {
      logger.error('Failed to send notification', {
        error,
        notificationId,
        userId: notification.userId,
      });
      throw error;
    }
  }

  async getUserNotifications(userId: string, page: number = 1, pageSize: number = 20): Promise<{
    notifications: Notification[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // Try to get from cache first
      const cachedNotifications = await this.getCachedNotifications(userId, page, pageSize);
      if (cachedNotifications) {
        return cachedNotifications;
      }

      // Get from database if not in cache
      const notifications = await db.notifications.find({
        userId,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      const total = await db.notifications.count({ userId });
      const hasMore = total > page * pageSize;

      const result = {
        notifications,
        total,
        hasMore,
      };

      // Cache the result
      await this.cacheNotifications(userId, page, pageSize, result);

      return result;
    } catch (error) {
      logger.error('Failed to get user notifications', {
        error,
        userId,
        page,
        pageSize,
      });
      throw error;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await db.notifications.update(notificationId, { isRead: true });

      // Update cache
      const notification = await db.notifications.findById(notificationId);
      if (notification) {
        await this.cacheNotification(notification);
      }

      logger.info('Notification marked as read', { notificationId });
    } catch (error) {
      logger.error('Failed to mark notification as read', {
        error,
        notificationId,
      });
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await db.notifications.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );

      // Clear cache for this user
      await this.clearUserNotificationCache(userId);

      logger.info('All notifications marked as read', { userId });
    } catch (error) {
      logger.error('Failed to mark all notifications as read', {
        error,
        userId,
      });
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await db.notifications.delete(notificationId);

      // Remove from cache
      await this.removeNotificationFromCache(notificationId);

      logger.info('Notification deleted', { notificationId });
    } catch (error) {
      logger.error('Failed to delete notification', {
        error,
        notificationId,
      });
      throw error;
    }
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    try {
      // Get user's devices
      const devices = await db.devices.findByUserId(notification.userId);

      if (devices.length === 0) {
        return;
      }

      // Send push notification to all devices
      await Promise.all(
        devices.map(device =>
          pushNotification.send({
            token: device.pushToken,
            title: notification.title,
            body: notification.message,
            data: notification.data,
          })
        )
      );

      logger.info('Push notification sent', {
        notificationId: notification.notificationId,
        deviceCount: devices.length,
      });
    } catch (error) {
      logger.error('Failed to send push notification', {
        error,
        notificationId: notification.notificationId,
      });
      // Don't throw error to prevent notification failure
    }
  }

  private async cacheNotification(notification: Notification): Promise<void> {
    const key = `notification:${notification.notificationId}`;
    await redis.set(key, JSON.stringify(notification), 'EX', 3600); // Cache for 1 hour
  }

  private async getCachedNotification(notificationId: string): Promise<Notification | null> {
    const key = `notification:${notificationId}`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  private async cacheNotifications(
    userId: string,
    page: number,
    pageSize: number,
    data: { notifications: Notification[]; total: number; hasMore: boolean }
  ): Promise<void> {
    const key = `notifications:${userId}:${page}:${pageSize}`;
    await redis.set(key, JSON.stringify(data), 'EX', 300); // Cache for 5 minutes
  }

  private async getCachedNotifications(
    userId: string,
    page: number,
    pageSize: number
  ): Promise<{ notifications: Notification[]; total: number; hasMore: boolean } | null> {
    const key = `notifications:${userId}:${page}:${pageSize}`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  private async clearUserNotificationCache(userId: string): Promise<void> {
    const pattern = `notifications:${userId}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  private async removeNotificationFromCache(notificationId: string): Promise<void> {
    const key = `notification:${notificationId}`;
    await redis.del(key);
  }
} 