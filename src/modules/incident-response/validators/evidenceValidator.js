/**
 * Evidence Validators
 * Input validation schemas for evidence operations
 */

const Joi = require('joi');
const { EvidenceType } = require('../models');

/**
 * Collect evidence validation schema
 */
const collectEvidenceSchema = Joi.object({
  incident_id: Joi.string().required(),
  type: Joi.string().valid(...Object.values(EvidenceType)).required(),
  name: Joi.string().required().min(3).max(200),
  description: Joi.string().required().min(10).max(2000),
  file_path: Joi.string().optional(),
  file_size: Joi.number().integer().positive().optional(),
  file_hash_md5: Joi.string().length(32).optional(),
  file_hash_sha256: Joi.string().length(64).optional(),
  source: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.object().optional()
});

/**
 * Transfer custody validation schema
 */
const transferCustodySchema = Joi.object({
  to_user_id: Joi.string().required(),
  notes: Joi.string().max(500).optional()
});

/**
 * Tag evidence validation schema
 */
const tagEvidenceSchema = Joi.object({
  tags: Joi.array().items(Joi.string()).min(1).required()
});

/**
 * Delete evidence validation schema
 */
const deleteEvidenceSchema = Joi.object({
  reason: Joi.string().required().min(10).max(500)
});

/**
 * Search evidence validation schema
 */
const searchEvidenceSchema = Joi.object({
  query: Joi.string().optional(),
  type: Joi.string().valid(...Object.values(EvidenceType)).optional(),
  incident_id: Joi.string().optional(),
  collected_by: Joi.string().optional(),
  verified: Joi.boolean().optional()
});

module.exports = {
  collectEvidenceSchema,
  transferCustodySchema,
  tagEvidenceSchema,
  deleteEvidenceSchema,
  searchEvidenceSchema
};
