/**
 * IoC Management Validators
 */

const Joi = require('joi');

// IoC validation schemas
const iocSchema = Joi.object({
  value: Joi.string().required().trim().min(1).max(500),
  type: Joi.string().required().valid(
    'ip', 'domain', 'url', 'hash', 'email', 'filename', 'registry', 'mutex', 'certificate'
  ),
  confidence: Joi.number().min(0).max(100).default(50),
  severity: Joi.string().valid('critical', 'high', 'medium', 'low', 'info').default('medium'),
  status: Joi.string().valid('active', 'inactive', 'expired', 'deprecated').default('active'),
  tags: Joi.array().items(Joi.string()),
  sources: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    reliability: Joi.number().min(0).max(100).optional(),
    url: Joi.string().uri().optional()
  })).optional(),
  expiration: Joi.date().optional(),
  metadata: Joi.object().optional()
});

const ingestSchema = Joi.object({
  iocs: Joi.array().items(iocSchema).min(1).required(),
  source: Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('feed', 'manual', 'api', 'partner', 'internal').default('manual'),
    reliability: Joi.number().min(0).max(100).default(50),
    url: Joi.string().uri().optional()
  }).optional()
});

const validateSchema = Joi.object({
  value: Joi.string().required().trim(),
  type: Joi.string().valid(
    'ip', 'domain', 'url', 'hash', 'email', 'filename', 'registry', 'mutex', 'certificate'
  ).optional()
});

const confidenceUpdateSchema = Joi.object({
  confidence: Joi.number().required().min(0).max(100),
  reason: Joi.string().optional()
});

const enrichmentSchema = Joi.object({
  sources: Joi.array().items(
    Joi.string().valid('geolocation', 'reputation', 'whois', 'dns', 'malware', 'threat_actor', 'all')
  ).default(['all'])
});

const lifecycleSchema = Joi.object({
  status: Joi.string().required().valid('active', 'inactive', 'expired', 'deprecated'),
  expiration_date: Joi.date().optional(),
  reason: Joi.string().optional()
});

const sightingSchema = Joi.object({
  timestamp: Joi.date().optional(),
  source: Joi.string().required(),
  location: Joi.string().optional(),
  context: Joi.object().optional()
});

const bulkImportSchema = Joi.object({
  data: Joi.alternatives().try(
    Joi.string(),
    Joi.array(),
    Joi.object()
  ).required(),
  format: Joi.string().valid('json', 'csv', 'stix', 'openioc', 'plain').default('json'),
  source: Joi.string().optional(),
  validate: Joi.boolean().default(true),
  skip_duplicates: Joi.boolean().default(true),
  update_existing: Joi.boolean().default(false)
});

const bulkExportSchema = Joi.object({
  format: Joi.string().valid('json', 'csv', 'stix', 'openioc', 'plain').default('json'),
  criteria: Joi.object({
    type: Joi.string().optional(),
    status: Joi.string().optional(),
    severity: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    min_confidence: Joi.number().min(0).max(100).optional()
  }).optional(),
  fields: Joi.array().items(Joi.string()).optional(),
  include_enrichment: Joi.boolean().default(true),
  include_sightings: Joi.boolean().default(false)
});

const advancedSearchSchema = Joi.object({
  query: Joi.string().optional(),
  type: Joi.string().optional(),
  types: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().optional(),
  severity: Joi.string().optional(),
  min_confidence: Joi.number().min(0).max(100).optional(),
  max_confidence: Joi.number().min(0).max(100).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  tags_operator: Joi.string().valid('OR', 'AND').default('OR'),
  sources: Joi.array().items(Joi.string()).optional(),
  date_range: Joi.object({
    start: Joi.date().optional(),
    end: Joi.date().optional()
  }).optional(),
  has_enrichment: Joi.boolean().optional(),
  has_sightings: Joi.boolean().optional(),
  sighting_count_min: Joi.number().min(0).optional(),
  sighting_count_max: Joi.number().min(0).optional(),
  sort_by: Joi.string().valid('confidence', 'severity', 'first_seen', 'last_seen', 'sightings', 'value').default('confidence'),
  sort_order: Joi.string().valid('asc', 'desc').default('desc'),
  limit: Joi.number().min(1).max(1000).default(50),
  offset: Joi.number().min(0).default(0)
});

const formatConversionSchema = Joi.object({
  iocs: Joi.alternatives().try(
    Joi.array(),
    Joi.object()
  ).required(),
  target_format: Joi.string().required().valid('json', 'csv', 'stix', 'openioc', 'plain')
});

module.exports = {
  iocSchema,
  ingestSchema,
  validateSchema,
  confidenceUpdateSchema,
  enrichmentSchema,
  lifecycleSchema,
  sightingSchema,
  bulkImportSchema,
  bulkExportSchema,
  advancedSearchSchema,
  formatConversionSchema
};
