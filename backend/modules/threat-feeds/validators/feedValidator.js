/**
 * Threat Feed Validation Schemas
 */

const Joi = require('joi');

// Create/Update threat feed schema
const feedSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().optional(),
  url: Joi.string().uri().required(),
  feed_type: Joi.string().valid('rss', 'api', 'json', 'csv', 'xml', 'stix').required(),
  frequency: Joi.number().min(1).max(86400).default(3600),
  enabled: Joi.boolean().default(true),
  api_key: Joi.string().optional(),
  headers: Joi.object().optional(),
  parser_config: Joi.object().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  reliability: Joi.number().min(0).max(100).default(50),
}).min(1);

// Update threat feed schema (partial)
const feedUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  description: Joi.string().optional(),
  url: Joi.string().uri().optional(),
  feed_type: Joi.string().valid('rss', 'api', 'json', 'csv', 'xml', 'stix').optional(),
  frequency: Joi.number().min(1).max(86400).optional(),
  enabled: Joi.boolean().optional(),
  api_key: Joi.string().optional(),
  headers: Joi.object().optional(),
  parser_config: Joi.object().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  reliability: Joi.number().min(0).max(100).optional(),
}).min(1);

module.exports = {
  feedSchema,
  feedUpdateSchema,
};
