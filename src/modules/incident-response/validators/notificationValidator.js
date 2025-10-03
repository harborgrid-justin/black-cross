/**
 * Notification Validators
 * Input validation schemas for notification operations
 */

const Joi = require('joi');
const { NotificationChannel, NotificationPriority } = require('../models');

/**
 * Send notification validation schema
 */
const sendNotificationSchema = Joi.object({
  incident_id: Joi.string().required(),
  channel: Joi.string().valid(...Object.values(NotificationChannel)).required(),
  priority: Joi.string().valid(...Object.values(NotificationPriority)).default(NotificationPriority.MEDIUM),
  subject: Joi.string().required().min(3).max(200),
  message: Joi.string().required().min(10).max(5000),
  recipients: Joi.array().items(Joi.string()).min(1).required(),
  template_id: Joi.string().optional(),
  template_data: Joi.object().optional(),
  scheduled_at: Joi.date().optional(),
  metadata: Joi.object().optional()
});

/**
 * Bulk notification validation schema
 */
const bulkNotificationSchema = Joi.object({
  notifications: Joi.array().items(sendNotificationSchema).min(1).required()
});

/**
 * User preferences validation schema
 */
const userPreferencesSchema = Joi.object({
  email: Joi.boolean().default(true),
  sms: Joi.boolean().default(false),
  slack: Joi.boolean().default(false),
  in_app: Joi.boolean().default(true),
  priority_filter: Joi.array().items(
    Joi.string().valid(...Object.values(NotificationPriority))
  ).optional(),
  quiet_hours: Joi.object({
    enabled: Joi.boolean().default(false),
    start: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
    end: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
  }).optional()
});

module.exports = {
  sendNotificationSchema,
  bulkNotificationSchema,
  userPreferencesSchema
};
