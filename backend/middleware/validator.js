/**
 * Request Validation Middleware
 * Validates requests using Joi schemas
 *
 * Features:
 * - Body, query, and params validation
 * - Detailed validation error messages
 * - Sanitization of input data
 * - Support for custom validation rules
 */

const Joi = require('joi');
const { ValidationError } = require('./errorHandler');

/**
 * Validate request data against Joi schema
 * @param {Object} schema - Joi validation schemas
 * @param {Joi.Schema} schema.body - Body validation schema
 * @param {Joi.Schema} schema.query - Query validation schema
 * @param {Joi.Schema} schema.params - Params validation schema
 */
function validate(schema) {
  return (req, res, next) => {
    const errors = [];

    // Validate body
    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        errors.push(...error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type,
        })));
      } else {
        req.body = value;
      }
    }

    // Validate query
    if (schema.query) {
      const { error, value } = schema.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        errors.push(...error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type,
        })));
      } else {
        req.query = value;
      }
    }

    // Validate params
    if (schema.params) {
      const { error, value } = schema.params.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        errors.push(...error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type,
        })));
      } else {
        req.params = value;
      }
    }

    // Return errors if any
    if (errors.length > 0) {
      return next(new ValidationError('Request validation failed', errors));
    }

    next();
  };
}

/**
 * Common validation schemas
 */
const commonSchemas = {
  // MongoDB ObjectId validation
  objectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ID format'),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100)
      .default(20),
    sort: Joi.string(),
    order: Joi.string().valid('asc', 'desc').default('asc'),
  }),

  // Search
  search: Joi.object({
    q: Joi.string().min(1).max(500),
  }),

  // Date range
  dateRange: Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
  }),
};

module.exports = {
  validate,
  commonSchemas,
  Joi,
};
