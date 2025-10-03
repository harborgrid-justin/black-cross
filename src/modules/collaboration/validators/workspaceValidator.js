/**
 * Workspace validation schemas
 */

const Joi = require('joi');

const workspaceSchema = Joi.object({
  name: Joi.string().required().trim().min(3)
    .max(100),
  description: Joi.string().trim().max(500).optional(),
  type: Joi.string().valid(
    'security-operations',
    'incident-response',
    'threat-hunting',
    'vulnerability-management',
    'general',
  ).default('general'),
  owner: Joi.string().optional(),
  members: Joi.array().items(
    Joi.object({
      user_id: Joi.string().required(),
      role: Joi.string().valid('owner', 'admin', 'member', 'viewer').default('member'),
    }),
  ).optional(),
  settings: Joi.object({
    is_private: Joi.boolean().default(false),
    allow_external_sharing: Joi.boolean().default(false),
    notification_level: Joi.string().valid('all', 'important', 'none').default('important'),
  }).optional(),
  template_id: Joi.string().optional(),
  metadata: Joi.object().optional(),
});

const updateWorkspaceSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100)
    .optional(),
  description: Joi.string().trim().max(500).optional(),
  settings: Joi.object({
    is_private: Joi.boolean().optional(),
    allow_external_sharing: Joi.boolean().optional(),
    notification_level: Joi.string().valid('all', 'important', 'none').optional(),
  }).optional(),
  status: Joi.string().valid('active', 'archived', 'suspended').optional(),
  metadata: Joi.object().optional(),
});

const addMemberSchema = Joi.object({
  user_id: Joi.string().required(),
  role: Joi.string().valid('owner', 'admin', 'member', 'viewer').default('member'),
});

module.exports = {
  workspaceSchema,
  updateWorkspaceSchema,
  addMemberSchema,
};
