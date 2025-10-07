/**
 * Compliance Validation Schemas
 */

import Joi from 'joi';

// Create/Update compliance record schema
const complianceSchema = Joi.object({
  framework: Joi.string().valid('NIST', 'ISO27001', 'PCI-DSS', 'HIPAA', 'GDPR', 'SOC2', 'FISMA', 'custom').required(),
  control_id: Joi.string().required(),
  control_name: Joi.string().required(),
  description: Joi.string().optional(),
  status: Joi.string()
    .valid('compliant', 'non_compliant', 'partially_compliant', 'not_applicable', 'under_review')
    .default('under_review'),
  evidence: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    description: Joi.string().optional(),
    url: Joi.string().uri().optional(),
    collected_date: Joi.date().iso().optional(),
  })).optional(),
  assessment_date: Joi.date().iso().optional(),
  next_review_date: Joi.date().iso().optional(),
  responsible_party: Joi.string().optional(),
  remediation_plan: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
}).min(1);

// Update compliance record schema (partial)
const complianceUpdateSchema = Joi.object({
  control_name: Joi.string().optional(),
  description: Joi.string().optional(),
  status: Joi.string()
    .valid('compliant', 'non_compliant', 'partially_compliant', 'not_applicable', 'under_review')
    .optional(),
  evidence: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    description: Joi.string().optional(),
    url: Joi.string().uri().optional(),
    collected_date: Joi.date().iso().optional(),
  })).optional(),
  assessment_date: Joi.date().iso().optional(),
  next_review_date: Joi.date().iso().optional(),
  responsible_party: Joi.string().optional(),
  remediation_plan: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
}).min(1);

export default {
  complianceSchema,
  complianceUpdateSchema,
};

