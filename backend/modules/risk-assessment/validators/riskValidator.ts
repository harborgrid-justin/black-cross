/**
 * Risk Assessment validation schemas
 */

import Joi from 'joi';

const assetCriticalitySchema = Joi.object({
  asset_id: Joi.string().required(),
  asset_name: Joi.string().required(),
  asset_type: Joi.string().required().valid(
    'server',
    'workstation',
    'network_device',
    'application',
    'database',
    'service',
    'cloud_resource',
    'other',
  ),
  business_unit: Joi.string().required(),
  business_impact: Joi.object({
    financial: Joi.number().min(0).max(100),
    operational: Joi.number().min(0).max(100),
    reputational: Joi.number().min(0).max(100),
    compliance: Joi.number().min(0).max(100),
  }).required(),
  asset_value: Joi.number().min(0).optional(),
  dependencies: Joi.array().items(
    Joi.object({
      asset_id: Joi.string().required(),
      dependency_type: Joi.string().valid('depends_on', 'supports', 'connected_to'),
      criticality_impact: Joi.number().min(0).max(100),
    }),
  ).optional(),
  owner: Joi.string().required(),
  data_classification: Joi.string().valid('public', 'internal', 'confidential', 'restricted').optional(),
  metadata: Joi.object().optional(),
});

const threatImpactSchema = Joi.object({
  threat_name: Joi.string().required(),
  impact_dimensions: Joi.object({
    financial: Joi.object({
      score: Joi.number().min(0).max(100),
      estimated_loss: Joi.number().min(0),
      currency: Joi.string().default('USD'),
      confidence: Joi.number().min(0).max(100),
    }).optional(),
    operational: Joi.object({
      score: Joi.number().min(0).max(100),
      affected_processes: Joi.array().items(Joi.string()),
      downtime_hours: Joi.number().min(0),
      recovery_time: Joi.number().min(0),
    }).optional(),
    reputational: Joi.object({
      score: Joi.number().min(0).max(100),
      public_exposure: Joi.boolean(),
      customer_impact: Joi.string(),
      media_attention_level: Joi.string().valid('none', 'low', 'medium', 'high', 'critical'),
    }).optional(),
    regulatory: Joi.object({
      score: Joi.number().min(0).max(100),
      violations: Joi.array().items(Joi.string()),
      potential_fines: Joi.number().min(0),
      compliance_frameworks: Joi.array().items(Joi.string()),
    }).optional(),
    data_breach: Joi.object({
      records_at_risk: Joi.number().min(0),
      data_types: Joi.array().items(Joi.string()),
      notification_required: Joi.boolean(),
      affected_parties: Joi.number().min(0),
    }).optional(),
  }).required(),
  scenarios: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      description: Joi.string(),
      probability: Joi.number().min(0).max(100),
      impact_score: Joi.number().min(0).max(100),
    }),
  ).optional(),
  analyzed_by: Joi.string().required(),
  metadata: Joi.object().optional(),
});

const riskCalculationSchema = Joi.object({
  asset_id: Joi.string().required(),
  threat_id: Joi.string().optional(),
  vulnerability_ids: Joi.array().items(Joi.string()).optional(),
  likelihood: Joi.string().required().valid('very_low', 'low', 'medium', 'high', 'very_high'),
  impact: Joi.string().required().valid('negligible', 'minor', 'moderate', 'major', 'critical'),
  controls: Joi.array().items(
    Joi.object({
      control_id: Joi.string(),
      name: Joi.string(),
      effectiveness: Joi.number().min(0).max(100),
      status: Joi.string().valid('active', 'inactive', 'planned'),
    }),
  ).optional(),
  owner: Joi.string().required(),
  model_id: Joi.string().optional(),
  mitigation_plan: Joi.object({
    description: Joi.string(),
    actions: Joi.array().items(
      Joi.object({
        action: Joi.string(),
        responsible: Joi.string(),
        due_date: Joi.date(),
        status: Joi.string(),
      }),
    ),
    estimated_cost: Joi.number().min(0),
  }).optional(),
  metadata: Joi.object().optional(),
});

const riskModelSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  model_type: Joi.string().required().valid('qualitative', 'quantitative', 'hybrid'),
  formula: Joi.string().required(),
  factors: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      weight: Joi.number().min(0).max(1).required(),
      data_type: Joi.string().valid('number', 'enum', 'boolean'),
      possible_values: Joi.array().items(Joi.string()),
      description: Joi.string(),
    }),
  ).optional(),
  likelihood_matrix: Joi.object().optional(),
  impact_matrix: Joi.object().optional(),
  risk_levels: Joi.object().optional(),
  is_default: Joi.boolean().default(false),
  industry_template: Joi.string()
    .valid('financial', 'healthcare', 'government', 'technology', 'retail', 'custom')
    .optional(),
  created_by: Joi.string().required(),
  metadata: Joi.object().optional(),
});

const reportOptionsSchema = Joi.object({
  period: Joi.string().valid('30d', '90d', '180d', '1y').default('30d'),
  classification: Joi.string().valid('public', 'internal', 'confidential', 'restricted').default('confidential'),
  recipients: Joi.array().items(Joi.string()).optional(),
});

export default {
  assetCriticalitySchema,
  threatImpactSchema,
  riskCalculationSchema,
  riskModelSchema,
  reportOptionsSchema,
};
