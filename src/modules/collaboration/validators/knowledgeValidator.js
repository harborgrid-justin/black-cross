/**
 * Knowledge Base validation schemas
 */

const Joi = require('joi');

const articleSchema = Joi.object({
  title: Joi.string().required().trim().min(3)
    .max(200),
  content: Joi.string().required().min(10),
  summary: Joi.string().trim().max(500).optional(),
  format: Joi.string().valid('markdown', 'html', 'plain').default('markdown'),
  category: Joi.string().required().trim(),
  tags: Joi.array().items(Joi.string()).optional(),
  author_id: Joi.string().optional(),
  workspace_id: Joi.string().required(),
  status: Joi.string().valid('draft', 'review', 'published', 'archived').default('draft'),
  approval_workflow: Joi.object({
    required: Joi.boolean().default(false),
    approvers: Joi.array().items(
      Joi.object({
        user_id: Joi.string().required(),
      }),
    ).optional(),
  }).optional(),
  access_control: Joi.object({
    visibility: Joi.string().valid('public', 'workspace', 'restricted').default('workspace'),
    allowed_users: Joi.array().items(Joi.string()).optional(),
    allowed_roles: Joi.array().items(Joi.string()).optional(),
  }).optional(),
  external_links: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      url: Joi.string().uri().required(),
    }),
  ).optional(),
  template_id: Joi.string().optional(),
  metadata: Joi.object().optional(),
});

const updateArticleSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200)
    .optional(),
  content: Joi.string().min(10).optional(),
  summary: Joi.string().trim().max(500).optional(),
  category: Joi.string().trim().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('draft', 'review', 'published', 'archived').optional(),
  change_summary: Joi.string().trim().max(200).optional(),
  metadata: Joi.object().optional(),
});

const searchSchema = Joi.object({
  query: Joi.string().required().trim().min(1),
  category: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('draft', 'review', 'published', 'archived').optional(),
  limit: Joi.number().integer().min(1).max(100)
    .default(20),
});

module.exports = {
  articleSchema,
  updateArticleSchema,
  searchSchema,
};
