/**
 * Workflow Validators
 * Input validation schemas for workflow operations
 */

const Joi = require('joi');

/**
 * Create workflow validation schema
 */
const createWorkflowSchema = Joi.object({
  name: Joi.string().required().min(3).max(200),
  description: Joi.string().required().min(10).max(1000),
  tasks: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      action: Joi.string().required(),
      parameters: Joi.object().optional(),
      requires_approval: Joi.boolean().default(false),
      timeout: Joi.number().integer().positive().default(300000),
      max_retries: Joi.number().integer().min(0).max(10).default(3)
    })
  ).min(1).required(),
  metadata: Joi.object().optional()
});

/**
 * Execute workflow validation schema
 */
const executeWorkflowSchema = Joi.object({
  workflow_id: Joi.string().required()
});

/**
 * Approve task validation schema
 */
const approveTaskSchema = Joi.object({
  task_id: Joi.string().required(),
  approved: Joi.boolean().required(),
  notes: Joi.string().max(500).optional()
});

module.exports = {
  createWorkflowSchema,
  executeWorkflowSchema,
  approveTaskSchema
};
