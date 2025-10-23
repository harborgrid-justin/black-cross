/**
 * Integration validation schemas
 */

import Joi from 'joi';

const integrationSchema = Joi.object({
  name: Joi.string().required().trim().min(3)
    .max(200),
  type: Joi.string().required().valid(
    'edr',
    'xdr',
    'firewall',
    'siem',
    'email_gateway',
    'identity',
    'cloud',
    'network',
    'ticketing',
    'communication',
    'custom',
  ),
  vendor: Joi.string().required().trim(),
  description: Joi.string().optional(),
  status: Joi.string().valid('active', 'inactive', 'error', 'testing').default('inactive'),
  configuration: Joi.object({
    endpoint: Joi.string().uri().required(),
    api_version: Joi.string().optional(),
    authentication: Joi.object({
      type: Joi.string().required().valid('api_key', 'oauth2', 'basic', 'token', 'certificate'),
      credentials_ref: Joi.string().required(),
    }).required(),
    timeout: Joi.number().min(1).max(300).default(30),
    retry: Joi.object({
      enabled: Joi.boolean().default(true),
      max_attempts: Joi.number().min(1).max(10).default(3),
    }).optional(),
  }).required(),
  capabilities: Joi.array().items(
    Joi.object({
      action: Joi.string().required(),
      endpoint: Joi.string().required(),
      method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH').required(),
      parameters: Joi.object().optional(),
    }),
  ).optional(),
  health_check: Joi.object({
    endpoint: Joi.string().optional(),
    interval: Joi.number().min(60).default(300),
  }).optional(),
  rate_limits: Joi.object({
    calls_per_minute: Joi.number().min(1).optional(),
    calls_per_hour: Joi.number().min(1).optional(),
    calls_per_day: Joi.number().min(1).optional(),
  }).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.object().optional(),
});

const integrationUpdateSchema = Joi.object({
  name: Joi.string().trim().min(3).max(200)
    .optional(),
  description: Joi.string().optional(),
  status: Joi.string().valid('active', 'inactive', 'error', 'testing').optional(),
  configuration: Joi.object({
    endpoint: Joi.string().uri().optional(),
    api_version: Joi.string().optional(),
    authentication: Joi.object({
      type: Joi.string().valid('api_key', 'oauth2', 'basic', 'token', 'certificate'),
      credentials_ref: Joi.string(),
    }).optional(),
    timeout: Joi.number().min(1).max(300).optional(),
    retry: Joi.object({
      enabled: Joi.boolean(),
      max_attempts: Joi.number().min(1).max(10),
    }).optional(),
  }).optional(),
  capabilities: Joi.array().items(
    Joi.object({
      action: Joi.string().required(),
      endpoint: Joi.string().required(),
      method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH').required(),
      parameters: Joi.object().optional(),
    }),
  ).optional(),
  rate_limits: Joi.object({
    calls_per_minute: Joi.number().min(1).optional(),
    calls_per_hour: Joi.number().min(1).optional(),
    calls_per_day: Joi.number().min(1).optional(),
  }).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.object().optional(),
}).min(1);

const testIntegrationSchema = Joi.object({
  test_action: Joi.string().optional(),
  test_parameters: Joi.object().optional(),
});

export default {
  integrationSchema,
  integrationUpdateSchema,
  testIntegrationSchema,
};
