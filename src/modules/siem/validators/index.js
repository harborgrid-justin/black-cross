/**
 * SIEM Validators
 * 
 * Input validation schemas using Joi
 */

const Joi = require('joi');

// Log ingestion validation
const logIngestionSchema = Joi.object({
  source: Joi.string().required(),
  source_type: Joi.string().valid('syslog', 'cef', 'leef', 'json', 'windows_event', 'aws', 'azure', 'gcp', 'generic').default('generic'),
  timestamp: Joi.date().optional(),
  event_type: Joi.string().optional(),
  severity: Joi.string().valid('critical', 'high', 'medium', 'low', 'info').optional(),
  user: Joi.string().optional().allow(null),
  source_ip: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).optional().allow(null),
  destination_ip: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).optional().allow(null),
  action: Joi.string().optional(),
  outcome: Joi.string().valid('success', 'failure', 'unknown').optional()
}).unknown(true);

// Log source validation
const logSourceSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  source_type: Joi.string().valid('syslog', 'cef', 'leef', 'json', 'windows_event', 'aws', 'azure', 'gcp').required(),
  protocol: Joi.string().valid('udp', 'tcp', 'http', 'https').default('udp'),
  host: Joi.string().optional().allow(null),
  port: Joi.number().integer().min(1).max(65535).optional().allow(null),
  parser_config: Joi.object().optional(),
  enrichment_enabled: Joi.boolean().default(true)
});

// Detection rule validation
const detectionRuleSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  enabled: Joi.boolean().default(true),
  severity: Joi.string().valid('critical', 'high', 'medium', 'low', 'info').default('medium'),
  rule_type: Joi.string().valid('threshold', 'anomaly', 'correlation', 'signature').default('threshold'),
  conditions: Joi.array().items(Joi.object({
    field: Joi.string().required(),
    operator: Joi.string().valid('equals', 'contains', 'regex', 'greater_than', 'less_than').required(),
    value: Joi.any().required()
  })).min(1).required(),
  threshold: Joi.number().optional().allow(null),
  time_window: Joi.number().integer().min(1).default(300),
  alert_template: Joi.object().optional(),
  actions: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    target: Joi.string().optional(),
    assignee: Joi.string().optional()
  })).default([]),
  schedule: Joi.string().optional().allow(null)
});

// Correlation rule validation
const correlationRuleSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  enabled: Joi.boolean().default(true),
  correlation_type: Joi.string().valid('sequential', 'parallel', 'grouped').default('sequential'),
  event_conditions: Joi.array().items(Joi.object({
    field: Joi.string().required(),
    operator: Joi.string().valid('equals', 'contains', 'regex', 'greater_than', 'less_than').required(),
    value: Joi.any().required()
  })).min(2).required(),
  time_window: Joi.number().integer().min(1).default(600),
  min_events: Joi.number().integer().min(2).default(2),
  max_events: Joi.number().integer().optional().allow(null),
  grouping_fields: Joi.array().items(Joi.string()).default([]),
  severity: Joi.string().valid('critical', 'high', 'medium', 'low', 'info').default('medium'),
  alert_on_match: Joi.boolean().default(true)
});

// Alert update validation
const alertUpdateSchema = Joi.object({
  status: Joi.string().valid('open', 'acknowledged', 'investigating', 'resolved', 'false_positive').optional(),
  assigned_to: Joi.string().optional().allow(null),
  priority: Joi.string().valid('critical', 'high', 'medium', 'low').optional(),
  notes: Joi.string().optional()
});

// Dashboard validation
const dashboardSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  type: Joi.string().valid('custom', 'template', 'system').default('custom'),
  template_id: Joi.string().optional().allow(null),
  widgets: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    title: Joi.string().required(),
    config: Joi.object().optional()
  })).default([]),
  refresh_interval: Joi.number().integer().min(10).default(60),
  time_range: Joi.string().default('24h'),
  filters: Joi.object().optional(),
  shared: Joi.boolean().default(false),
  shared_with: Joi.array().items(Joi.string()).default([])
});

// Forensic session validation
const forensicSessionSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  investigator: Joi.string().required(),
  incident_id: Joi.string().optional().allow(null),
  alert_ids: Joi.array().items(Joi.string()).default([]),
  event_ids: Joi.array().items(Joi.string()).default([])
});

// Compliance report validation
const complianceReportSchema = Joi.object({
  framework: Joi.string().valid('pci-dss', 'hipaa', 'sox', 'gdpr', 'iso27001', 'custom').required(),
  period_start: Joi.date().required(),
  period_end: Joi.date().required(),
  generated_by: Joi.string().required()
});

module.exports = {
  logIngestionSchema,
  logSourceSchema,
  detectionRuleSchema,
  correlationRuleSchema,
  alertUpdateSchema,
  dashboardSchema,
  forensicSessionSchema,
  complianceReportSchema
};
