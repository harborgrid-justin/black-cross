/**
 * SIEM Event Validation Schemas
 */

const Joi = require('joi');

// Create/Update SIEM event schema
const siemSchema = Joi.object({
  event_type: Joi.string().required(),
  severity: Joi.string().valid('critical', 'high', 'medium', 'low', 'info').default('medium'),
  source: Joi.object({
    system: Joi.string().required(),
    ip: Joi.string().ip().optional(),
    hostname: Joi.string().optional(),
  }).required(),
  destination: Joi.object({
    system: Joi.string().optional(),
    ip: Joi.string().ip().optional(),
    hostname: Joi.string().optional(),
  }).optional(),
  message: Joi.string().required(),
  details: Joi.object().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  timestamp: Joi.date().iso().default(() => new Date()),
  correlation_id: Joi.string().optional(),
  user: Joi.string().optional(),
  action: Joi.string().optional(),
}).min(1);

// Update SIEM event schema (partial)
const siemUpdateSchema = Joi.object({
  event_type: Joi.string().optional(),
  severity: Joi.string().valid('critical', 'high', 'medium', 'low', 'info').optional(),
  message: Joi.string().optional(),
  details: Joi.object().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  correlation_id: Joi.string().optional(),
}).min(1);

module.exports = {
  siemSchema,
  siemUpdateSchema,
};
