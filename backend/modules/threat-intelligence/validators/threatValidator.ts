/**
 * Threat validation schemas
 */

import Joi from 'joi';

const threatSchema = Joi.object({
  name: Joi.string().required().trim().min(3)
    .max(200),
  type: Joi.string().required().valid(
    'malware',
    'phishing',
    'ransomware',
    'apt',
    'botnet',
    'ddos',
    'vulnerability',
    'exploit',
    'backdoor',
    'trojan',
    'worm',
    'other',
  ),
  severity: Joi.string().valid('critical', 'high', 'medium', 'low', 'info').default('medium'),
  confidence: Joi.number().min(0).max(100).default(50),
  categories: Joi.array().items(Joi.string()),
  tags: Joi.array().items(Joi.string()),
  description: Joi.string().required().min(10),
  indicators: Joi.array().items(
    Joi.object({
      type: Joi.string().required().valid('ip', 'domain', 'url', 'hash', 'email', 'filename', 'registry', 'mutex'),
      value: Joi.string().required(),
      context: Joi.string().optional(),
    }),
  ),
  source: Joi.object({
    name: Joi.string().required(),
    url: Joi.string().uri().optional(),
    reliability: Joi.number().min(0).max(100).optional(),
  }).optional(),
  mitre_attack: Joi.object({
    tactics: Joi.array().items(Joi.string()),
    techniques: Joi.array().items(Joi.string()),
    groups: Joi.array().items(Joi.string()),
  }).optional(),
  metadata: Joi.object().optional(),
});

const categorizationSchema = Joi.object({
  threat_id: Joi.string().required(),
  categories: Joi.array().items(Joi.string()).min(1).required(),
  auto_categorize: Joi.boolean().default(false),
});

const enrichmentSchema = Joi.object({
  threat_id: Joi.string().required(),
  sources: Joi.array().items(
    Joi.string().valid('osint', 'geolocation', 'reputation', 'dns', 'all'),
  ).default(['all']),
});

const archiveSchema = Joi.object({
  threat_ids: Joi.array().items(Joi.string()).min(1),
  older_than_days: Joi.number().min(1),
  status: Joi.string().valid('active', 'inactive'),
}).or('threat_ids', 'older_than_days');

const correlationSchema = Joi.object({
  threat_id: Joi.string().optional(),
  min_similarity: Joi.number().min(0).max(100).default(70),
  correlation_types: Joi.array().items(
    Joi.string().valid('ioc_overlap', 'temporal', 'infrastructure', 'campaign', 'behavioral', 'victim_profile'),
  ).optional(),
});

export default {
  threatSchema,
  categorizationSchema,
  enrichmentSchema,
  archiveSchema,
  correlationSchema,
};

