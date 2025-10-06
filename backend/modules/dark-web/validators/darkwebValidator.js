/**
 * Dark Web Monitoring Validation Schemas
 */

const Joi = require('joi');

// Create/Update dark web record schema
const darkwebSchema = Joi.object({
  title: Joi.string().min(3).max(500).required(),
  description: Joi.string().optional(),
  url: Joi.string().uri().optional(),
  content_type: Joi.string()
    .valid('forum', 'marketplace', 'leak', 'announcement', 'communication', 'other')
    .default('other'),
  severity: Joi.string().valid('critical', 'high', 'medium', 'low', 'info').default('medium'),
  keywords: Joi.array().items(Joi.string()).optional(),
  source: Joi.object({
    name: Joi.string().required(),
    url: Joi.string().uri().optional(),
    reliability: Joi.number().min(0).max(100).optional(),
  }).optional(),
  threat_indicators: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    value: Joi.string().required(),
  })).optional(),
  related_entities: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  discovered_date: Joi.date().iso().default(() => new Date()),
  status: Joi.string().valid('new', 'investigating', 'confirmed', 'false_positive', 'mitigated').default('new'),
}).min(1);

// Update dark web record schema (partial)
const darkwebUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(500).optional(),
  description: Joi.string().optional(),
  content_type: Joi.string().valid('forum', 'marketplace', 'leak', 'announcement', 'communication', 'other').optional(),
  severity: Joi.string().valid('critical', 'high', 'medium', 'low', 'info').optional(),
  keywords: Joi.array().items(Joi.string()).optional(),
  threat_indicators: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    value: Joi.string().required(),
  })).optional(),
  related_entities: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('new', 'investigating', 'confirmed', 'false_positive', 'mitigated').optional(),
}).min(1);

module.exports = {
  darkwebSchema,
  darkwebUpdateSchema,
};
