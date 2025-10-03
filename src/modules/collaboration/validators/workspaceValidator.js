/**
 * Workspace validation schemas
 */

const Joi = require('joi');

const workspaceSchema = Joi.object({
  name: Joi.string().required().trim().min(3)
    .max(200),
  description: Joi.string().trim().max(1000).optional(),
  type: Joi.string().valid(
    'security_operations',
    'incident_response',
    'threat_hunting',
    'vulnerability_management',
    'general',
  ).default('general'),
  members: Joi.array().items(
    Joi.object({
      user_id: Joi.string().required(),
      role: Joi.string().valid('owner', 'admin', 'member', 'viewer').default('member'),
    }),
  ).optional(),
  settings: Joi.object({
    privacy: Joi.string().valid('private', 'team', 'public').default('team'),
    allow_guest_access: Joi.boolean().default(false),
    enable_notifications: Joi.boolean().default(true),
    retention_policy: Joi.string().valid('30_days', '90_days', '1_year', 'unlimited').default('unlimited'),
  }).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.object().optional(),
});

const updateWorkspaceSchema = Joi.object({
  name: Joi.string().trim().min(3).max(200)
    .optional(),
  description: Joi.string().trim().max(1000).optional(),
  type: Joi.string().valid(
    'security_operations',
    'incident_response',
    'threat_hunting',
    'vulnerability_management',
    'general',
  ).optional(),
  settings: Joi.object({
    privacy: Joi.string().valid('private', 'team', 'public').optional(),
    allow_guest_access: Joi.boolean().optional(),
    enable_notifications: Joi.boolean().optional(),
    retention_policy: Joi.string().valid('30_days', '90_days', '1_year', 'unlimited').optional(),
  }).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
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
