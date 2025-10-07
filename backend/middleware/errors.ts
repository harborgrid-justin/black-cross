/**
 * Custom Error Classes
 * Handles enterprise-grade error management
 * for production systems
 */

/* eslint-disable max-classes-per-file */

// TypeScript interfaces for error details
interface ErrorDetails {
  field?: string;
  message: string;
  type?: string;
  [key: string]: unknown;
}

/**
 * Custom Application Error Class
 */
class AppError extends Error {
  public statusCode: number;

  public isOperational: boolean;

  public details: ErrorDetails[] | null;

  public timestamp: string;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true, details: ErrorDetails[] | null = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error
 */
class ValidationError extends AppError {
  constructor(message: string, details: ErrorDetails[] | null = null) {
    super(message, 400, true, details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error
 */
class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, true);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error
 */
class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, true);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error
 */
class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, true);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error
 */
class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, true);
    this.name = 'ConflictError';
  }
}

/**
 * Rate Limit Error
 */
class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, true);
    this.name = 'RateLimitError';
  }
}

/**
 * Database Error
 */
class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details: ErrorDetails[] | null = null) {
    super(message, 500, false, details);
    this.name = 'DatabaseError';
  }
}

/**
 * External Service Error
 */
class ExternalServiceError extends AppError {
  constructor(service: string, message: string = 'External service error', details: ErrorDetails[] | null = null) {
    super(`${service}: ${message}`, 502, false, details);
    this.name = 'ExternalServiceError';
  }
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
};
