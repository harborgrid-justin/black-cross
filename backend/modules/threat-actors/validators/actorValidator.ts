/**
 * Threat Actor Validation Schemas
 */

import Joi from 'joi';

// Create/Update threat actor schema
const actorSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  aliases: Joi.array().items(Joi.string()).optional(),
  description: Joi.string().optional(),
  type: Joi.string()
    .valid('nation_state', 'cybercriminal', 'hacktivist', 'insider', 'unknown')
    .default('unknown'),
  sophistication: Joi.string()
    .valid('none', 'minimal', 'intermediate', 'advanced', 'expert', 'innovator')
    .default('minimal'),
  motivation: Joi.array()
    .items(Joi.string().valid('financial', 'espionage', 'disruption', 'ideology', 'revenge', 'fun'))
    .optional(),
  origin_country: Joi.string().optional(),
  first_seen: Joi.date().iso().optional(),
  last_seen: Joi.date().iso().optional(),
  targets: Joi.array().items(Joi.string()).optional(),
  industries_targeted: Joi.array().items(Joi.string()).optional(),
  tactics: Joi.array().items(Joi.string()).optional(),
  techniques: Joi.array().items(Joi.string()).optional(),
  tools: Joi.array().items(Joi.string()).optional(),
  related_threats: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('active', 'inactive', 'unknown').default('active'),
}).min(1);

// Update threat actor schema (partial)
const actorUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  aliases: Joi.array().items(Joi.string()).optional(),
  description: Joi.string().optional(),
  type: Joi.string()
    .valid('nation_state', 'cybercriminal', 'hacktivist', 'insider', 'unknown')
    .optional(),
  sophistication: Joi.string()
    .valid('none', 'minimal', 'intermediate', 'advanced', 'expert', 'innovator')
    .optional(),
  motivation: Joi.array()
    .items(Joi.string().valid('financial', 'espionage', 'disruption', 'ideology', 'revenge', 'fun'))
    .optional(),
  origin_country: Joi.string().optional(),
  last_seen: Joi.date().iso().optional(),
  targets: Joi.array().items(Joi.string()).optional(),
  industries_targeted: Joi.array().items(Joi.string()).optional(),
  tactics: Joi.array().items(Joi.string()).optional(),
  techniques: Joi.array().items(Joi.string()).optional(),
  tools: Joi.array().items(Joi.string()).optional(),
  related_threats: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('active', 'inactive', 'unknown').optional(),
}).min(1);

export default {
  actorSchema,
  actorUpdateSchema,
};
