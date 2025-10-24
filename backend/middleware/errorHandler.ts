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

import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
} from './errors';

/**
 * Mongoose validation error type definition.
 *
 * Represents errors thrown by Mongoose when document validation fails.
 * Contains detailed information about each field that failed validation.
 *
 * @interface MongooseValidationError
 * @extends Error
 *
 * @property {Object.<string, {path: string, message: string}>} errors - Map of validation errors keyed by field path
 * @property {string} errors[].path - The field path that failed validation
 * @property {string} errors[].message - Human-readable validation error message
 *
 * @example
 * ```typescript
 * // Example Mongoose validation error structure
 * {
 *   name: 'ValidationError',
 *   message: 'Validation failed',
 *   errors: {
 *     email: {
 *       path: 'email',
 *       message: 'Email is required'
 *     },
 *     age: {
 *       path: 'age',
 *       message: 'Age must be a positive number'
 *     }
 *   }
 * }
 * ```
 */
interface MongooseValidationError extends Error {
  errors: {
    [key: string]: {
      path: string;
      message: string;
    };
  };
}

/**
 * Mongoose cast error type definition.
 *
 * Thrown when Mongoose cannot cast a value to the expected type,
 * most commonly when an invalid ObjectId is provided.
 *
 * @interface MongooseCastError
 * @extends Error
 *
 * @property {string} path - The field path where the cast error occurred
 * @property {unknown} value - The value that failed to cast
 *
 * @example
 * ```typescript
 * // Example when invalid ObjectId is provided
 * {
 *   name: 'CastError',
 *   message: 'Cast to ObjectId failed',
 *   path: '_id',
 *   value: 'invalid-id-123'
 * }
 * ```
 */
interface MongooseCastError extends Error {
  path: string;
  value: unknown;
}

/**
 * MongoDB driver error type definition.
 *
 * Represents errors thrown by the MongoDB driver, including
 * duplicate key violations (code 11000) and other database-level errors.
 *
 * @interface MongoDbError
 * @extends Error
 *
 * @property {number} code - MongoDB error code (e.g., 11000 for duplicate key)
 * @property {Record<string, unknown>} keyPattern - Pattern of the index that caused the error
 *
 * @example
 * ```typescript
 * // Example duplicate key error (code 11000)
 * {
 *   name: 'MongoError',
 *   message: 'E11000 duplicate key error',
 *   code: 11000,
 *   keyPattern: { email: 1 }
 * }
 * ```
 */
interface MongoDbError extends Error {
  code: number;
  keyPattern: Record<string, unknown>;
}

/**
 * Type guard to check if an error is a Mongoose validation error.
 *
 * Performs runtime type checking to determine if an unknown error
 * object is a MongooseValidationError with the expected structure.
 *
 * @param {unknown} error - The error object to check
 * @returns {boolean} True if error is a MongooseValidationError, false otherwise
 *
 * @example
 * ```typescript
 * try {
 *   await user.save();
 * } catch (error: unknown) {
 *   if (isMongooseValidationError(error)) {
 *     // TypeScript now knows error has 'errors' property
 *     console.log(error.errors);
 *   }
 * }
 * ```
 */
function isMongooseValidationError(error: unknown): error is MongooseValidationError {
  return (
    error instanceof Error
    && error.name === 'ValidationError'
    && 'errors' in error
    && typeof error.errors === 'object'
  );
}

/**
 * Type guard to check if an error is a Mongoose cast error.
 *
 * Validates whether an error represents a type casting failure,
 * typically occurring with invalid ObjectId values or type mismatches.
 *
 * @param {unknown} error - The error object to check
 * @returns {boolean} True if error is a MongooseCastError, false otherwise
 *
 * @example
 * ```typescript
 * try {
 *   const user = await User.findById('invalid-id');
 * } catch (error: unknown) {
 *   if (isMongooseCastError(error)) {
 *     // TypeScript now knows error has 'path' and 'value' properties
 *     console.log(`Invalid ${error.path}: ${error.value}`);
 *   }
 * }
 * ```
 */
function isMongooseCastError(error: unknown): error is MongooseCastError {
  return (
    error instanceof Error
    && error.name === 'CastError'
    && 'path' in error
    && 'value' in error
  );
}

/**
 * Type guard to check if an error is a MongoDB driver error.
 *
 * Identifies errors originating from the MongoDB driver, particularly
 * useful for detecting duplicate key violations (code 11000) and other
 * database-level constraint violations.
 *
 * @param {unknown} error - The error object to check
 * @returns {boolean} True if error is a MongoDbError, false otherwise
 *
 * @example
 * ```typescript
 * try {
 *   await User.create({ email: 'existing@example.com' });
 * } catch (error: unknown) {
 *   if (isMongoDbError(error) && error.code === 11000) {
 *     // TypeScript now knows error has 'code' and 'keyPattern' properties
 *     const field = Object.keys(error.keyPattern)[0];
 *     console.log(`Duplicate value for ${field}`);
 *   }
 * }
 * ```
 */
function isMongoDbError(error: unknown): error is MongoDbError {
  return (
    error instanceof Error
    && 'code' in error
    && typeof (error as any).code === 'number'
    && 'keyPattern' in error
  );
}

/**
 * Centralized error handler middleware for Express applications.
 *
 * Processes all errors thrown in the application, transforming them into
 * standardized JSON responses with appropriate HTTP status codes. Handles
 * various error types including custom application errors, Mongoose errors,
 * MongoDB errors, and JWT authentication errors.
 *
 * **Error Processing Flow**:
 * 1. Identifies and transforms database-specific errors (Mongoose, MongoDB)
 * 2. Handles JWT authentication errors (expired tokens, invalid tokens)
 * 3. Extracts status codes and operational flags from custom errors
 * 4. Logs errors with contextual information (correlation ID, user, request details)
 * 5. Constructs standardized error response with conditional details
 * 6. Sends JSON response with appropriate HTTP status code
 *
 * **Error Response Format**:
 * - `status`: Always "error"
 * - `statusCode`: HTTP status code (400-599)
 * - `message`: Human-readable error message
 * - `correlationId`: Request correlation ID for tracing
 * - `timestamp`: ISO 8601 timestamp
 * - `details`: Additional error details (development mode or operational errors only)
 * - `stack`: Stack trace (development mode only)
 *
 * @param {Error} err - The error object to process
 * @param {Request} req - Express request object with correlation ID and user context
 * @param {Response} res - Express response object for sending error response
 * @param {NextFunction} _next - Express next function (unused, required by Express signature)
 *
 * @returns {void} Sends JSON response directly to client
 *
 * @example
 * ```typescript
 * // In Express app setup
 * app.use(errorHandler);
 *
 * // Custom application error
 * throw new ValidationError('Email is required');
 * // Response: { status: 'error', statusCode: 400, message: 'Email is required', ... }
 *
 * // Mongoose validation error
 * await user.save(); // throws validation error
 * // Response: { status: 'error', statusCode: 400, message: 'Validation failed', details: [...] }
 *
 * // JWT expired token
 * jwt.verify(token, secret); // throws TokenExpiredError
 * // Response: { status: 'error', statusCode: 401, message: 'Token expired', ... }
 * ```
 *
 * @remarks
 * - Logs errors at ERROR level (5xx) or WARN level (4xx)
 * - Includes stack traces only in development environment
 * - Uses correlation IDs for distributed tracing
 * - Transforms Mongoose/MongoDB errors to custom AppError instances
 * - Server errors (500+) include full context in logs
 * - Client errors (400-499) include basic request metadata only
 */
function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Set default values
  let error = err as AppError; // Cast to AppError to access custom properties

  // Handle Mongoose validation errors
  if (isMongooseValidationError(err)) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = new ValidationError('Validation failed', details);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (isMongooseCastError(err)) {
    error = new ValidationError(`Invalid ${err.path}: ${err.value}`);
  }

  // Handle MongoDB duplicate key error
  if (isMongoDbError(err) && err.code === 11000) {
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
  const errorResponse: any = {
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
 * HTTP 404 Not Found handler middleware.
 *
 * Catches all requests to routes that don't match any defined endpoints
 * and forwards a NotFoundError to the error handling middleware.
 *
 * This middleware should be registered AFTER all valid route handlers
 * to act as a catch-all for unmatched routes.
 *
 * @param {Request} req - Express request object containing the unmatched route
 * @param {Response} res - Express response object (unused, passed to error handler)
 * @param {NextFunction} next - Express next function to forward error to error handler
 *
 * @returns {void} Forwards NotFoundError to next middleware (error handler)
 *
 * @example
 * ```typescript
 * // In Express app setup (register AFTER all routes)
 * app.get('/api/v1/users', userController.list);
 * app.post('/api/v1/users', userController.create);
 *
 * // Register 404 handler after all routes
 * app.use(notFoundHandler);
 *
 * // Register error handler last
 * app.use(errorHandler);
 *
 * // Request to undefined route
 * GET /api/v1/invalid-route
 * // Response: { status: 'error', statusCode: 404, message: 'Route not found', ... }
 * ```
 *
 * @see {@link errorHandler} for error processing and response formatting
 * @see {@link NotFoundError} for the error class used
 */
function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new NotFoundError('Route');
  next(error);
}

/**
 * Higher-order function that wraps async route handlers to catch rejected promises.
 *
 * Eliminates the need for try-catch blocks in async route handlers by automatically
 * catching any errors and forwarding them to Express error handling middleware.
 * Works with both async functions that return promises and synchronous functions.
 *
 * **Why This Is Needed**:
 * Express does not automatically catch errors from async functions. Without this
 * wrapper, unhandled promise rejections would cause the server to crash or leave
 * the request hanging without a response.
 *
 * @param {Function} fn - Async or sync route handler function to wrap
 * @param {Request} fn.req - Express request object
 * @param {Response} fn.res - Express response object
 * @param {NextFunction} fn.next - Express next function
 *
 * @returns {Function} Wrapped handler that catches errors and forwards to error middleware
 *
 * @example
 * ```typescript
 * // Without asyncHandler (requires manual try-catch)
 * app.get('/users/:id', async (req, res, next) => {
 *   try {
 *     const user = await User.findById(req.params.id);
 *     res.json(user);
 *   } catch (error) {
 *     next(error); // Manual error forwarding
 *   }
 * });
 *
 * // With asyncHandler (automatic error catching)
 * app.get('/users/:id', asyncHandler(async (req, res) => {
 *   const user = await User.findById(req.params.id);
 *   if (!user) {
 *     throw new NotFoundError('User'); // Automatically caught and forwarded
 *   }
 *   res.json(user);
 * }));
 *
 * // Also works with synchronous handlers
 * app.get('/config', asyncHandler((req, res) => {
 *   const config = getConfig(); // Sync operation
 *   res.json(config);
 * }));
 * ```
 *
 * @remarks
 * - Use this wrapper for ALL async route handlers to ensure proper error handling
 * - Works with both Promise-returning and non-Promise functions via Promise.resolve()
 * - Errors are forwarded to the error handler middleware via next()
 * - Prevents unhandled promise rejections that could crash the application
 *
 * @see {@link errorHandler} for processing of caught errors
 */
function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export {
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
