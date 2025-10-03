/**
 * Post-Mortem Validators
 * Input validation schemas for post-mortem operations
 */

const Joi = require('joi');

/**
 * Create post-mortem validation schema
 */
const createPostMortemSchema = Joi.object({
  title: Joi.string().required().min(3).max(200),
  summary: Joi.string().required().min(50).max(5000),
  root_cause: Joi.string().required().min(20).max(2000),
  impact_analysis: Joi.object({
    affected_users: Joi.number().integer().min(0).default(0),
    affected_systems: Joi.array().items(Joi.string()).default([]),
    business_impact: Joi.string().max(1000).default(''),
    financial_impact: Joi.number().min(0).default(0),
    data_compromised: Joi.boolean().default(false)
  }).optional(),
  contributing_factors: Joi.array().items(Joi.string()).optional(),
  participants: Joi.array().items(Joi.string()).optional()
});

/**
 * Update post-mortem validation schema
 */
const updatePostMortemSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  summary: Joi.string().min(50).max(5000),
  root_cause: Joi.string().min(20).max(2000),
  impact_analysis: Joi.object({
    affected_users: Joi.number().integer().min(0),
    affected_systems: Joi.array().items(Joi.string()),
    business_impact: Joi.string().max(1000),
    financial_impact: Joi.number().min(0),
    data_compromised: Joi.boolean()
  }),
  contributing_factors: Joi.array().items(Joi.string())
}).min(1);

/**
 * Add lesson learned validation schema
 */
const addLessonSchema = Joi.object({
  description: Joi.string().required().min(10).max(1000),
  category: Joi.string().default('general'),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium')
});

/**
 * Add recommendation validation schema
 */
const addRecommendationSchema = Joi.object({
  title: Joi.string().required().min(3).max(200),
  description: Joi.string().required().min(10).max(1000),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  category: Joi.string().default('process'),
  estimated_effort: Joi.string().valid('small', 'medium', 'large').default('medium'),
  owner: Joi.string().optional()
});

/**
 * Add action item validation schema
 */
const addActionItemSchema = Joi.object({
  title: Joi.string().required().min(3).max(200),
  description: Joi.string().required().min(10).max(1000),
  assigned_to: Joi.string().required(),
  due_date: Joi.date().optional(),
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').default('pending'),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium')
});

/**
 * Generate report validation schema
 */
const generateReportSchema = Joi.object({
  format: Joi.string().valid('json', 'markdown', 'html', 'pdf').default('json')
});

module.exports = {
  createPostMortemSchema,
  updatePostMortemSchema,
  addLessonSchema,
  addRecommendationSchema,
  addActionItemSchema,
  generateReportSchema
};
