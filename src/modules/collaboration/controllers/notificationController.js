/**
 * Notification Controller
 * HTTP handlers for notification operations
 */

const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

class NotificationController {
  async getNotifications(req, res) {
    try {
      const userId = req.user?.id || req.query.user_id || 'test-user';
      let readFilter;
      if (req.query.read === 'true') {
        readFilter = true;
      } else if (req.query.read === 'false') {
        readFilter = false;
      }
      const options = {
        read: readFilter,
        type: req.query.type,
        limit: parseInt(req.query.limit, 10) || 50,
      };
      const notifications = await notificationService.getNotifications(userId, options);
      res.json({ success: true, data: notifications, count: notifications.length });
    } catch (error) {
      logger.error('Get notifications failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async markAsRead(req, res) {
    try {
      const userId = req.user?.id || req.body.user_id || 'test-user';
      const notification = await notificationService.markAsRead(req.params.id, userId);
      res.json({ success: true, data: notification });
    } catch (error) {
      logger.error('Mark as read failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const userId = req.user?.id || req.body.user_id || 'test-user';
      const count = await notificationService.markAllAsRead(userId);
      res.json({ success: true, message: `${count} notifications marked as read` });
    } catch (error) {
      logger.error('Mark all as read failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getPreferences(req, res) {
    try {
      const userId = req.user?.id || req.params.userId || 'test-user';
      const preferences = await notificationService.getPreferences(userId);
      res.json({ success: true, data: preferences });
    } catch (error) {
      logger.error('Get preferences failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updatePreferences(req, res) {
    try {
      const userId = req.user?.id || req.params.userId || 'test-user';
      const preferences = await notificationService.updatePreferences(userId, req.body);
      res.json({ success: true, data: preferences });
    } catch (error) {
      logger.error('Update preferences failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const userId = req.user?.id || req.query.user_id || 'test-user';
      const count = await notificationService.getUnreadCount(userId);
      res.json({ success: true, data: { unread_count: count } });
    } catch (error) {
      logger.error('Get unread count failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new NotificationController();
