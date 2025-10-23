/**
 * Incident Validators
 * Input validation schemas
 */

import Joi from 'joi';

const incidentValidator = {
  createIncident: Joi.object({
    title: Joi.string().required().min(5).max(200),
    description: Joi.string().required().min(10),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
    category: Joi.string().valid(
      'malware',
      'phishing',
      'data_breach',
      'ddos',
      'unauthorized_access',
      'insider_threat',
      'ransomware',
      'other',
    ).required(),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
    reported_by: Joi.string().required(),
    assigned_to: Joi.string(),
    affected_assets: Joi.array().items(Joi.object({
      asset_id: Joi.string().required(),
      asset_name: Joi.string().required(),
      asset_type: Joi.string(),
      criticality: Joi.string().valid('low', 'medium', 'high', 'critical'),
    })),
    related_threats: Joi.array().items(Joi.object({
      threat_id: Joi.string().required(),
      threat_name: Joi.string(),
      relevance: Joi.number().min(0).max(100),
    })),
    auto_prioritize: Joi.boolean(),
    auto_trigger_workflows: Joi.boolean(),
    tags: Joi.array().items(Joi.string()),
  }),

  updateIncident: Joi.object({
    title: Joi.string().min(5).max(200),
    description: Joi.string().min(10),
    status: Joi.string().valid(
      'new',
      'investigating',
      'contained',
      'eradicated',
      'recovering',
      'resolved',
      'closed',
    ),
    priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical'),
    assigned_to: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  }),

  addEvidence: Joi.object({
    type: Joi.string().valid(
      'file',
      'log',
      'screenshot',
      'pcap',
      'memory_dump',
      'disk_image',
      'network_traffic',
      'other',
    ).required(),
    file_path: Joi.string(),
    file_size: Joi.number(),
    hash: Joi.object({
      md5: Joi.string(),
      sha1: Joi.string(),
      sha256: Joi.string(),
    }),
    description: Joi.string(),
    collected_by: Joi.string().required(),
  }),

  createPostMortem: Joi.object({
    root_cause: Joi.string().required().min(20),
    lessons_learned: Joi.array().items(Joi.string()).required(),
    recommendations: Joi.array().items(Joi.string()),
  }),

  sendNotification: Joi.object({
    recipient: Joi.string().required(),
    channel: Joi.string().valid('email', 'slack', 'teams', 'sms', 'pagerduty'),
    message: Joi.string(),
  }),

  executeWorkflow: Joi.object({
    workflow_id: Joi.string().required(),
  }),
};

export default incidentValidator;
