/**
 * @fileoverview Base API Service Abstract Class
 * 
 * WF-COMP-003 | BaseApiService.ts - Base API service abstract class
 * Purpose: Provides reusable CRUD patterns for all API modules
 * Dependencies: ../config/apiConfig, ../utils/apiUtils, zod
 * Exports: BaseApiService class, interfaces
 * Last Updated: 2025-10-22 | File Type: .ts
 * 
 * @module services/core/BaseApiService
 */

import { apiInstance } from '../config/apiConfig';
import { 
  handleApiError, 
  extractApiData, 
  buildUrlParams,
  type ApiResponse,
  type PaginatedResponse 
} from '../utils/apiUtils';
import { z, type ZodSchema } from 'zod';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams extends PaginationParams {
  [key: string]: unknown;
}

export interface CrudOperations<T extends BaseEntity, TCreate, TUpdate = Partial<TCreate>> {
  getAll(filters?: FilterParams): Promise<PaginatedResponse<T>>;
  getById(id: string): Promise<T>;
  create(data: TCreate): Promise<T>;
  update(id: string, data: TUpdate): Promise<T>;
  delete(id: string): Promise<void>;
}

// ==========================================
// BASE API SERVICE CLASS
// ==========================================

export abstract class BaseApiService<
  TEntity extends BaseEntity,
  TCreateDto = Partial<TEntity>,
  TUpdateDto = Partial<TCreateDto>
> implements CrudOperations<TEntity, TCreateDto, TUpdateDto> {
  protected baseEndpoint: string;
  protected createSchema?: ZodSchema<TCreateDto>;
  protected updateSchema?: ZodSchema<TUpdateDto>;

  constructor(
    baseEndpoint: string,
    options?: {
      createSchema?: ZodSchema<TCreateDto>;
      updateSchema?: ZodSchema<TUpdateDto>;
    }
  ) {
    this.baseEndpoint = baseEndpoint;
    this.createSchema = options?.createSchema;
    this.updateSchema = options?.updateSchema;
  }

  // ==========================================
  // CRUD OPERATIONS
  // ==========================================

  async getAll(filters?: FilterParams): Promise<PaginatedResponse<TEntity>> {
    try {
      const params = filters ? buildUrlParams(filters) : undefined;
      const url = params ? `${this.baseEndpoint}?${params.toString()}` : this.baseEndpoint;
      
      const response = await apiInstance.get<PaginatedResponse<TEntity>>(url);
      
      // For endpoints that return paginated data directly
      if (response.data && 'data' in response.data && 'pagination' in response.data) {
        return response.data;
      }
      
      // Fallback to direct response data
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getById(id: string): Promise<TEntity> {
    try {
      const response = await apiInstance.get<ApiResponse<TEntity>>(`${this.baseEndpoint}/${id}`);
      return extractApiData<TEntity>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async create(data: TCreateDto): Promise<TEntity> {
    try {
      // Validate input if schema provided
      const validatedData = this.createSchema ? this.createSchema.parse(data) : data;
      
      const response = await apiInstance.post<ApiResponse<TEntity>>(this.baseEndpoint, validatedData);
      return extractApiData<TEntity>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async update(id: string, data: TUpdateDto): Promise<TEntity> {
    try {
      // Validate input if schema provided
      const validatedData = this.updateSchema ? this.updateSchema.parse(data) : data;
      
      const response = await apiInstance.put<ApiResponse<TEntity>>(`${this.baseEndpoint}/${id}`, validatedData);
      return extractApiData<TEntity>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiInstance.delete(`${this.baseEndpoint}/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  protected buildUrl(path: string): string {
    return `${this.baseEndpoint}${path.startsWith('/') ? path : `/${path}`}`;
  }

  protected validateSchema<T>(schema: ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new Error(`Validation error: ${errorMessage}`);
      }
      throw error;
    }
  }
}
