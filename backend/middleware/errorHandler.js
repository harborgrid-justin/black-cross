/**
 * Centralized Error Handling Middleware
 * Enterprise-grade error handling for production systems
 *
 * Features:
 * - Custom error classes with proper status codes
 * - Structured error responses
 * - Error logging with context
 * - Stack traces in development only
 * - Correlation ID tracking
 */

const { logger } = require('../utils/logger');
const {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
} = require('./errors');

/**
 * Error Handler Middleware
 * Central error processing for all application errors
 */
function errorHandler(err, req, res, _next) {
  // Set default values
  let error = err;

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError' && err.errors) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = new ValidationError('Validation failed', details);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    error = new ValidationError(`Invalid ${err.path}: ${err.value}`);
  }

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = new ConflictError(`Duplicate value for field: ${field}`);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Token expired');
  }

  // Default to 500 if no status code
  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational || false;

  // Log error
  const logContext = {
    statusCode,
    path: req.path,
    method: req.method,
    correlationId: req.correlationId,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  };

  if (statusCode >= 500) {
    logger.error(error.message, {
      ...logContext,
      stack: error.stack,
      details: error.details,
      isOperational,
    });
  } else {
    logger.warn(error.message, logContext);
  }

  // Build error response
  const errorResponse = {
    status: 'error',
    statusCode,
    message: error.message,
    correlationId: req.correlationId,
    timestamp: error.timestamp || new Date().toISOString(),
  };

  // Add details in development or for operational errors
  if (process.env.NODE_ENV === 'development' || isOperational) {
    if (error.details) {
      errorResponse.details = error.details;
    }
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  // Send response
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found Handler
 * Catches all unmatched routes
 */
function notFoundHandler(req, res, next) {
  const error = new NotFoundError('Route');
  next(error);
}

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
