/**
 * @fileoverview API module for iocManagement. Provides type-safe API methods and request/response handling.
 * 
 * @module services/modules/iocManagementApi
 */

/**
 * WF-COMP-007 | iocManagementApi.ts - IOC Management API service module
 * Purpose: IOC (Indicators of Compromise) Management domain API operations with type safety and validation
 * Upstream: ../config/apiConfig, ../utils/apiUtils, ../types | Dependencies: axios, zod
 * Downstream: Components, Redux stores | Called by: IOC components and stores
 * Related: IoC types, ioc Redux slice
 * Exports: iocManagementApi instance, types | Key Features: CRUD operations, validation, error handling
 * Last Updated: 2025-10-22 | File Type: .ts
 * Critical Path: Component request → API call → Backend → Response transformation → Component update
 * LLM Context: Domain-specific API service with comprehensive type safety and validation
 */

import { apiInstance } from '../config/apiConfig';
import { 
  ApiResponse, 
  PaginatedResponse, 
  buildUrlParams,
  handleApiError,
  extractApiData,
  withRetry
} from '../utils/apiUtils';
import { z } from 'zod';
import type { IoC } from '../../types';

// ==========================================
// INTERFACES & TYPES
// ==========================================

export interface IoCFilters {
  search?: string;
  type?: ('ip' | 'domain' | 'url' | 'hash' | 'email')[];
  status?: ('active' | 'inactive' | 'expired')[];
  source?: string;
  tags?: string[];
  confidence?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateIoCData {
  type: 'ip' | 'domain' | 'url' | 'hash' | 'email';
  value: string;
  confidence: number;
  source: string;
  tags?: string[];
  expiresAt?: string;
  description?: string;
}

export interface UpdateIoCData {
  confidence?: number;
  status?: 'active' | 'inactive' | 'expired';
  source?: string;
  tags?: string[];
  expiresAt?: string;
  description?: string;
}

export interface IoCStatistics {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  byType: {
    ip: number;
    domain: number;
    url: number;
    hash: number;
    email: number;
  };
  bySource: {
    [key: string]: number;
  };
  avgConfidence: number;
}

export interface BulkImportResult {
  success: number;
  failed: number;
  errors: Array<{
    ioc: string;
    reason: string;
  }>;
}

export interface IoCCheckResult {
  ioc: string;
  type: string;
  found: boolean;
  threatLevel?: string;
  sources?: string[];
  lastSeen?: string;
}

export interface IoCManagementApi {
  // Basic CRUD operations
  getAll(filters?: IoCFilters): Promise<PaginatedResponse<IoC>>;
  getById(id: string): Promise<IoC>;
  create(data: CreateIoCData): Promise<IoC>;
  update(id: string, data: UpdateIoCData): Promise<IoC>;
  delete(id: string): Promise<void>;
  
  // Bulk operations
  bulkImport(iocs: CreateIoCData[]): Promise<BulkImportResult>;
  bulkDelete(ids: string[]): Promise<{ deleted: number }>;
  
  // Checking and validation
  checkIoC(value: string, type: string): Promise<IoCCheckResult>;
  validateIoC(value: string, type: string): Promise<{ valid: boolean; reason?: string }>;
  
  // Export
  export(filters?: IoCFilters, format?: 'json' | 'csv' | 'stix'): Promise<Blob>;
  
  // Statistics and reporting
  getStatistics(filters?: IoCFilters): Promise<IoCStatistics>;
  
  // Search
  search(query: string, filters?: IoCFilters): Promise<IoC[]>;
}

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const ID_REGEX = /^[a-zA-Z0-9-_]{1,50}$/;
const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;
const DOMAIN_REGEX = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HASH_REGEX = /^[a-fA-F0-9]{32,64}$/;

const createIoCSchema = z.object({
  type: z
    .enum(['ip', 'domain', 'url', 'hash', 'email']),
    
  value: z
    .string()
    .min(1, 'Value is required')
    .max(500, 'Value cannot exceed 500 characters')
    .trim(),
    
  confidence: z
    .number()
    .min(0, 'Confidence must be between 0 and 100')
    .max(100, 'Confidence must be between 0 and 100'),
    
  source: z
    .string()
    .min(1, 'Source is required')
    .max(200, 'Source cannot exceed 200 characters'),
    
  tags: z
    .array(z.string().max(50))
    .max(20)
    .optional(),
    
  expiresAt: z
    .string()
    .datetime()
    .optional(),
    
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
}).strict();

const updateIoCSchema = z.object({
  confidence: z
    .number()
    .min(0)
    .max(100)
    .optional(),
    
  status: z
    .enum(['active', 'inactive', 'expired'])
    .optional(),
    
  source: z
    .string()
    .max(200)
    .optional(),
    
  tags: z
    .array(z.string().max(50))
    .max(20)
    .optional(),
    
  expiresAt: z
    .string()
    .datetime()
    .optional(),
    
  description: z
    .string()
    .max(1000)
    .optional(),
}).strict();

const iocFiltersSchema = z.object({
  search: z.string().max(200).optional(),
  type: z.array(z.enum(['ip', 'domain', 'url', 'hash', 'email'])).optional(),
  status: z.array(z.enum(['active', 'inactive', 'expired'])).optional(),
  source: z.string().max(200).optional(),
  tags: z.array(z.string().max(50)).optional(),
  confidence: z.number().min(0).max(100).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  perPage: z.number().int().min(1).max(100).optional(),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
}).strict();

// ==========================================
// API IMPLEMENTATION CLASS
// ==========================================

class IoCManagementApiImpl implements IoCManagementApi {
  private readonly baseEndpoint = '/ioc-management';

  async getAll(filters?: IoCFilters): Promise<PaginatedResponse<IoC>> {
    try {
      const validatedFilters = filters ? iocFiltersSchema.parse(filters) : {};
      const params = buildUrlParams(validatedFilters);
      const url = `${this.baseEndpoint}${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await withRetry(() => apiInstance.get(url), {
        maxRetries: 3,
        backoffMs: 1000
      });
      
      return response.data as PaginatedResponse<IoC>;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getById(id: string): Promise<IoC> {
    try {
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      const response = await apiInstance.get<ApiResponse<IoC>>(`${this.baseEndpoint}/${id}`);
      return extractApiData<IoC>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async create(data: CreateIoCData): Promise<IoC> {
    try {
      const validatedData = createIoCSchema.parse(data);
      
      const response = await apiInstance.post<ApiResponse<IoC>>(this.baseEndpoint, validatedData);
      return extractApiData<IoC>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async update(id: string, data: UpdateIoCData): Promise<IoC> {
    try {
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      const validatedData = updateIoCSchema.parse(data);
      
      const response = await apiInstance.put<ApiResponse<IoC>>(`${this.baseEndpoint}/${id}`, validatedData);
      return extractApiData<IoC>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      await apiInstance.delete(`${this.baseEndpoint}/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async bulkImport(iocs: CreateIoCData[]): Promise<BulkImportResult> {
    try {
      const validatedIoCs = iocs.map(ioc => createIoCSchema.parse(ioc));
      
      const response = await apiInstance.post<ApiResponse<BulkImportResult>>(
        `${this.baseEndpoint}/bulk`,
        { iocs: validatedIoCs }
      );
      return extractApiData<BulkImportResult>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async bulkDelete(ids: string[]): Promise<{ deleted: number }> {
    try {
      ids.forEach(id => {
        if (!ID_REGEX.test(id)) {
          throw new Error(`Invalid ID format: ${id}`);
        }
      });
      
      const response = await apiInstance.post<ApiResponse<{ deleted: number }>>(
        `${this.baseEndpoint}/bulk-delete`,
        { ids }
      );
      return extractApiData<{ deleted: number }>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async checkIoC(value: string, type: string): Promise<IoCCheckResult> {
    try {
      const response = await apiInstance.post<ApiResponse<IoCCheckResult>>(
        `${this.baseEndpoint}/check`,
        { value, type }
      );
      return extractApiData<IoCCheckResult>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async validateIoC(value: string, type: string): Promise<{ valid: boolean; reason?: string }> {
    try {
      const response = await apiInstance.post<ApiResponse<{ valid: boolean; reason?: string }>>(
        `${this.baseEndpoint}/validate`,
        { value, type }
      );
      return extractApiData<{ valid: boolean; reason?: string }>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async export(filters?: IoCFilters, format: 'json' | 'csv' | 'stix' = 'json'): Promise<Blob> {
    try {
      const validatedFilters = filters ? iocFiltersSchema.parse(filters) : {};
      const params = buildUrlParams({ ...validatedFilters, format });
      const url = `${this.baseEndpoint}/export${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await apiInstance.get(url, {
        responseType: 'blob',
        headers: {
          Accept: format === 'csv' ? 'text/csv' : 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getStatistics(filters?: IoCFilters): Promise<IoCStatistics> {
    try {
      const validatedFilters = filters ? iocFiltersSchema.parse(filters) : {};
      const params = buildUrlParams(validatedFilters);
      const url = `${this.baseEndpoint}/stats${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await apiInstance.get<ApiResponse<IoCStatistics>>(url);
      return extractApiData<IoCStatistics>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async search(query: string, filters?: IoCFilters): Promise<IoC[]> {
    try {
      const validatedFilters = filters ? iocFiltersSchema.parse(filters) : {};
      const searchParams = { ...validatedFilters, q: query };
      const params = buildUrlParams(searchParams);
      
      const response = await apiInstance.get<ApiResponse<IoC[]>>(
        `${this.baseEndpoint}/search?${params.toString()}`
      );
      return extractApiData<IoC[]>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// ==========================================
// SINGLETON EXPORT
// ==========================================

export const iocManagementApi: IoCManagementApi = new IoCManagementApiImpl();
