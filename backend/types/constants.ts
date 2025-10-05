/**
 * Global constants for Black-Cross backend
 * Following naming convention: UPPER_SNAKE_CASE for constants
 */

/**
 * API configuration constants
 */
export const API_VERSION: string = 'v1';
export const API_PREFIX: string = '/api';
export const DEFAULT_PAGE_SIZE: number = 20;
export const MAX_PAGE_SIZE: number = 100;
export const MIN_PAGE_SIZE: number = 1;

/**
 * Cache configuration constants
 */
export const CACHE_TTL_SHORT: number = 60; // 1 minute in seconds
export const CACHE_TTL_MEDIUM: number = 300; // 5 minutes in seconds
export const CACHE_TTL_LONG: number = 3600; // 1 hour in seconds

/**
 * Rate limiting constants
 */
export const RATE_LIMIT_WINDOW: number = 900000; // 15 minutes in milliseconds
export const RATE_LIMIT_MAX_REQUESTS: number = 100;

/**
 * Token expiration constants
 */
export const TOKEN_EXPIRATION_SHORT: string = '1h';
export const TOKEN_EXPIRATION_MEDIUM: string = '24h';
export const TOKEN_EXPIRATION_LONG: string = '7d';

/**
 * HTTP status codes (for reference)
 */
export const HTTP_STATUS_OK: number = 200;
export const HTTP_STATUS_CREATED: number = 201;
export const HTTP_STATUS_BAD_REQUEST: number = 400;
export const HTTP_STATUS_UNAUTHORIZED: number = 401;
export const HTTP_STATUS_FORBIDDEN: number = 403;
export const HTTP_STATUS_NOT_FOUND: number = 404;
export const HTTP_STATUS_INTERNAL_SERVER_ERROR: number = 500;

/**
 * Validation constants
 */
export const MIN_PASSWORD_LENGTH: number = 8;
export const MAX_PASSWORD_LENGTH: number = 128;
export const MIN_USERNAME_LENGTH: number = 3;
export const MAX_USERNAME_LENGTH: number = 50;

/**
 * File upload constants
 */
export const MAX_FILE_SIZE: number = 10485760; // 10MB in bytes
export const ALLOWED_FILE_TYPES: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
] as const;

/**
 * Logging constants
 */
export const LOG_LEVEL_DEBUG: string = 'debug';
export const LOG_LEVEL_INFO: string = 'info';
export const LOG_LEVEL_WARN: string = 'warn';
export const LOG_LEVEL_ERROR: string = 'error';
