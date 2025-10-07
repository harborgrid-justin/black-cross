/**
 * TypeScript type definitions for Black-Cross backend
 * Following strict TypeScript best practices with explicit types,
 * discriminated unions, and comprehensive JSDoc documentation.
 */

import type { Request } from 'express';

/**
 * Status types using string literal unions for type safety
 */
export type HealthStatus = 'operational' | 'degraded' | 'offline';
export type DatabaseStatus = 'connected' | 'disconnected';
export type SortOrder = 'asc' | 'desc';

/**
 * Module health status
 * Represents the operational state of a backend module
 */
export interface ModuleHealth {
  readonly module: string;
  readonly status: HealthStatus;
  readonly version: string;
  readonly database?: DatabaseStatus;
  readonly subFeatures?: readonly string[];
}

/**
 * Platform health status
 * Represents the overall health of the Black-Cross platform
 */
export interface PlatformHealth {
  readonly status: HealthStatus;
  readonly platform: string;
  readonly version: string;
  readonly timestamp: string;
  readonly modules: Readonly<Record<string, HealthStatus>>;
}

/**
 * API response wrapper with type-safe success/error states
 * Uses discriminated union for better type narrowing
 */
export type ApiResponse<T = unknown> =
  | {
      readonly success: true;
      readonly data: T;
      readonly message?: string;
    }
  | {
      readonly success: false;
      readonly error: string;
      readonly message?: string;
    };

/**
 * Pagination parameters with validated constraints
 */
export interface PaginationParams {
  readonly page?: number;
  readonly limit?: number;
  readonly sort?: string;
  readonly order?: SortOrder;
}

/**
 * Filter parameters for querying resources
 */
export interface FilterParams {
  readonly search?: string;
  readonly status?: string;
  readonly severity?: string;
  readonly startDate?: string;
  readonly endDate?: string;
}

/**
 * User role type with explicit permissions
 */
export type UserRole = 'admin' | 'analyst' | 'viewer';

/**
 * Authenticated user information
 */
export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
  [key: string]: unknown;
}

/**
 * Authenticated request with user
 * Extends Express Request with authenticated user data
 */
export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Type guard to check if a request is authenticated
 * @param req - Express request object
 * @returns True if the request has an authenticated user
 */
export function isAuthRequest(req: Request): req is AuthRequest {
  return 'user' in req && req.user !== undefined;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  readonly success: boolean;
  readonly data: readonly T[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly pages: number;
  };
}

/**
 * Error response type for consistent error handling
 */
export interface ErrorResponse {
  readonly success: false;
  readonly error: string;
  readonly code?: string;
  readonly details?: Readonly<Record<string, unknown>>;
}
