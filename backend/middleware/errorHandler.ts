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

import { logger } from '../utils/logger';
import type { Request, Response, NextFunction } from 'express';
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

// Type guards for error properties
interface MongooseValidationError extends Error {
  errors: {
    [key: string]: {
      path: string;
      message: string;
    };
  };
}

interface MongooseCastError extends Error {
  path: string;
  value: unknown;
}

interface MongoDbError extends Error {
  code: number;
  keyPattern: Record<string, unknown>;
}

function isMongooseValidationError(error: unknown): error is MongooseValidationError {
  return (
    error instanceof Error &&
    error.name === 'ValidationError' &&
    'errors' in error &&
    typeof error.errors === 'object'
  );
}

function isMongooseCastError(error: unknown): error is MongooseCastError {
  return (
    error instanceof Error &&
    error.name === 'CastError' &&
    'path' in error &&
    'value' in error
  );
}

function isMongoDbError(error: unknown): error is MongoDbError {
  return (
    error instanceof Error &&
    'code' in error &&
    typeof (error as any).code === 'number' &&
    'keyPattern' in error
  );
}

/**
 * Error Handler Middleware
 * Central error processing for all application errors
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
  if (process.env['NODE_ENV'] === 'development' || isOperational) {
    if (error.details) {
      errorResponse.details = error.details;
    }
  }

  // Add stack trace in development
  if (process.env['NODE_ENV'] === 'development') {
    errorResponse.stack = error.stack;
  }

  // Send response
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found Handler
 * Catches all unmatched routes
 */
function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new NotFoundError('Route');
  next(error);
}

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
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
