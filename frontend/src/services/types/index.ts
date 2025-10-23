/**
 * @fileoverview Type definitions for API services. Provides TypeScript interfaces for API requests and responses.
 * 
 * @module services/types
 */

/**
 * WF-IDX-002 | index.ts - Service types module exports
 * Purpose: Centralized type exports for service layer
 * Last Updated: 2025-10-22 | File Type: .ts
 */

// Re-export types from utils
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  RetryOptions,
} from '../utils/apiUtils';

// Re-export types from core
export type {
  BaseEntity,
  PaginationParams,
  FilterParams,
  CrudOperations,
} from '../core/BaseApiService';
