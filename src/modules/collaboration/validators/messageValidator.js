/**
 * Message validation schemas
 */

const Joi = require('joi');

const messageSchema = Joi.object({
  channel_id: Joi.string().required(),
  workspace_id: Joi.string().required(),
  sender_id: Joi.string().optional(),
  content: Joi.string().required().trim().min(1)
    .max(4000),
  type: Joi.string().valid('text', 'file', 'code', 'system', 'thread').default('text'),
  thread_id: Joi.string().optional(),
  parent_message_id: Joi.string().optional(),
  mentions: Joi.array().items(
    Joi.object({
      user_id: Joi.string().required(),
      mention_type: Joi.string().valid('user', 'channel', 'all').default('user'),
    }),
  ).optional(),
  metadata: Joi.object().optional(),
});

const channelSchema = Joi.object({
  name: Joi.string().required().trim().min(1)
    .max(100),
  workspace_id: Joi.string().required(),
  type: Joi.string().valid('public', 'private', 'direct').default('public'),
  description: Joi.string().trim().max(500).optional(),
  members: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.object().optional(),
});

const reactionSchema = Joi.object({
  emoji: Joi.string().required().trim().min(1)
    .max(20),
});

module.exports = {
  messageSchema,
  channelSchema,
  reactionSchema,
};
