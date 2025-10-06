/**
 * Correlation ID Middleware
 * Adds unique correlation IDs to requests for distributed tracing
 *
 * Features:
 * - Generate or extract correlation ID from headers
 * - Add to request context
 * - Add to response headers
 * - Enable end-to-end request tracking
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Correlation ID Middleware
 * Assigns a unique ID to each request for tracing
 */
function correlationId(req, res, next) {
  // Try to get correlation ID from header, or generate new one
  const requestCorrelationId = req.get('x-correlation-id')
                        || req.get('x-request-id')
                        || uuidv4();

  // Attach to request
  req.correlationId = requestCorrelationId;

  // Add to response headers
  res.set('x-correlation-id', requestCorrelationId);

  next();
}

module.exports = correlationId;
