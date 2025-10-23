/**
 * @fileoverview API module for threatIntelligence. Provides type-safe API methods and request/response handling.
 * 
 * @module services/modules/threatIntelligenceApi
 */

/**
 * WF-COMP-004 | threatIntelligenceApi.ts - Threat Intelligence API service module
 * Purpose: Threat Intelligence domain API operations with type safety and validation
 * Upstream: ../config/apiConfig, ../utils/apiUtils, ../types | Dependencies: axios, zod
 * Downstream: Components, Redux stores | Called by: Threat Intelligence components and stores
 * Related: Threat types, threat intelligence Redux slice
 * Exports: threatIntelligenceApi instance, types | Key Features: CRUD operations, validation, error handling
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
import type { Threat } from '../../types';

// ==========================================
// INTERFACES & TYPES
// ==========================================

export interface ThreatFilters {
  search?: string;
  status?: ('active' | 'archived' | 'resolved')[];
  severity?: ('critical' | 'high' | 'medium' | 'low')[];
  type?: string[];
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateThreatData {
  name: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  description: string;
  categories?: string[];
  tags?: string[];
  indicators?: Array<{
    type: 'ip' | 'domain' | 'url' | 'hash' | 'email' | 'filename' | 'registry' | 'mutex';
    value: string;
    confidence?: number;
  }>;
}

export interface UpdateThreatData {
  name?: string;
  type?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  confidence?: number;
  description?: string;
  categories?: string[];
  tags?: string[];
  status?: 'active' | 'archived' | 'resolved';
}

export interface ThreatStatistics {
  total: number;
  active: number;
  archived: number;
  resolved: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recentTrends: {
    date: string;
    count: number;
  }[];
}

export interface ThreatIntelligenceApi {
  // Basic CRUD operations
  getAll(filters?: ThreatFilters): Promise<PaginatedResponse<Threat>>;
  getById(id: string): Promise<Threat>;
  create(data: CreateThreatData): Promise<Threat>;
  update(id: string, data: UpdateThreatData): Promise<Threat>;
  delete(id: string): Promise<void>;
  
  // Advanced operations
  getStatistics(filters?: ThreatFilters): Promise<ThreatStatistics>;
  categorize(id: string, categories: string[]): Promise<Threat>;
  archive(id: string): Promise<Threat>;
  enrich(id: string): Promise<Threat>;
  getEnriched(id: string): Promise<Threat>;
  correlate(data: { threatIds: string[] }): Promise<unknown>;
  analyze(id: string): Promise<unknown>;
  
  // Search and filtering
  search(query: string, filters?: ThreatFilters): Promise<Threat[]>;
}

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

// Common validation patterns
const ID_REGEX = /^[a-zA-Z0-9-_]{1,50}$/;

/**
 * Indicator validation schema
 */
const indicatorSchema = z.object({
  type: z.enum(['ip', 'domain', 'url', 'hash', 'email', 'filename', 'registry', 'mutex']),
  value: z.string().min(1, 'Indicator value is required').max(500),
  confidence: z.number().min(0).max(100).optional(),
});

/**
 * Create threat validation schema
 */
const createThreatSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name cannot exceed 200 characters')
    .trim(),
    
  type: z
    .string()
    .min(1, 'Type is required')
    .max(100, 'Type cannot exceed 100 characters'),
    
  severity: z
    .enum(['critical', 'high', 'medium', 'low']),
    
  confidence: z
    .number()
    .min(0, 'Confidence must be between 0 and 100')
    .max(100, 'Confidence must be between 0 and 100'),
    
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description cannot exceed 2000 characters'),
    
  categories: z
    .array(z.string().max(100))
    .optional(),
    
  tags: z
    .array(z.string().max(50))
    .optional(),
    
  indicators: z
    .array(indicatorSchema)
    .optional(),
}).strict();

/**
 * Update threat validation schema (partial of create)
 */
const updateThreatSchema = createThreatSchema.partial().extend({
  status: z.enum(['active', 'archived', 'resolved']).optional(),
});

/**
 * Filter validation schema
 */
const threatFiltersSchema = z.object({
  search: z.string().max(200).optional(),
  status: z.array(z.enum(['active', 'archived', 'resolved'])).optional(),
  severity: z.array(z.enum(['critical', 'high', 'medium', 'low'])).optional(),
  type: z.array(z.string().max(100)).optional(),
  tags: z.array(z.string().max(50)).optional(),
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

class ThreatIntelligenceApiImpl implements ThreatIntelligenceApi {
  private readonly baseEndpoint = '/threat-intelligence/threats';

  /**
   * Get all threats with filtering and pagination
   */
  async getAll(filters?: ThreatFilters): Promise<PaginatedResponse<Threat>> {
    try {
      // Validate filters
      const validatedFilters = filters ? threatFiltersSchema.parse(filters) : {};
      
      // Build query parameters
      const params = buildUrlParams(validatedFilters);
      const url = `${this.baseEndpoint}${params.toString() ? `?${params.toString()}` : ''}`;
      
      // Make request with retry logic
      const response = await withRetry(() => apiInstance.get(url), {
        maxRetries: 3,
        backoffMs: 1000
      });
      
      // Extract and validate response
      return response.data as PaginatedResponse<Threat>;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get a single threat by ID
   */
  async getById(id: string): Promise<Threat> {
    try {
      // Validate ID format
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      const response = await apiInstance.get<ApiResponse<Threat>>(`${this.baseEndpoint}/${id}`);
      return extractApiData<Threat>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new threat
   */
  async create(data: CreateThreatData): Promise<Threat> {
    try {
      // Validate input data
      const validatedData = createThreatSchema.parse(data);
      
      const response = await apiInstance.post<ApiResponse<Threat>>(`${this.baseEndpoint}/collect`, validatedData);
      return extractApiData<Threat>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update an existing threat
   */
  async update(id: string, data: UpdateThreatData): Promise<Threat> {
    try {
      // Validate ID and input data
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      const validatedData = updateThreatSchema.parse(data);
      
      const response = await apiInstance.put<ApiResponse<Threat>>(`${this.baseEndpoint}/${id}`, validatedData);
      return extractApiData<Threat>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete a threat
   */
  async delete(id: string): Promise<void> {
    try {
      // Validate ID format
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      await apiInstance.delete(`${this.baseEndpoint}/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get statistics for threats
   */
  async getStatistics(filters?: ThreatFilters): Promise<ThreatStatistics> {
    try {
      const validatedFilters = filters ? threatFiltersSchema.parse(filters) : {};
      const params = buildUrlParams(validatedFilters);
      const url = `/threat-intelligence/statistics${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await apiInstance.get<ApiResponse<ThreatStatistics>>(url);
      return extractApiData<ThreatStatistics>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Categorize a threat
   */
  async categorize(id: string, categories: string[]): Promise<Threat> {
    try {
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      const response = await apiInstance.post<ApiResponse<Threat>>(
        `${this.baseEndpoint}/${id}/categorize`,
        { categories }
      );
      return extractApiData<Threat>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Archive a threat
   */
  async archive(id: string): Promise<Threat> {
    try {
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      const response = await apiInstance.post<ApiResponse<Threat>>(`${this.baseEndpoint}/${id}/archive`);
      return extractApiData<Threat>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Enrich a threat
   */
  async enrich(id: string): Promise<Threat> {
    try {
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      const response = await apiInstance.post<ApiResponse<Threat>>(`${this.baseEndpoint}/${id}/enrich`);
      return extractApiData<Threat>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get enriched threat data
   */
  async getEnriched(id: string): Promise<Threat> {
    try {
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      const response = await apiInstance.get<ApiResponse<Threat>>(`${this.baseEndpoint}/${id}/enriched`);
      return extractApiData<Threat>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Correlate threats
   */
  async correlate(data: { threatIds: string[] }): Promise<unknown> {
    try {
      const response = await apiInstance.post<ApiResponse<unknown>>(
        `${this.baseEndpoint}/correlate`,
        data
      );
      return extractApiData<unknown>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Analyze threat context
   */
  async analyze(id: string): Promise<unknown> {
    try {
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      const response = await apiInstance.post<ApiResponse<unknown>>(`${this.baseEndpoint}/${id}/analyze`);
      return extractApiData<unknown>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search threats
   */
  async search(query: string, filters?: ThreatFilters): Promise<Threat[]> {
    try {
      const validatedFilters = filters ? threatFiltersSchema.parse(filters) : {};
      const searchParams = { ...validatedFilters, q: query };
      const params = buildUrlParams(searchParams);
      
      const response = await apiInstance.get<ApiResponse<Threat[]>>(`${this.baseEndpoint}/search?${params.toString()}`);
      return extractApiData<Threat[]>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// ==========================================
// SINGLETON EXPORT
// ==========================================

/**
 * Singleton instance of ThreatIntelligenceApi
 * Use this throughout the application
 */
export const threatIntelligenceApi: ThreatIntelligenceApi = new ThreatIntelligenceApiImpl();

// Type is already exported with the interface declaration above
