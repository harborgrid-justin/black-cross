/**
 * Compliance validation schemas
 */

/* eslint-disable max-len */

const Joi = require('joi');

const controlSchema = Joi.object({
  control_id: Joi.string().required().trim().min(1)
    .max(100),
  framework: Joi.string().required().valid(
    'NIST-CSF',
    'NIST-800-53',
    'NIST-800-171',
    'ISO-27001',
    'ISO-27002',
    'ISO-27017',
    'ISO-27018',
    'PCI-DSS',
    'HIPAA',
    'GDPR',
    'SOX',
    'SOC2',
    'CMMC',
    'FedRAMP',
    'CIS',
  ),
  title: Joi.string().required().trim().min(3)
    .max(500),
  description: Joi.string().required().min(10),
  owner: Joi.string().required(),
  status: Joi.string().valid('active', 'inactive', 'pending', 'archived').optional(),
  implementation_status: Joi.string().valid('not_implemented', 'partially_implemented', 'implemented', 'not_applicable').optional(),
  effectiveness: Joi.string().valid('not_assessed', 'ineffective', 'partially_effective', 'effective').optional(),
  risk_level: Joi.string().valid('critical', 'high', 'medium', 'low').optional(),
  control_family: Joi.string().optional(),
  requirements: Joi.array().items(Joi.string()).optional(),
  test_procedures: Joi.array().items(Joi.string()).optional(),
  last_assessed: Joi.date().optional(),
  next_review: Joi.date().optional(),
  remediation_notes: Joi.string().optional(),
  metadata: Joi.object().optional(),
});

const frameworkMappingSchema = Joi.object({
  framework: Joi.string().required().valid(
    'NIST-CSF',
    'NIST-800-53',
    'NIST-800-171',
    'ISO-27001',
    'ISO-27002',
    'ISO-27017',
    'ISO-27018',
    'PCI-DSS',
    'HIPAA',
    'GDPR',
    'SOX',
    'SOC2',
    'CMMC',
    'FedRAMP',
    'CIS',
  ),
  controls: Joi.array().items(Joi.string()).min(1).required(),
  mapping_type: Joi.string().valid('direct', 'indirect', 'partial').default('direct'),
});

const gapAnalysisSchema = Joi.object({
  framework: Joi.string().required().valid(
    'NIST-CSF',
    'NIST-800-53',
    'NIST-800-171',
    'ISO-27001',
    'ISO-27002',
    'ISO-27017',
    'ISO-27018',
    'PCI-DSS',
    'HIPAA',
    'GDPR',
    'SOX',
    'SOC2',
    'CMMC',
    'FedRAMP',
    'CIS',
  ),
  scope: Joi.array().items(Joi.string()).optional(),
  assessment_type: Joi.string().valid('full', 'partial', 'targeted').default('full'),
  include_recommendations: Joi.boolean().default(true),
});

const policySchema = Joi.object({
  policy_id: Joi.string().required().trim().min(1)
    .max(100),
  title: Joi.string().required().trim().min(3)
    .max(500),
  description: Joi.string().required().min(10),
  version: Joi.string().required(),
  category: Joi.string().required().valid(
    'security',
    'privacy',
    'operational',
    'compliance',
    'access_control',
    'data_protection',
    'incident_response',
    'business_continuity',
    'other',
  ),
  content: Joi.string().required().min(50),
  owner: Joi.string().required(),
  status: Joi.string().valid('draft', 'review', 'approved', 'published', 'archived', 'retired').optional(),
  frameworks: Joi.array().items(Joi.string()).optional(),
  controls: Joi.array().items(Joi.string()).optional(),
  enforcement_level: Joi.string().valid('mandatory', 'recommended', 'optional').optional(),
  effective_date: Joi.date().optional(),
  review_date: Joi.date().optional(),
  next_review_date: Joi.date().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.object().optional(),
});

const reportGenerationSchema = Joi.object({
  report_type: Joi.string().required().valid(
    'assessment',
    'audit',
    'gap_analysis',
    'executive_summary',
    'control_effectiveness',
    'compliance_status',
    'remediation_progress',
  ),
  framework: Joi.string().required().valid(
    'NIST-CSF',
    'NIST-800-53',
    'NIST-800-171',
    'ISO-27001',
    'ISO-27002',
    'ISO-27017',
    'ISO-27018',
    'PCI-DSS',
    'HIPAA',
    'GDPR',
    'SOX',
    'SOC2',
    'CMMC',
    'FedRAMP',
    'CIS',
  ),
  period_start: Joi.date().required(),
  period_end: Joi.date().required().greater(Joi.ref('period_start')),
  format: Joi.string().valid('pdf', 'html', 'json', 'csv', 'excel').default('pdf'),
  include_evidence: Joi.boolean().default(false),
  recipients: Joi.array().items(Joi.string()).optional(),
});

const evidenceSchema = Joi.object({
  control_id: Joi.string().required(),
  framework: Joi.string().required(),
  title: Joi.string().required().trim().min(3)
    .max(500),
  description: Joi.string().required().min(10),
  evidence_type: Joi.string().required().valid(
    'document',
    'screenshot',
    'log',
    'report',
    'certificate',
    'configuration',
    'scan_result',
    'policy',
    'procedure',
    'other',
  ),
  collection_method: Joi.string().valid('manual', 'automated', 'system_generated').optional(),
  file_path: Joi.string().optional(),
  url: Joi.string().uri().optional(),
  content: Joi.string().optional(),
  validity_period: Joi.object({
    start_date: Joi.date().required(),
    end_date: Joi.date().required().greater(Joi.ref('start_date')),
  }).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.object().optional(),
});

const requirementTrackingSchema = Joi.object({
  requirement_id: Joi.string().required().trim().min(1)
    .max(100),
  title: Joi.string().required().trim().min(3)
    .max(500),
  description: Joi.string().required().min(10),
  jurisdiction: Joi.string().required(),
  regulation: Joi.string().required(),
  category: Joi.string().required().valid(
    'data_protection',
    'privacy',
    'security',
    'financial',
    'healthcare',
    'consumer_protection',
    'environmental',
    'industry_specific',
    'other',
  ),
  effective_date: Joi.date().required(),
  compliance_deadline: Joi.date().optional(),
  severity: Joi.string().valid('critical', 'high', 'medium', 'low').optional(),
  applicability: Joi.string().required(),
  owner: Joi.string().required(),
  controls: Joi.array().items(Joi.string()).optional(),
  frameworks: Joi.array().items(Joi.string()).optional(),
  penalties: Joi.string().optional(),
  references: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.object().optional(),
});

module.exports = {
  controlSchema,
  frameworkMappingSchema,
  gapAnalysisSchema,
  policySchema,
  reportGenerationSchema,
  evidenceSchema,
  requirementTrackingSchema,
};
