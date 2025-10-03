/**
 * Message validation schemas
 */

const Joi = require('joi');

const channelSchema = Joi.object({
  name: Joi.string().required().trim().min(1)
    .max(100),
  description: Joi.string().trim().max(500).optional(),
  type: Joi.string().valid('direct', 'group', 'public', 'private').default('group'),
  workspace_id: Joi.string().required(),
  members: Joi.array().items(
    Joi.object({
      user_id: Joi.string().required(),
      role: Joi.string().valid('owner', 'admin', 'member').default('member'),
    }),
  ).optional(),
  settings: Joi.object({
    encryption_enabled: Joi.boolean().default(true),
    retention_days: Joi.number().min(0).default(0),
  }).optional(),
  metadata: Joi.object().optional(),
});

const messageSchema = Joi.object({
  channel_id: Joi.string().required(),
  content: Joi.string().required().min(1).max(10000),
  content_type: Joi.string().valid('text', 'code', 'file', 'system').default('text'),
  thread_id: Joi.string().optional(),
  mentions: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.object().optional(),
});

const updateMessageSchema = Joi.object({
  content: Joi.string().required().min(1).max(10000),
});

const reactionSchema = Joi.object({
  emoji: Joi.string().required(),
});

module.exports = {
  channelSchema,
  messageSchema,
  updateMessageSchema,
  reactionSchema,
};
