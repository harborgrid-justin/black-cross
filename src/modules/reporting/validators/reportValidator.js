/**
 * Report Validation
 */

const Joi = require('joi');

const reportSchema = Joi.object({
  name: Joi.string().required().trim().min(1).max(200),
  description: Joi.string().trim().allow('').max(1000),
  template_id: Joi.string().uuid(),
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
  parameters: Joi.object().default({}),
  format: Joi.string().valid('pdf', 'excel', 'csv', 'json', 'xml', 'html', 'powerpoint').default('pdf'),
  created_by: Joi.string().required(),
  metadata: Joi.object().default({}),
});

const generateReportSchema = Joi.object({
  template_id: Joi.string().required(),
  parameters: Joi.object().default({}),
  format: Joi.string().valid('pdf', 'excel', 'csv', 'json', 'xml', 'html', 'powerpoint').default('pdf'),
});

const validateReport = (req, res, next) => {
  const { error } = reportSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  return next();
};

const validateGenerateReport = (req, res, next) => {
  const { error } = generateReportSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  return next();
};

module.exports = {
  validateReport,
  validateGenerateReport,
};
