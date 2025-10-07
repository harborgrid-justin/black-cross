/**
 * IoC (Indicator of Compromise) Validation Schemas
 */

import Joi from 'joi';

// Create/Update IoC schema
const iocSchema = Joi.object({
  type: Joi.string().valid('ip', 'domain', 'url', 'hash', 'email', 'filename', 'registry', 'mutex').required(),
  value: Joi.string().required(),
  description: Joi.string().optional(),
  severity: Joi.string().valid('critical', 'high', 'medium', 'low', 'info').default('medium'),
  confidence: Joi.number().min(0).max(100).default(50),
  tags: Joi.array().items(Joi.string()).optional(),
  source: Joi.object({
    name: Joi.string().required(),
    url: Joi.string().uri().optional(),
    reliability: Joi.number().min(0).max(100).optional(),
  }).optional(),
  first_seen: Joi.date().iso().optional(),
  last_seen: Joi.date().iso().optional(),
  context: Joi.string().optional(),
  related_threats: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('active', 'inactive', 'expired').default('active'),
}).min(1);

// Update IoC schema (partial)
const iocUpdateSchema = Joi.object({
  type: Joi.string().valid('ip', 'domain', 'url', 'hash', 'email', 'filename', 'registry', 'mutex').optional(),
  value: Joi.string().optional(),
  description: Joi.string().optional(),
  severity: Joi.string().valid('critical', 'high', 'medium', 'low', 'info').optional(),
  confidence: Joi.number().min(0).max(100).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  source: Joi.object({
    name: Joi.string().required(),
    url: Joi.string().uri().optional(),
    reliability: Joi.number().min(0).max(100).optional(),
  }).optional(),
  last_seen: Joi.date().iso().optional(),
  context: Joi.string().optional(),
  related_threats: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('active', 'inactive', 'expired').optional(),
}).min(1);

export default {
  iocSchema,
  iocUpdateSchema,
};

