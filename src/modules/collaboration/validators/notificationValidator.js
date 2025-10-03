/**
 * Notification validation schemas
 */

const Joi = require('joi');

const notificationPreferenceSchema = Joi.object({
  preferences: Joi.object({
    task_assigned: Joi.object({
      enabled: Joi.boolean(),
      channels: Joi.array().items(Joi.string().valid('in_app', 'email', 'sms', 'push')),
    }).optional(),
    task_updated: Joi.object({
      enabled: Joi.boolean(),
      channels: Joi.array().items(Joi.string().valid('in_app', 'email', 'sms', 'push')),
    }).optional(),
    task_completed: Joi.object({
      enabled: Joi.boolean(),
      channels: Joi.array().items(Joi.string().valid('in_app', 'email', 'sms', 'push')),
    }).optional(),
    mention: Joi.object({
      enabled: Joi.boolean(),
      channels: Joi.array().items(Joi.string().valid('in_app', 'email', 'sms', 'push')),
    }).optional(),
    comment: Joi.object({
      enabled: Joi.boolean(),
      channels: Joi.array().items(Joi.string().valid('in_app', 'email', 'sms', 'push')),
    }).optional(),
    workspace_invite: Joi.object({
      enabled: Joi.boolean(),
      channels: Joi.array().items(Joi.string().valid('in_app', 'email', 'sms', 'push')),
    }).optional(),
    message: Joi.object({
      enabled: Joi.boolean(),
      channels: Joi.array().items(Joi.string().valid('in_app', 'email', 'sms', 'push')),
    }).optional(),
    activity: Joi.object({
      enabled: Joi.boolean(),
      channels: Joi.array().items(Joi.string().valid('in_app', 'email', 'sms', 'push')),
    }).optional(),
  }).optional(),
  do_not_disturb: Joi.object({
    enabled: Joi.boolean(),
    start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }).optional(),
  digest: Joi.object({
    enabled: Joi.boolean(),
    frequency: Joi.string().valid('daily', 'weekly'),
  }).optional(),
});

module.exports = {
  notificationPreferenceSchema,
};
