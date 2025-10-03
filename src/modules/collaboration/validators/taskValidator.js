/**
 * Task validation schemas
 */

const Joi = require('joi');

const taskSchema = Joi.object({
  title: Joi.string().required().trim().min(3)
    .max(200),
  description: Joi.string().required().min(10),
  status: Joi.string().valid(
    'todo',
    'in_progress',
    'in_review',
    'blocked',
    'completed',
    'cancelled',
  ).default('todo'),
  priority: Joi.string().valid('critical', 'high', 'medium', 'low').default('medium'),
  assigned_to: Joi.string().optional(),
  due_date: Joi.date().iso().optional(),
  workspace_id: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).optional(),
  dependencies: Joi.array().items(
    Joi.object({
      task_id: Joi.string().required(),
      dependency_type: Joi.string().valid('blocks', 'blocked_by', 'related_to').default('blocks'),
    }),
  ).optional(),
  progress: Joi.number().min(0).max(100).default(0),
  subtasks: Joi.array().items(
    Joi.object({
      title: Joi.string().required(),
      completed: Joi.boolean().default(false),
    }),
  ).optional(),
  metadata: Joi.object().optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200)
    .optional(),
  description: Joi.string().min(10).optional(),
  status: Joi.string().valid(
    'todo',
    'in_progress',
    'in_review',
    'blocked',
    'completed',
    'cancelled',
  ).optional(),
  priority: Joi.string().valid('critical', 'high', 'medium', 'low').optional(),
  assigned_to: Joi.string().optional(),
  due_date: Joi.date().iso().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  dependencies: Joi.array().items(
    Joi.object({
      task_id: Joi.string().required(),
      dependency_type: Joi.string().valid('blocks', 'blocked_by', 'related_to').default('blocks'),
    }),
  ).optional(),
  progress: Joi.number().min(0).max(100).optional(),
  subtasks: Joi.array().items(
    Joi.object({
      id: Joi.string().optional(),
      title: Joi.string().required(),
      completed: Joi.boolean().default(false),
    }),
  ).optional(),
  metadata: Joi.object().optional(),
});

const addCommentSchema = Joi.object({
  content: Joi.string().required().min(1).max(5000),
});

module.exports = {
  taskSchema,
  updateTaskSchema,
  addCommentSchema,
};
