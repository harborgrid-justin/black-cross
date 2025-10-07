/**
 * Report Validation Schemas
 */

import Joi from 'joi';

// Create/Update report schema
const reportSchema = Joi.object({
  title: Joi.string().min(3).max(500).required(),
  description: Joi.string().optional(),
  report_type: Joi.string()
    .valid('incident', 'threat', 'vulnerability', 'compliance', 'executive', 'technical', 'custom')
    .required(),
  format: Joi.string().valid('pdf', 'html', 'json', 'csv', 'xlsx').default('pdf'),
  date_range: Joi.object({
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).required(),
  }).optional(),
  filters: Joi.object().optional(),
  sections: Joi.array().items(Joi.string()).optional(),
  recipients: Joi.array().items(Joi.string().email()).optional(),
  schedule: Joi.object({
    frequency: Joi.string().valid('once', 'daily', 'weekly', 'monthly').default('once'),
    time: Joi.string().optional(),
  }).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
}).min(1);

// Update report schema (partial)
const reportUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(500).optional(),
  description: Joi.string().optional(),
  report_type: Joi.string()
    .valid('incident', 'threat', 'vulnerability', 'compliance', 'executive', 'technical', 'custom')
    .optional(),
  format: Joi.string().valid('pdf', 'html', 'json', 'csv', 'xlsx').optional(),
  date_range: Joi.object({
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).required(),
  }).optional(),
  filters: Joi.object().optional(),
  sections: Joi.array().items(Joi.string()).optional(),
  recipients: Joi.array().items(Joi.string().email()).optional(),
  schedule: Joi.object({
    frequency: Joi.string().valid('once', 'daily', 'weekly', 'monthly').optional(),
    time: Joi.string().optional(),
  }).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
}).min(1);

export default {
  reportSchema,
  reportUpdateSchema,
};

