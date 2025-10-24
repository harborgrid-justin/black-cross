/**
 * @fileoverview Core service functionality exports.
 *
 * Provides centralized exports for core service infrastructure including the base
 * API service class and common type definitions used across all API services.
 *
 * This module serves as the public API for the core service layer, making it easy
 * to import shared functionality in service implementations.
 *
 * @module services/core
 *
 * @example
 * ```typescript
 * import { BaseApiService, type BaseEntity, type CrudOperations } from './services/core';
 *
 * // Extend BaseApiService to create a new service
 * class UserService extends BaseApiService<User, CreateUserDto, UpdateUserDto> {
 *   constructor() {
 *     super('/users');
 *   }
 * }
 *
 * // Use type definitions
 * interface User extends BaseEntity {
 *   name: string;
 *   email: string;
 * }
 * ```
 */

/**
 * WF-IDX-001 | index.ts - Core services module exports
 * Purpose: Centralized exports for core service infrastructure
 * Last Updated: 2025-10-22 | File Type: .ts
 */

/**
 * BaseApiService - Abstract base class for all API services.
 *
 * Provides common CRUD operations (Create, Read, Update, Delete) that can be
 * inherited by specific service implementations. Includes built-in error handling,
 * pagination support, and optional schema validation.
 *
 * @see {@link BaseApiService} for detailed documentation
 */
export {
  BaseApiService,
  /**
   * BaseEntity - Base interface for all entities with common fields.
   *
   * All entities should extend this interface to include standard id, createdAt,
   * and updatedAt fields.
   *
   * @see {@link BaseEntity} for interface definition
   */
  type BaseEntity,
  /**
   * PaginationParams - Interface for pagination parameters.
   *
   * Used to specify page number, items per page, and sorting options.
   *
   * @see {@link PaginationParams} for parameter details
   */
  type PaginationParams,
  /**
   * FilterParams - Interface for filter and pagination parameters.
   *
   * Extends PaginationParams with additional dynamic filter fields.
   *
   * @see {@link FilterParams} for parameter details
   */
  type FilterParams,
  /**
   * CrudOperations - Interface defining standard CRUD operation signatures.
   *
   * Ensures consistent method signatures across all service implementations.
   *
   * @see {@link CrudOperations} for method signatures
   */
  type CrudOperations,
} from './BaseApiService';
