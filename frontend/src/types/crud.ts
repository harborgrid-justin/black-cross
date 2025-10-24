/**
 * Shared TypeScript Type Definitions for CRUD Operations
 *
 * This file provides common types used across all CRUD operations in the Black-Cross platform.
 * It promotes type safety, reduces duplication, and ensures consistency.
 */

/**
 * Error codes for structured error handling
 */
export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'SERVER_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN_ERROR';

/**
 * Structured error detail for comprehensive error handling
 */
export interface ErrorDetail {
  /**
   * Error code for programmatic handling
   */
  code: ErrorCode;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * HTTP status code (if applicable)
   */
  statusCode?: number;

  /**
   * Timestamp when the error occurred
   */
  timestamp: Date;

  /**
   * Whether this error is retryable
   */
  retryable: boolean;

  /**
   * Field-level validation errors
   * Maps field names to array of error messages
   */
  fieldErrors?: Record<string, string[]>;

  /**
   * Additional context or metadata
   */
  context?: Record<string, unknown>;
}

/**
 * Success response from API
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Error response from API
 */
export interface ErrorResponse {
  success: false;
  error: ErrorDetail;
}

/**
 * Discriminated union for API responses
 * Enables automatic type narrowing based on success field
 */
export type CRUDResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Pagination metadata
 */
export interface Pagination {
  /**
   * Current page number (1-indexed)
   */
  page: number;

  /**
   * Number of items per page
   */
  perPage: number;

  /**
   * Total number of items across all pages
   */
  total: number;

  /**
   * Total number of pages
   */
  pages: number;
}

/**
 * Paginated success response
 */
export interface PaginatedSuccessResponse<T> {
  success: true;
  data: T[];
  pagination: Pagination;
}

/**
 * Paginated API response
 */
export type PaginatedCRUDResponse<T> = PaginatedSuccessResponse<T> | ErrorResponse;

/**
 * Standard filter options for list queries
 */
export interface FilterOptions {
  /**
   * Search query string
   */
  search?: string;

  /**
   * Page number for pagination
   */
  page?: number;

  /**
   * Items per page
   */
  perPage?: number;

  /**
   * Sort field
   */
  sortBy?: string;

  /**
   * Sort direction
   */
  sortOrder?: 'asc' | 'desc';

  /**
   * Additional filter parameters
   */
  [key: string]: unknown;
}

/**
 * Generic entity state for Redux slices
 * Provides consistent structure across all modules
 */
export interface EntityState<T> {
  /**
   * Array of entities
   */
  items: T[];

  /**
   * Currently selected entity (for detail view)
   */
  selectedItem: T | null;

  /**
   * Loading state
   */
  loading: boolean;

  /**
   * Error state with structured error detail
   */
  error: ErrorDetail | null;

  /**
   * Pagination metadata (optional)
   */
  pagination?: Pagination;

  /**
   * Current filter options (optional)
   */
  filters?: FilterOptions;
}

/**
 * Type guard to check if response is successful
 *
 * @param response - The API response to check
 * @returns True if response is successful, false otherwise
 *
 * @example
 * ```ts
 * const response = await api.getThreat(id);
 * if (isSuccessResponse(response)) {
 *   // TypeScript knows response.data is available
 *   console.log(response.data.name);
 * } else {
 *   // TypeScript knows response.error is available
 *   console.error(response.error.message);
 * }
 * ```
 */
export function isSuccessResponse<T>(
  response: CRUDResponse<T>
): response is SuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is an error
 *
 * @param response - The API response to check
 * @returns True if response is an error, false otherwise
 */
export function isErrorResponse<T>(
  response: CRUDResponse<T>
): response is ErrorResponse {
  return response.success === false;
}

/**
 * Helper function to create a structured error response
 *
 * @param code - Error code
 * @param message - Error message
 * @param options - Additional error options
 * @returns Structured error detail
 *
 * @example
 * ```ts
 * throw createErrorResponse('VALIDATION_ERROR', 'Name is required', {
 *   statusCode: 400,
 *   fieldErrors: { name: ['Name is required'] }
 * });
 * ```
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  options: Partial<Omit<ErrorDetail, 'code' | 'message' | 'timestamp'>> = {}
): ErrorDetail {
  return {
    code,
    message,
    timestamp: new Date(),
    retryable: code === 'NETWORK_ERROR' || code === 'TIMEOUT' || code === 'SERVER_ERROR',
    ...options,
  };
}

/**
 * HTTP status code to error code mapping
 *
 * @param statusCode - HTTP status code
 * @returns Corresponding error code
 */
export function mapStatusCodeToErrorCode(statusCode: number): ErrorCode {
  switch (statusCode) {
    case 400:
      return 'VALIDATION_ERROR';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 408:
    case 504:
      return 'TIMEOUT';
    case 500:
    case 502:
    case 503:
      return 'SERVER_ERROR';
    default:
      if (statusCode >= 500) {
        return 'SERVER_ERROR';
      }
      return 'UNKNOWN_ERROR';
  }
}

/**
 * Convert a standard Error to ErrorDetail
 *
 * @param error - The error to convert
 * @param defaultCode - Default error code if not determinable
 * @returns Structured error detail
 */
export function convertErrorToErrorDetail(
  error: unknown,
  defaultCode: ErrorCode = 'UNKNOWN_ERROR'
): ErrorDetail {
  if (error instanceof Error) {
    return createErrorResponse(
      defaultCode,
      error.message,
      {
        context: {
          name: error.name,
          stack: error.stack,
        },
      }
    );
  }

  if (typeof error === 'string') {
    return createErrorResponse(defaultCode, error);
  }

  return createErrorResponse(defaultCode, 'An unknown error occurred');
}
