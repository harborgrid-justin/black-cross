/**
 * HTTP Constants
 * Status codes, headers, and error messages
 */

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * HTTP Methods
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

/**
 * Common HTTP Headers
 */
export const HTTP_HEADERS = {
  AUTHORIZATION: 'authorization',
  CONTENT_TYPE: 'content-type',
  ACCEPT: 'accept',
  USER_AGENT: 'user-agent',
  X_REQUEST_ID: 'x-request-id',
  X_CORRELATION_ID: 'x-correlation-id',
  X_RATE_LIMIT_LIMIT: 'x-ratelimit-limit',
  X_RATE_LIMIT_REMAINING: 'x-ratelimit-remaining',
  X_RATE_LIMIT_RESET: 'x-ratelimit-reset',
  RETRY_AFTER: 'retry-after',
} as const;

/**
 * Content Types
 */
export const CONTENT_TYPE = {
  JSON: 'application/json',
  XML: 'application/xml',
  HTML: 'text/html',
  TEXT: 'text/plain',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  MULTIPART_FORM_DATA: 'multipart/form-data',
  PROMETHEUS: 'text/plain; version=0.0.4',
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  NOT_FOUND: 'Not Found',
  RESOURCE_NOT_FOUND: 'The requested resource was not found',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  BAD_REQUEST: 'Bad Request',
  VALIDATION_FAILED: 'Request validation failed',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',

  // Authentication
  NO_TOKEN: 'No authentication token provided',
  INVALID_TOKEN: 'Invalid authentication token',
  TOKEN_EXPIRED: 'Authentication token has expired',
  AUTHENTICATION_REQUIRED: 'Authentication required',

  // Authorization
  ACCESS_DENIED: 'Access denied',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',

  // Database
  DATABASE_ERROR: 'Database operation failed',
  DUPLICATE_ENTRY: 'Resource already exists',

  // Validation
  INVALID_INPUT: 'Invalid input data',
  MISSING_REQUIRED_FIELD: 'Missing required field',
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  RETRIEVED: 'Resource retrieved successfully',
} as const;
