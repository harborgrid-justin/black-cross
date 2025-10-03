/**
 * Task validation schemas
 */

const Joi = require('joi');

const taskSchema = Joi.object({
  title: Joi.string().required().trim().min(3)
    .max(200),
  description: Joi.string().trim().max(2000).optional(),
  status: Joi.string().valid('todo', 'in-progress', 'review', 'blocked', 'completed', 'cancelled').default('todo'),
  priority: Joi.string().valid('critical', 'high', 'medium', 'low').default('medium'),
  assigned_to: Joi.string().optional(),
  created_by: Joi.string().optional(),
  due_date: Joi.date().greater('now').optional(),
  workspace_id: Joi.string().required(),
  parent_task_id: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  dependencies: Joi.array().items(
    Joi.object({
      task_id: Joi.string().required(),
      type: Joi.string().valid('blocks', 'blocked_by', 'relates_to').default('relates_to'),
    }),
  ).optional(),
  estimated_hours: Joi.number().min(0).optional(),
  checklist: Joi.array().items(
    Joi.object({
      item: Joi.string().required(),
    }),
  ).optional(),
  template_id: Joi.string().optional(),
  metadata: Joi.object().optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200)
    .optional(),
  description: Joi.string().trim().max(2000).optional(),
  status: Joi.string().valid('todo', 'in-progress', 'review', 'blocked', 'completed', 'cancelled').optional(),
  priority: Joi.string().valid('critical', 'high', 'medium', 'low').optional(),
  assigned_to: Joi.string().optional(),
  due_date: Joi.date().optional(),
  progress: Joi.number().min(0).max(100).optional(),
  actual_hours: Joi.number().min(0).optional(),
  metadata: Joi.object().optional(),
});

const addCommentSchema = Joi.object({
  content: Joi.string().required().trim().min(1)
    .max(2000),
});

module.exports = {
  taskSchema,
  updateTaskSchema,
  addCommentSchema,
};
