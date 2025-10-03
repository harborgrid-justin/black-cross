/**
 * Feed Integration Validators
 */

const Joi = require('joi');

// Feed Source validation schemas
const feedSourceSchemas = {
  create: Joi.object({
    name: Joi.string().required().min(1).max(255),
    type: Joi.string().valid('commercial', 'opensource', 'government', 'community', 'custom').required(),
    url: Joi.string().uri().required(),
    format: Joi.string().valid('stix', 'taxii', 'json', 'csv', 'xml', 'openioc', 'misp', 'custom').required(),
    authentication: Joi.object({
      type: Joi.string().valid('api_key', 'basic', 'oauth').required(),
      credentials: Joi.object().required()
    }).allow(null),
    schedule: Joi.string().default('0 */6 * * *'),
    enabled: Joi.boolean().default(true),
    category: Joi.string().valid('malware', 'phishing', 'ransomware', 'apt', 'general').default('general'),
    priority: Joi.string().valid('critical', 'high', 'medium', 'low').default('medium'),
    metadata: Joi.object({
      provider: Joi.string(),
      description: Joi.string(),
      tags: Joi.array().items(Joi.string()),
      cost: Joi.number().allow(null),
      license: Joi.string().allow(null),
      coverage: Joi.array().items(Joi.string())
    })
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(255),
    type: Joi.string().valid('commercial', 'opensource', 'government', 'community', 'custom'),
    url: Joi.string().uri(),
    format: Joi.string().valid('stix', 'taxii', 'json', 'csv', 'xml', 'openioc', 'misp', 'custom'),
    authentication: Joi.object({
      type: Joi.string().valid('api_key', 'basic', 'oauth').required(),
      credentials: Joi.object().required()
    }).allow(null),
    schedule: Joi.string(),
    enabled: Joi.boolean(),
    category: Joi.string().valid('malware', 'phishing', 'ransomware', 'apt', 'general'),
    priority: Joi.string().valid('critical', 'high', 'medium', 'low'),
    metadata: Joi.object()
  })
};

// Custom Feed validation schemas
const customFeedSchemas = {
  create: Joi.object({
    name: Joi.string().required().min(1).max(255),
    description: Joi.string().allow(''),
    output_format: Joi.string().valid('json', 'csv', 'stix', 'xml').required(),
    fields: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      type: Joi.string().required(),
      required: Joi.boolean().default(false),
      description: Joi.string().allow('')
    })),
    filters: Joi.object(),
    distribution: Joi.string().valid('internal', 'external', 'restricted').default('internal'),
    access_control: Joi.object({
      users: Joi.array().items(Joi.string()),
      teams: Joi.array().items(Joi.string()),
      organizations: Joi.array().items(Joi.string())
    }),
    auto_update: Joi.boolean().default(true),
    update_frequency: Joi.string().default('0 */1 * * *'),
    documentation: Joi.string().allow(''),
    created_by: Joi.string()
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(255),
    description: Joi.string(),
    output_format: Joi.string().valid('json', 'csv', 'stix', 'xml'),
    fields: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      type: Joi.string().required(),
      required: Joi.boolean(),
      description: Joi.string()
    })),
    filters: Joi.object(),
    distribution: Joi.string().valid('internal', 'external', 'restricted'),
    access_control: Joi.object(),
    auto_update: Joi.boolean(),
    update_frequency: Joi.string(),
    documentation: Joi.string()
  })
};

// Feed aggregation validation schemas
const aggregationSchemas = {
  aggregate: Joi.object({
    feed_source_ids: Joi.array().items(Joi.string()).default([])
  })
};

// Feed scheduling validation schemas
const schedulingSchemas = {
  schedule: Joi.object({
    feed_source_id: Joi.string().required(),
    schedule: Joi.string().required()
  })
};

// Reliability scoring validation schemas
const reliabilitySchemas = {
  updateScore: Joi.object({
    score: Joi.number().min(0).max(100).required(),
    reason: Joi.string().allow(null)
  }),

  trackFalsePositive: Joi.object({
    feed_item_id: Joi.string().required()
  })
};

// Deduplication validation schemas
const deduplicationSchemas = {
  deduplicate: Joi.object({
    feed_source_id: Joi.string(),
    type: Joi.string(),
    indicator_type: Joi.string(),
    start_date: Joi.date(),
    end_date: Joi.date()
  }),

  merge: Joi.object({
    duplicate_id: Joi.string().required(),
    original_id: Joi.string().required(),
    merge_strategy: Joi.string().valid('keep_original', 'merge_fields', 'prioritize_source').default('keep_original')
  })
};

module.exports = {
  feedSourceSchemas,
  customFeedSchemas,
  aggregationSchemas,
  schedulingSchemas,
  reliabilitySchemas,
  deduplicationSchemas
};
