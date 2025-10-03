/**
 * Report Schedule Validation
 */

const Joi = require('joi');

const scheduleSchema = Joi.object({
  name: Joi.string().required().trim().min(1).max(200),
  description: Joi.string().trim().allow('').max(1000),
  template_id: Joi.string().required(),
  schedule: Joi.string().required(),
  timezone: Joi.string().default('UTC'),
  parameters: Joi.object().default({}),
  format: Joi.string().valid('pdf', 'excel', 'csv', 'json', 'xml', 'html', 'powerpoint').default('pdf'),
  recipients: Joi.array().items(Joi.object({
    email: Joi.string().email(),
    user_id: Joi.string(),
    delivery_method: Joi.string().valid('email', 'webhook', 'storage', 'ftp').default('email'),
  })),
  conditions: Joi.object({
    enabled: Joi.boolean(),
    rules: Joi.any(),
  }),
  enabled: Joi.boolean().default(true),
  created_by: Joi.string().required(),
  metadata: Joi.object().default({}),
});

const updateScheduleSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200),
  description: Joi.string().trim().allow('').max(1000),
  schedule: Joi.string(),
  timezone: Joi.string(),
  parameters: Joi.object(),
  format: Joi.string().valid('pdf', 'excel', 'csv', 'json', 'xml', 'html', 'powerpoint'),
  recipients: Joi.array(),
  conditions: Joi.object(),
  enabled: Joi.boolean(),
  metadata: Joi.object(),
});

const validateSchedule = (req, res, next) => {
  const { error } = scheduleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  return next();
};

const validateUpdateSchedule = (req, res, next) => {
  const { error } = updateScheduleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  return next();
};

module.exports = {
  validateSchedule,
  validateUpdateSchedule,
};
