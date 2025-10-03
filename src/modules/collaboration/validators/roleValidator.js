/**
 * Role validation schemas
 */

const Joi = require('joi');

const roleSchema = Joi.object({
  name: Joi.string().required().trim().min(3)
    .max(100),
  description: Joi.string().trim().max(500).optional(),
  type: Joi.string().valid('system', 'custom').default('custom'),
  permissions: Joi.array().items(
    Joi.object({
      resource: Joi.string().required().valid(
        'workspace',
        'task',
        'message',
        'kb_article',
        'user',
        'role',
        'activity',
        'all',
      ),
      actions: Joi.array().items(
        Joi.string().valid('create', 'read', 'update', 'delete', 'execute', 'share', 'admin'),
      ).min(1).required(),
      conditions: Joi.object().optional(),
    }),
  ).min(1).required(),
  hierarchy_level: Joi.number().integer().min(0).default(0),
  parent_role_id: Joi.string().optional(),
  inherits_from: Joi.array().items(Joi.string()).optional(),
  workspace_id: Joi.string().optional(),
  metadata: Joi.object().optional(),
});

const assignRoleSchema = Joi.object({
  role_id: Joi.string().required(),
  user_id: Joi.string().required(),
  workspace_id: Joi.string().optional(),
  temporary: Joi.boolean().default(false),
  expires_at: Joi.date().greater('now').optional(),
});

module.exports = {
  roleSchema,
  assignRoleSchema,
};
