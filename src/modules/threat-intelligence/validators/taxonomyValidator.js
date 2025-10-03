/**
 * Taxonomy validation schemas
 */

const Joi = require('joi');

const categorySchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(100),
  description: Joi.string().optional(),
  level: Joi.number().min(1).default(1),
  parent_category_id: Joi.string().optional(),
  attributes: Joi.object().optional()
});

const taxonomySchema = Joi.object({
  name: Joi.string().required().trim().min(3).max(100),
  description: Joi.string().required().min(10),
  version: Joi.string().default('1.0.0'),
  type: Joi.string().valid('category', 'framework', 'custom').default('custom'),
  parent_id: Joi.string().optional(),
  categories: Joi.array().items(categorySchema).optional(),
  mappings: Joi.array().items(
    Joi.object({
      framework: Joi.string().valid('mitre_attack', 'kill_chain', 'diamond_model', 'stix', 'veris'),
      external_id: Joi.string().required(),
      mapping_type: Joi.string().valid('exact', 'similar', 'related', 'broader', 'narrower').default('exact')
    })
  ).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  is_default: Joi.boolean().default(false),
  created_by: Joi.string().required(),
  metadata: Joi.object().optional()
});

const taxonomyUpdateSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).optional(),
  description: Joi.string().min(10).optional(),
  version: Joi.string().optional(),
  categories: Joi.array().items(categorySchema).optional(),
  mappings: Joi.array().items(
    Joi.object({
      framework: Joi.string().valid('mitre_attack', 'kill_chain', 'diamond_model', 'stix', 'veris'),
      external_id: Joi.string().required(),
      mapping_type: Joi.string().valid('exact', 'similar', 'related', 'broader', 'narrower')
    })
  ).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  is_active: Joi.boolean().optional(),
  updated_by: Joi.string().required()
});

module.exports = {
  taxonomySchema,
  taxonomyUpdateSchema,
  categorySchema
};
