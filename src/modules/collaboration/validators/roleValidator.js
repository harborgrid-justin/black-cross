/**
 * Role validation schemas
 */

const Joi = require('joi');

const roleSchema = Joi.object({
  name: Joi.string().required().trim().min(3)
    .max(100),
  description: Joi.string().trim().max(500).optional(),
  permissions: Joi.array().items(
    Joi.object({
      resource: Joi.string().required(),
      actions: Joi.array().items(
        Joi.string().valid('create', 'read', 'update', 'delete', 'execute', 'manage'),
      ).min(1).required(),
      scope: Joi.string().valid('global', 'workspace', 'own').default('workspace'),
    }),
  ).min(1).required(),
  parent_role_id: Joi.string().optional(),
  workspace_id: Joi.string().optional(),
  metadata: Joi.object().optional(),
});

const updateRoleSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100)
    .optional(),
  description: Joi.string().trim().max(500).optional(),
  permissions: Joi.array().items(
    Joi.object({
      resource: Joi.string().required(),
      actions: Joi.array().items(
        Joi.string().valid('create', 'read', 'update', 'delete', 'execute', 'manage'),
      ).min(1).required(),
      scope: Joi.string().valid('global', 'workspace', 'own').default('workspace'),
    }),
  ).optional(),
  parent_role_id: Joi.string().optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
  metadata: Joi.object().optional(),
});

const assignRoleSchema = Joi.object({
  role_id: Joi.string().required(),
  user_id: Joi.string().required(),
  workspace_id: Joi.string().optional(),
});

module.exports = {
  roleSchema,
  updateRoleSchema,
  assignRoleSchema,
};
