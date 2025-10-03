/**
 * Knowledge Base Article validation schemas
 */

const Joi = require('joi');

const articleSchema = Joi.object({
  title: Joi.string().required().trim().min(3)
    .max(200),
  content: Joi.string().required().min(10),
  content_format: Joi.string().valid('markdown', 'html', 'text').default('markdown'),
  category: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).optional(),
  workspace_id: Joi.string().required(),
  status: Joi.string().valid('draft', 'in_review', 'published', 'archived').default('draft'),
  approval: Joi.object({
    required: Joi.boolean().default(false),
    approvers: Joi.array().items(
      Joi.object({
        user_id: Joi.string().required(),
      }),
    ).optional(),
  }).optional(),
  metadata: Joi.object().optional(),
});

const updateArticleSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200)
    .optional(),
  content: Joi.string().min(10).optional(),
  content_format: Joi.string().valid('markdown', 'html', 'text').optional(),
  category: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('draft', 'in_review', 'published', 'archived').optional(),
  change_summary: Joi.string().max(500).optional(),
  metadata: Joi.object().optional(),
});

const approveArticleSchema = Joi.object({
  approved: Joi.boolean().required(),
  comments: Joi.string().max(1000).optional(),
});

const searchSchema = Joi.object({
  query: Joi.string().required().min(1),
  category: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  workspace_id: Joi.string().optional(),
  status: Joi.string().valid('draft', 'in_review', 'published', 'archived').optional(),
});

module.exports = {
  articleSchema,
  updateArticleSchema,
  approveArticleSchema,
  searchSchema,
};
