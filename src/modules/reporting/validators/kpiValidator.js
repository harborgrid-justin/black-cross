/**
 * KPI Validation
 */

const Joi = require('joi');

const kpiSchema = Joi.object({
  name: Joi.string().required().trim().min(1)
    .max(200),
  description: Joi.string().trim().allow('').max(1000),
  category: Joi.string().required().valid(
    'threat_detection',
    'incident_response',
    'vulnerability_management',
    'security_posture',
    'compliance',
    'operational',
    'custom',
  ),
  metric_type: Joi.string().required().valid(
    'count',
    'percentage',
    'ratio',
    'duration',
    'score',
    'rate',
  ),
  calculation: Joi.object({
    formula: Joi.string(),
    aggregation: Joi.string(),
    data_sources: Joi.array().items(Joi.string()),
    query: Joi.any(),
  }),
  target_value: Joi.number(),
  thresholds: Joi.object({
    critical: Joi.number(),
    warning: Joi.number(),
    good: Joi.number(),
    excellent: Joi.number(),
  }),
  unit: Joi.string().allow('').default(''),
  collection_frequency: Joi.string().default('daily'),
  owner: Joi.string().required(),
  status: Joi.string().valid('active', 'inactive', 'archived').default('active'),
  tags: Joi.array().items(Joi.string()),
  metadata: Joi.object().default({}),
});

const updateKpiSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200),
  description: Joi.string().trim().allow('').max(1000),
  calculation: Joi.object(),
  target_value: Joi.number(),
  thresholds: Joi.object(),
  collection_frequency: Joi.string(),
  status: Joi.string().valid('active', 'inactive', 'archived'),
  tags: Joi.array().items(Joi.string()),
  metadata: Joi.object(),
});

const collectMetricSchema = Joi.object({
  value: Joi.number().required(),
  metadata: Joi.object().default({}),
});

const validateKPI = (req, res, next) => {
  const { error } = kpiSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  return next();
};

const validateUpdateKPI = (req, res, next) => {
  const { error } = updateKpiSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  return next();
};

const validateCollectMetric = (req, res, next) => {
  const { error } = collectMetricSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  return next();
};

module.exports = {
  validateKPI,
  validateUpdateKPI,
  validateCollectMetric,
};
