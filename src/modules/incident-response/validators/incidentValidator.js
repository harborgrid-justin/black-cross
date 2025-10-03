/**
 * Incident Validators
 * Input validation schemas for incident operations
 */

const Joi = require('joi');
const { IncidentStatus, IncidentPriority, IncidentSeverity } = require('../models');

/**
 * Create incident validation schema
 */
const createIncidentSchema = Joi.object({
  title: Joi.string().required().min(3).max(200),
  description: Joi.string().required().min(10).max(5000),
  priority: Joi.string().valid(...Object.values(IncidentPriority)).default(IncidentPriority.MEDIUM),
  severity: Joi.string().valid(...Object.values(IncidentSeverity)).default(IncidentSeverity.MEDIUM),
  category: Joi.string().required().min(3).max(100),
  assigned_to: Joi.string().optional(),
  reported_by: Joi.string().required(),
  affected_assets: Joi.array().items(Joi.string()).optional(),
  related_threats: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  custom_fields: Joi.object().optional(),
  sla: Joi.object({
    response_time: Joi.number().integer().positive(),
    resolution_time: Joi.number().integer().positive()
  }).optional()
});

/**
 * Update incident validation schema
 */
const updateIncidentSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  description: Joi.string().min(10).max(5000),
  status: Joi.string().valid(...Object.values(IncidentStatus)),
  priority: Joi.string().valid(...Object.values(IncidentPriority)),
  severity: Joi.string().valid(...Object.values(IncidentSeverity)),
  category: Joi.string().min(3).max(100),
  assigned_to: Joi.string().allow(null),
  affected_assets: Joi.array().items(Joi.string()),
  related_threats: Joi.array().items(Joi.string()),
  tags: Joi.array().items(Joi.string()),
  custom_fields: Joi.object()
}).min(1);

/**
 * List incidents query validation schema
 */
const listIncidentsSchema = Joi.object({
  status: Joi.string().valid(...Object.values(IncidentStatus)),
  priority: Joi.string().valid(...Object.values(IncidentPriority)),
  severity: Joi.string().valid(...Object.values(IncidentSeverity)),
  category: Joi.string(),
  assigned_to: Joi.string(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

/**
 * Reopen incident validation schema
 */
const reopenIncidentSchema = Joi.object({
  reason: Joi.string().required().min(10).max(500)
});

/**
 * Link incidents validation schema
 */
const linkIncidentsSchema = Joi.object({
  related_incident_id: Joi.string().required()
});

module.exports = {
  createIncidentSchema,
  updateIncidentSchema,
  listIncidentsSchema,
  reopenIncidentSchema,
  linkIncidentsSchema
};
