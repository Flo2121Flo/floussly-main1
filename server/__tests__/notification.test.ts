import { NotificationService } from '../services/notification';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { AppError } from '../utils/errors';

describe('Notification System', () => {
  let notificationService: NotificationService;
  let testUser: any;

  beforeEach(async () => {
    notificationService = new NotificationService();
    testUser = await prisma.user.create({
      data: {
        email: `test${Date.now()}@example.com`,
        phone: `+212${Math.floor(Math.random() * 1000000000)}`,
        password: 'hashedPassword',
      },
    });
  });

  afterEach(async () => {
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany({
      where: { id: testUser.id },
    });
  });

  describe('Notification Creation', () => {
    it('should create notification', async () => {
      const notification = await notificationService.create({
        userId: testUser.id,
        type: 'FRIEND_REQUEST',
        title: 'New Friend Request',
        message: 'You have a new friend request',
        data: { requestId: '123' },
      });

      expect(notification).toHaveProperty('id');
      expect(notification.type).toBe('FRIEND_REQUEST');
      expect(notification.isRead).toBe(false);
    });

    it('should create multiple notifications', async () => {
      const notifications = await notificationService.createMany([
        {
          userId: testUser.id,
          type: 'FRIEND_REQUEST',
          title: 'New Friend Request',
          message: 'You have a new friend request',
          data: { requestId: '123' },
        },
        {
          userId: testUser.id,
          type: 'TREASURE_FOUND',
          title: 'Treasure Found!',
          message: 'You found a treasure!',
          data: { treasureId: '456' },
        },
      ]);

      expect(notifications).toHaveLength(2);
    });
  });

  describe('Notification Retrieval', () => {
    beforeEach(async () => {
      await notificationService.createMany([
        {
          userId: testUser.id,
          type: 'FRIEND_REQUEST',
          title: 'New Friend Request',
          message: 'You have a new friend request',
          data: { requestId: '123' },
        },
        {
          userId: testUser.id,
          type: 'TREASURE_FOUND',
          title: 'Treasure Found!',
          message: 'You found a treasure!',
          data: { treasureId: '456' },
        },
      ]);
    });

    it('should get user notifications', async () => {
      const notifications = await notificationService.getUserNotifications(testUser.id);
      expect(notifications).toHaveLength(2);
    });

    it('should get unread notifications count', async () => {
      const count = await notificationService.getUnreadCount(testUser.id);
      expect(count).toBe(2);
    });
  });

  describe('Notification Management', () => {
    let notification: any;

    beforeEach(async () => {
      notification = await notificationService.create({
        userId: testUser.id,
        type: 'FRIEND_REQUEST',
        title: 'New Friend Request',
        message: 'You have a new friend request',
        data: { requestId: '123' },
      });
    });

    it('should mark notification as read', async () => {
      await notificationService.markAsRead(notification.id);
      const updated = await prisma.notification.findUnique({
        where: { id: notification.id },
      });
      expect(updated!.isRead).toBe(true);
    });

    it('should mark all notifications as read', async () => {
      await notificationService.markAllAsRead(testUser.id);
      const count = await notificationService.getUnreadCount(testUser.id);
      expect(count).toBe(0);
    });

    it('should delete notification', async () => {
      await notificationService.delete(notification.id);
      const exists = await prisma.notification.findUnique({
        where: { id: notification.id },
      });
      expect(exists).toBeNull();
    });
  });

  describe('Notification Preferences', () => {
    it('should update notification preferences', async () => {
      const preferences = {
        email: true,
        push: false,
        inApp: true,
      };

      await notificationService.updatePreferences(testUser.id, preferences);
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
        select: { notificationPreferences: true },
      });

      expect(user!.notificationPreferences).toEqual(preferences);
    });
  });
}); 