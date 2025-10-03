/**
 * Notification Service
 * Business logic for notifications
 */

const { Notification, NotificationPreference } = require('../models/Notification');
const logger = require('../utils/logger');

class NotificationService {
  /**
   * Create a notification
   */
  async createNotification(data) {
    try {
      // Get user preferences
      const preferences = await this.getPreferences(data.user_id);

      // Check if notification type is enabled
      const typePreference = preferences.preferences[data.type];
      if (!typePreference || !typePreference.enabled) {
        logger.debug('Notification type disabled for user', { user_id: data.user_id, type: data.type });
        return null;
      }

      // Check do-not-disturb mode
      if (preferences.do_not_disturb && preferences.do_not_disturb.enabled) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;
        if (
          currentTime >= preferences.do_not_disturb.start_time
          && currentTime <= preferences.do_not_disturb.end_time
        ) {
          logger.debug('User in DND mode', { user_id: data.user_id });
          return null;
        }
      }

      const notification = new Notification({
        ...data,
        channels: typePreference.channels || ['in_app'],
      });

      await notification.save();

      logger.info('Notification created', { notification_id: notification.id, user_id: data.user_id });
      return notification;
    } catch (error) {
      logger.error('Failed to create notification', { error: error.message });
      // Don't throw - notification creation should not break the main operation
      return null;
    }
  }

  /**
   * Get notifications for user
   */
  async getNotifications(userId, options = {}) {
    try {
      const query = { user_id: userId };

      if (options.read !== undefined) {
        query.read = options.read;
      }

      if (options.type) {
        query.type = options.type;
      }

      const notifications = await Notification.find(query)
        .sort({ created_at: -1 })
        .limit(options.limit || 50);

      return notifications;
    } catch (error) {
      logger.error('Failed to get notifications', { error: error.message, user_id: userId });
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({ id: notificationId, user_id: userId });
      if (!notification) {
        throw new Error('Notification not found');
      }

      notification.read = true;
      notification.read_at = new Date();
      await notification.save();

      logger.info('Notification marked as read', { notification_id: notificationId });
      return notification;
    } catch (error) {
      logger.error('Failed to mark notification as read', {
        error: error.message,
        notification_id: notificationId,
      });
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { user_id: userId, read: false },
        { $set: { read: true, read_at: new Date() } },
      );

      logger.info('All notifications marked as read', { user_id: userId, count: result.modifiedCount });
      return result.modifiedCount;
    } catch (error) {
      logger.error('Failed to mark all notifications as read', { error: error.message, user_id: userId });
      throw error;
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(userId) {
    try {
      let preferences = await NotificationPreference.findOne({ user_id: userId });

      if (!preferences) {
        // Create default preferences
        preferences = new NotificationPreference({
          user_id: userId,
          preferences: {
            task_assigned: { enabled: true, channels: ['in_app', 'email'] },
            task_updated: { enabled: true, channels: ['in_app'] },
            task_completed: { enabled: true, channels: ['in_app'] },
            mention: { enabled: true, channels: ['in_app', 'email'] },
            comment: { enabled: true, channels: ['in_app'] },
            workspace_invite: { enabled: true, channels: ['in_app', 'email'] },
            message: { enabled: true, channels: ['in_app'] },
            activity: { enabled: false, channels: ['in_app'] },
          },
        });
        await preferences.save();
      }

      return preferences;
    } catch (error) {
      logger.error('Failed to get notification preferences', { error: error.message, user_id: userId });
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId, updates) {
    try {
      let preferences = await NotificationPreference.findOne({ user_id: userId });

      if (!preferences) {
        preferences = new NotificationPreference({ user_id: userId });
      }

      if (updates.preferences) {
        Object.assign(preferences.preferences, updates.preferences);
      }

      if (updates.do_not_disturb) {
        preferences.do_not_disturb = updates.do_not_disturb;
      }

      if (updates.digest) {
        preferences.digest = updates.digest;
      }

      await preferences.save();

      logger.info('Notification preferences updated', { user_id: userId });
      return preferences;
    } catch (error) {
      logger.error('Failed to update notification preferences', { error: error.message, user_id: userId });
      throw error;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({ user_id: userId, read: false });
      return count;
    } catch (error) {
      logger.error('Failed to get unread count', { error: error.message, user_id: userId });
      throw error;
    }
  }

  /**
   * Delete old notifications
   */
  async cleanOldNotifications(retentionDays = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await Notification.deleteMany({
        created_at: { $lt: cutoffDate },
        read: true,
      });

      logger.info('Old notifications cleaned', { deleted_count: result.deletedCount });
      return result.deletedCount;
    } catch (error) {
      logger.error('Failed to clean old notifications', { error: error.message });
      throw error;
    }
  }
}

module.exports = new NotificationService();
