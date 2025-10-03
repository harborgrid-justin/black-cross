/**
 * Report Template Validation
 */

const Joi = require('joi');

const templateSchema = Joi.object({
  name: Joi.string().required().trim().min(1)
    .max(200),
  description: Joi.string().trim().allow('').max(1000),
  type: Joi.string().required().valid(
    'executive_summary',
    'threat_intelligence',
    'incident_response',
    'vulnerability_assessment',
    'compliance',
    'trend_analysis',
    'operational_metrics',
    'risk_assessment',
  ),
  version: Joi.string().default('1.0.0'),
  template_data: Joi.object({
    sections: Joi.array().items(Joi.object({
      id: Joi.string(),
      title: Joi.string(),
      type: Joi.string(),
      content: Joi.any(),
      order: Joi.number(),
      conditional: Joi.object({
        enabled: Joi.boolean(),
        expression: Joi.string(),
      }),
    })),
    layout: Joi.object(),
    styles: Joi.object(),
  }),
  data_bindings: Joi.object().default({}),
  parameters: Joi.array().items(Joi.object({
    name: Joi.string(),
    type: Joi.string(),
    required: Joi.boolean(),
    default_value: Joi.any(),
    description: Joi.string(),
  })),
  is_public: Joi.boolean().default(false),
  created_by: Joi.string().required(),
  shared_with: Joi.array().items(Joi.object({
    user_id: Joi.string(),
    permissions: Joi.array().items(Joi.string()),
  })),
  tags: Joi.array().items(Joi.string()),
  status: Joi.string().valid('draft', 'active', 'archived').default('draft'),
  metadata: Joi.object().default({}),
});

const updateTemplateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200),
  description: Joi.string().trim().allow('').max(1000),
  template_data: Joi.object(),
  data_bindings: Joi.object(),
  parameters: Joi.array(),
  is_public: Joi.boolean(),
  shared_with: Joi.array(),
  tags: Joi.array().items(Joi.string()),
  status: Joi.string().valid('draft', 'active', 'archived'),
  metadata: Joi.object(),
});

const validateTemplate = (req, res, next) => {
  const { error } = templateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  return next();
};

const validateUpdateTemplate = (req, res, next) => {
  const { error } = updateTemplateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  return next();
};

module.exports = {
  validateTemplate,
  validateUpdateTemplate,
};
