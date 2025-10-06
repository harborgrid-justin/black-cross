/**
 * Request Logger Middleware
 * Logs all HTTP requests with detailed context
 *
 * Features:
 * - Request and response logging
 * - Response time tracking
 * - Correlation ID integration
 * - Structured logging format
 */

const { logger } = require('../utils/logger');

/**
 * Request Logger Middleware
 * Logs HTTP request details
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Log incoming request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    correlationId: req.correlationId,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    res.send = originalSend;

    const responseTime = Date.now() - startTime;

    // Log response
    const logLevel = res.statusCode >= 500 ? 'error'
      : res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel]('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      correlationId: req.correlationId,
      userId: req.user?.id,
    });

    return res.send(data);
  };

  next();
}

module.exports = requestLogger;
