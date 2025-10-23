/**
 * Collaboration Validation Schemas
 */

import Joi from 'joi';

// Create/Update collaboration item schema
const collaborationSchema = Joi.object({
  title: Joi.string().min(3).max(500).required(),
  description: Joi.string().optional(),
  type: Joi.string().valid('investigation', 'analysis', 'discussion', 'review', 'task', 'other').default('other'),
  status: Joi.string().valid('open', 'in_progress', 'completed', 'archived').default('open'),
  priority: Joi.string().valid('critical', 'high', 'medium', 'low').default('medium'),
  participants: Joi.array().items(Joi.string()).optional(),
  assigned_to: Joi.string().optional(),
  related_items: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    id: Joi.string().required(),
  })).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  due_date: Joi.date().iso().optional(),
}).min(1);

// Update collaboration item schema (partial)
const collaborationUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(500).optional(),
  description: Joi.string().optional(),
  type: Joi.string().valid('investigation', 'analysis', 'discussion', 'review', 'task', 'other').optional(),
  status: Joi.string().valid('open', 'in_progress', 'completed', 'archived').optional(),
  priority: Joi.string().valid('critical', 'high', 'medium', 'low').optional(),
  participants: Joi.array().items(Joi.string()).optional(),
  assigned_to: Joi.string().optional(),
  related_items: Joi.array().items(Joi.object({
    type: Joi.string().required(),
    id: Joi.string().required(),
  })).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  due_date: Joi.date().iso().optional(),
}).min(1);

export default {
  collaborationSchema,
  collaborationUpdateSchema,
};
