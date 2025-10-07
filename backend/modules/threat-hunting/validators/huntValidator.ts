/**
 * Threat Hunting Validation Schemas
 */

import Joi from 'joi';

// Create hunting session schema
const huntSessionSchema = Joi.object({
  name: Joi.string().min(3).max(200).required(),
  description: Joi.string().optional(),
  hypothesis: Joi.string().required(),
  objectives: Joi.array().items(Joi.string()).optional(),
  scope: Joi.object({
    systems: Joi.array().items(Joi.string()).optional(),
    networks: Joi.array().items(Joi.string()).optional(),
    time_range: Joi.object({
      start: Joi.date().iso().required(),
      end: Joi.date().iso().min(Joi.ref('start')).required(),
    }).optional(),
  }).optional(),
  status: Joi.string().valid('planning', 'active', 'paused', 'completed', 'archived').default('planning'),
  priority: Joi.string().valid('critical', 'high', 'medium', 'low').default('medium'),
  tags: Joi.array().items(Joi.string()).optional(),
}).min(1);

// Update hunting session schema (partial)
const huntSessionUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(200).optional(),
  description: Joi.string().optional(),
  hypothesis: Joi.string().optional(),
  objectives: Joi.array().items(Joi.string()).optional(),
  scope: Joi.object({
    systems: Joi.array().items(Joi.string()).optional(),
    networks: Joi.array().items(Joi.string()).optional(),
    time_range: Joi.object({
      start: Joi.date().iso().required(),
      end: Joi.date().iso().min(Joi.ref('start')).required(),
    }).optional(),
  }).optional(),
  status: Joi.string().valid('planning', 'active', 'paused', 'completed', 'archived').optional(),
  priority: Joi.string().valid('critical', 'high', 'medium', 'low').optional(),
  tags: Joi.array().items(Joi.string()).optional(),
}).min(1);

// Hunt query schema
const huntQuerySchema = Joi.object({
  query: Joi.string().required(),
  query_type: Joi.string().valid('kql', 'spl', 'sql', 'custom').default('kql'),
  description: Joi.string().optional(),
}).min(1);

// Hunt finding schema
const huntFindingSchema = Joi.object({
  title: Joi.string().min(3).max(500).required(),
  description: Joi.string().required(),
  severity: Joi.string().valid('critical', 'high', 'medium', 'low', 'info').required(),
  evidence: Joi.array().items(Joi.object()).optional(),
  indicators: Joi.array().items(Joi.string()).optional(),
  recommendation: Joi.string().optional(),
}).min(1);

export default {
  huntSessionSchema,
  huntSessionUpdateSchema,
  huntQuerySchema,
  huntFindingSchema,
};

