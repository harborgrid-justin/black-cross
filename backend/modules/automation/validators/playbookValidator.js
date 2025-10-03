/**
 * Playbook validation schemas
 */

const Joi = require('joi');

const actionSchema = Joi.object({
  type: Joi.string().required().valid(
    'block_ip',
    'isolate_endpoint',
    'reset_credentials',
    'send_notification',
    'create_ticket',
    'collect_evidence',
    'run_scan',
    'update_firewall',
    'query_siem',
    'enrich_ioc',
    'custom_api',
    'wait',
    'approval',
  ),
  name: Joi.string().required().trim().min(3)
    .max(200),
  description: Joi.string().optional(),
  parameters: Joi.object().optional(),
  timeout: Joi.number().min(1).max(3600).default(300),
  retry: Joi.object({
    enabled: Joi.boolean().default(false),
    max_attempts: Joi.number().min(1).max(10).default(3),
    delay: Joi.number().min(1).max(300).default(5),
  }).optional(),
  on_error: Joi.string().valid('fail', 'continue', 'skip').default('fail'),
  condition: Joi.object().optional(),
  order: Joi.number().required().min(0),
});

const triggerConditionSchema = Joi.object({
  type: Joi.string().valid('manual', 'event', 'schedule', 'api', 'webhook').default('manual'),
  event_type: Joi.string().optional(),
  conditions: Joi.object().optional(),
  schedule: Joi.string().optional(),
});

const playbookSchema = Joi.object({
  name: Joi.string().required().trim().min(3)
    .max(200),
  description: Joi.string().required().min(10),
  category: Joi.string().required().valid(
    'phishing_response',
    'malware_containment',
    'ransomware_response',
    'data_breach',
    'ddos_mitigation',
    'account_compromise',
    'vulnerability_remediation',
    'threat_hunting',
    'custom',
  ),
  version: Joi.string().pattern(/^\d+\.\d+\.\d+$/).default('1.0.0'),
  author: Joi.string().required(),
  status: Joi.string().valid('draft', 'active', 'inactive', 'archived').default('draft'),
  is_prebuilt: Joi.boolean().default(false),
  trigger_conditions: triggerConditionSchema.optional(),
  actions: Joi.array().items(actionSchema).min(1).required(),
  variables: Joi.object().optional(),
  approvals_required: Joi.boolean().default(false),
  approval_roles: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  mitre_attack: Joi.object({
    tactics: Joi.array().items(Joi.string()),
    techniques: Joi.array().items(Joi.string()),
  }).optional(),
  metadata: Joi.object().optional(),
});

const playbookUpdateSchema = Joi.object({
  name: Joi.string().trim().min(3).max(200)
    .optional(),
  description: Joi.string().min(10).optional(),
  category: Joi.string().valid(
    'phishing_response',
    'malware_containment',
    'ransomware_response',
    'data_breach',
    'ddos_mitigation',
    'account_compromise',
    'vulnerability_remediation',
    'threat_hunting',
    'custom',
  ).optional(),
  status: Joi.string().valid('draft', 'active', 'inactive', 'archived').optional(),
  trigger_conditions: triggerConditionSchema.optional(),
  actions: Joi.array().items(actionSchema).min(1).optional(),
  variables: Joi.object().optional(),
  approvals_required: Joi.boolean().optional(),
  approval_roles: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  mitre_attack: Joi.object({
    tactics: Joi.array().items(Joi.string()),
    techniques: Joi.array().items(Joi.string()),
  }).optional(),
  metadata: Joi.object().optional(),
}).min(1);

const executePlaybookSchema = Joi.object({
  execution_mode: Joi.string().valid('live', 'test', 'simulation').default('live'),
  triggered_by: Joi.object({
    type: Joi.string().valid('user', 'event', 'api').required(),
    user_id: Joi.string().optional(),
    event_id: Joi.string().optional(),
    source: Joi.string().optional(),
  }).required(),
  incident_id: Joi.string().optional(),
  alert_id: Joi.string().optional(),
  variables: Joi.object().optional(),
  metadata: Joi.object().optional(),
});

const decisionSchema = Joi.object({
  decision_point: Joi.string().required(),
  condition: Joi.object().required(),
  true_path: Joi.array().items(Joi.string()).required(),
  false_path: Joi.array().items(Joi.string()).required(),
  evaluation_order: Joi.number().min(0).required(),
});

const testPlaybookSchema = Joi.object({
  test_type: Joi.string().required().valid('dry_run', 'simulation', 'validation', 'performance'),
  test_environment: Joi.string().default('sandbox'),
  test_data: Joi.object().optional(),
  validation_checks: Joi.array().items(Joi.string()).optional(),
});

module.exports = {
  playbookSchema,
  playbookUpdateSchema,
  executePlaybookSchema,
  decisionSchema,
  testPlaybookSchema,
};
