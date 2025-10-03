/**
 * Notification Routes
 */

const express = require('express');
const notificationController = require('../controllers/notificationController');
const { notificationPreferenceSchema } = require('../validators/notificationValidator');

const router = express.Router();

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }
  next();
};

router.get('/notifications', notificationController.getNotifications);
router.put('/notifications/:id/read', notificationController.markAsRead);
router.put('/notifications/read-all', notificationController.markAllAsRead);
router.get('/notifications/unread-count', notificationController.getUnreadCount);
router.get('/users/:userId/notifications/preferences', notificationController.getPreferences);
router.put(
  '/users/:userId/notifications/preferences',
  validate(notificationPreferenceSchema),
  notificationController.updatePreferences,
);

module.exports = router;
