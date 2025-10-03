/**
 * Notification Controller
 * Handle HTTP requests for notification operations
 */

const { notificationService } = require('../services');
const {
  sendNotificationSchema,
  bulkNotificationSchema,
  userPreferencesSchema
} = require('../validators/notificationValidator');

class NotificationController {
  /**
   * Send notification
   * POST /api/v1/incidents/:id/notify
   */
  async sendNotification(req, res) {
    try {
      const { error, value } = sendNotificationSchema.validate({
        incident_id: req.params.id,
        ...req.body
      });
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const notification = await notificationService.sendNotification(value);

      res.status(201).json({
        success: true,
        data: notification.toJSON()
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Send bulk notifications
   * POST /api/v1/notifications/bulk
   */
  async sendBulkNotifications(req, res) {
    try {
      const { error, value } = bulkNotificationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const results = await notificationService.sendBulkNotifications(value.notifications);

      res.json({
        success: true,
        data: results,
        summary: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Get notification
   * GET /api/v1/notifications/:id
   */
  async getNotification(req, res) {
    try {
      const notification = await notificationService.getNotification(req.params.id);
      
      if (!notification) {
        return res.status(404).json({ error: 'Not Found', message: 'Notification not found' });
      }

      res.json({
        success: true,
        data: notification.toJSON()
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * List notifications for incident
   * GET /api/v1/incidents/:id/communications
   */
  async listNotifications(req, res) {
    try {
      const notifications = await notificationService.listNotificationsByIncident(req.params.id);

      res.json({
        success: true,
        data: notifications.map(n => n.toJSON()),
        count: notifications.length
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Get notification templates
   * GET /api/v1/notifications/templates
   */
  async getTemplates(req, res) {
    try {
      const templates = await notificationService.getTemplates();

      res.json({
        success: true,
        data: templates
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Set user preferences
   * PUT /api/v1/users/:userId/notification-preferences
   */
  async setUserPreferences(req, res) {
    try {
      const { error, value } = userPreferencesSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const preferences = await notificationService.setUserPreferences(
        req.params.userId,
        value
      );

      res.json({
        success: true,
        data: preferences
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Get notification statistics
   * GET /api/v1/incidents/:id/communications/stats
   */
  async getNotificationStats(req, res) {
    try {
      const stats = await notificationService.getNotificationStats(req.params.id);

      res.json({
        success: true,
        data: stats
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }
}

module.exports = new NotificationController();
