/**
 * Notification Service - Tests
 */

import { notificationService } from '../service';
import {
  NotificationSeverity,
  NotificationCategory,
  NotificationChannel,
  NotificationStatus,
} from '../types';

describe('NotificationService', () => {
  const testUserId = 'test-user-123';

  beforeEach(() => {
    // Clear any existing data
  });

  describe('createNotification', () => {
    it('should create notifications for multiple users', async () => {
      const request = {
        title: 'Test Notification',
        message: 'This is a test',
        severity: NotificationSeverity.INFO,
        category: NotificationCategory.SYSTEM,
        user_ids: [testUserId, 'user-2'],
        channels: [NotificationChannel.IN_APP],
      };

      const notifications = await notificationService.createNotification(request, 'admin');

      expect(notifications).toHaveLength(2);
      expect(notifications[0].title).toBe('Test Notification');
      expect(notifications[0].user_id).toBe(testUserId);
    });

    it('should filter notifications based on user preferences', async () => {
      // Update preferences to disable notifications
      await notificationService.updatePreferences(testUserId, {
        enabled: false,
      });

      const request = {
        title: 'Test Notification',
        message: 'This should be filtered',
        severity: NotificationSeverity.INFO,
        category: NotificationCategory.SYSTEM,
        user_ids: [testUserId],
      };

      const notifications = await notificationService.createNotification(request, 'admin');

      expect(notifications).toHaveLength(0);
    });
  });

  describe('getUserNotifications', () => {
    it('should get notifications for a specific user', async () => {
      const request = {
        title: 'User Notification',
        message: 'For specific user',
        severity: NotificationSeverity.WARNING,
        category: NotificationCategory.THREAT,
        user_ids: [testUserId],
      };

      await notificationService.createNotification(request, 'admin');

      const notifications = await notificationService.getUserNotifications(testUserId);

      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].user_id).toBe(testUserId);
    });

    it('should filter by unread status', async () => {
      const notifications = await notificationService.getUserNotifications(testUserId, {
        unread: true,
      });

      notifications.forEach((n) => {
        expect(n.read_at).toBeUndefined();
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const request = {
        title: 'Test',
        message: 'Test',
        severity: NotificationSeverity.INFO,
        category: NotificationCategory.SYSTEM,
        user_ids: [testUserId],
      };

      const [notification] = await notificationService.createNotification(request, 'admin');

      const updated = await notificationService.markAsRead(notification.id, testUserId);

      expect(updated.status).toBe(NotificationStatus.READ);
      expect(updated.read_at).toBeDefined();
    });

    it('should throw error for wrong user', async () => {
      const request = {
        title: 'Test',
        message: 'Test',
        severity: NotificationSeverity.INFO,
        category: NotificationCategory.SYSTEM,
        user_ids: [testUserId],
      };

      const [notification] = await notificationService.createNotification(request, 'admin');

      await expect(
        notificationService.markAsRead(notification.id, 'wrong-user')
      ).rejects.toThrow('Access denied');
    });
  });

  describe('getUserStats', () => {
    it('should return statistics for user', async () => {
      const stats = await notificationService.getUserStats(testUserId);

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('unread');
      expect(stats).toHaveProperty('by_severity');
      expect(stats).toHaveProperty('by_category');
      expect(stats).toHaveProperty('by_status');
    });
  });

  describe('Notification Rules', () => {
    it('should create notification rule', async () => {
      const rule = await notificationService.createRule(
        {
          name: 'High Severity Threats',
          enabled: true,
          event_type: 'threat.created',
          conditions: { severity: 'high' },
          notification_template: {
            title: 'New High Severity Threat',
            message: 'A high severity threat was detected',
            severity: NotificationSeverity.WARNING,
            category: NotificationCategory.THREAT,
            channels: [NotificationChannel.IN_APP],
          },
          target_users: [testUserId],
        },
        'admin'
      );

      expect(rule.id).toBeDefined();
      expect(rule.name).toBe('High Severity Threats');
    });

    it('should process events and trigger rules', async () => {
      await notificationService.createRule(
        {
          name: 'Test Rule',
          enabled: true,
          event_type: 'test.event',
          conditions: { type: 'test' },
          notification_template: {
            title: 'Test Event {{id}}',
            message: 'Event triggered',
            severity: NotificationSeverity.INFO,
            category: NotificationCategory.SYSTEM,
            channels: [NotificationChannel.IN_APP],
          },
          target_users: [testUserId],
        },
        'admin'
      );

      await notificationService.processEvent('test.event', { type: 'test', id: '123' });

      const notifications = await notificationService.getUserNotifications(testUserId);
      const triggeredNotification = notifications.find((n) => n.title.includes('123'));

      expect(triggeredNotification).toBeDefined();
    });
  });
});
