/**
 * @fileoverview API module for incidentResponse. Provides type-safe API methods and request/response handling.
 * 
 * @module services/modules/incidentResponseApi
 */

/**
 * WF-COMP-005 | incidentResponseApi.ts - Incident Response API service module
 * Purpose: Incident Response domain API operations with type safety and validation
 * Upstream: ../config/apiConfig, ../utils/apiUtils, ../types | Dependencies: axios, zod
 * Downstream: Components, Redux stores | Called by: Incident components and stores
 * Related: Incident types, incident Redux slice
 * Exports: incidentResponseApi instance, types | Key Features: CRUD operations, validation, error handling
 * Last Updated: 2025-10-22 | File Type: .ts
 * Critical Path: Component request → API call → Backend → Response transformation → Component update
 * LLM Context: Domain-specific API service with comprehensive type safety and validation
 */

import { apiInstance } from '../config/apiConfig';
import type { 
  ApiResponse, 
  PaginatedResponse} from '../utils/apiUtils';
import { 
  buildUrlParams,
  handleApiError,
  extractApiData,
  withRetry
} from '../utils/apiUtils';
import { z } from 'zod';
import type { Incident, TimelineEvent, Evidence } from '../../types';

// ==========================================
// INTERFACES & TYPES
// ==========================================

export interface IncidentFilters {
  search?: string;
  status?: ('open' | 'investigating' | 'contained' | 'resolved' | 'closed')[];
  severity?: ('critical' | 'high' | 'medium' | 'low')[];
  assignedTo?: string;
  priority?: number[];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateIncidentData {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  priority: number;
  assignedTo?: string;
  affectedAssets?: string[];
}

export interface UpdateIncidentData {
  title?: string;
  description?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  priority?: number;
  status?: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  assignedTo?: string;
  affectedAssets?: string[];
}

export interface IncidentStatistics {
  total: number;
  open: number;
  investigating: number;
  contained: number;
  resolved: number;
  closed: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byPriority: {
    [key: number]: number;
  };
  avgResolutionTime: number;
}

export interface IncidentResponseApi {
  // Basic CRUD operations
  getAll(filters?: IncidentFilters): Promise<PaginatedResponse<Incident>>;
  getById(id: string): Promise<Incident>;
  create(data: CreateIncidentData): Promise<Incident>;
  update(id: string, data: UpdateIncidentData): Promise<Incident>;
  delete(id: string): Promise<void>;
  
  // Status management
  updateStatus(id: string, status: string): Promise<Incident>;
  assign(id: string, assignedTo: string): Promise<Incident>;
  
  // Timeline and evidence
  addTimelineEvent(id: string, event: Partial<TimelineEvent>): Promise<Incident>;
  addEvidence(id: string, evidence: Partial<Evidence>): Promise<Incident>;
  getTimeline(id: string): Promise<TimelineEvent[]>;
  
  // Statistics and reporting
  getStatistics(filters?: IncidentFilters): Promise<IncidentStatistics>;
  
  // Search
  search(query: string, filters?: IncidentFilters): Promise<Incident[]>;
}

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const ID_REGEX = /^[a-zA-Z0-9-_]{1,50}$/;

const createIncidentSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
    
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description cannot exceed 5000 characters'),
    
  severity: z
    .enum(['critical', 'high', 'medium', 'low']),
    
  priority: z
    .number()
    .int()
    .min(1, 'Priority must be between 1 and 5')
    .max(5, 'Priority must be between 1 and 5'),
    
  assignedTo: z
    .string()
    .max(100)
    .optional(),
    
  affectedAssets: z
    .array(z.string().max(200))
    .max(100)
    .optional(),
}).strict();

const updateIncidentSchema = createIncidentSchema.partial().extend({
  status: z.enum(['open', 'investigating', 'contained', 'resolved', 'closed']).optional(),
});

const incidentFiltersSchema = z.object({
  search: z.string().max(200).optional(),
  status: z.array(z.enum(['open', 'investigating', 'contained', 'resolved', 'closed'])).optional(),
  severity: z.array(z.enum(['critical', 'high', 'medium', 'low'])).optional(),
  assignedTo: z.string().max(100).optional(),
  priority: z.array(z.number().int().min(1).max(5)).optional(),
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

class IncidentResponseApiImpl implements IncidentResponseApi {
  private readonly baseEndpoint = '/incident-response';

  async getAll(filters?: IncidentFilters): Promise<PaginatedResponse<Incident>> {
    try {
      const validatedFilters = filters ? incidentFiltersSchema.parse(filters) : {};
      const params = buildUrlParams(validatedFilters);
      const url = `${this.baseEndpoint}${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await withRetry(() => apiInstance.get(url), {
        maxRetries: 3,
        backoffMs: 1000
      });
      
      return response.data as PaginatedResponse<Incident>;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getById(id: string): Promise<Incident> {
    try {
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      const response = await apiInstance.get<ApiResponse<Incident>>(`${this.baseEndpoint}/${id}`);
      return extractApiData<Incident>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async create(data: CreateIncidentData): Promise<Incident> {
    try {
      const validatedData = createIncidentSchema.parse(data);
      
      const response = await apiInstance.post<ApiResponse<Incident>>(this.baseEndpoint, validatedData);
      return extractApiData<Incident>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async update(id: string, data: UpdateIncidentData): Promise<Incident> {
    try {
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      const validatedData = updateIncidentSchema.parse(data);
      
      const response = await apiInstance.put<ApiResponse<Incident>>(`${this.baseEndpoint}/${id}`, validatedData);
      return extractApiData<Incident>(response);
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

  async updateStatus(id: string, status: string): Promise<Incident> {
    try {
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      const response = await apiInstance.patch<ApiResponse<Incident>>(
        `${this.baseEndpoint}/${id}/status`,
        { status }
      );
      return extractApiData<Incident>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async assign(id: string, assignedTo: string): Promise<Incident> {
    try {
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      const response = await apiInstance.patch<ApiResponse<Incident>>(
        `${this.baseEndpoint}/${id}/assign`,
        { assignedTo }
      );
      return extractApiData<Incident>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async addTimelineEvent(id: string, event: Partial<TimelineEvent>): Promise<Incident> {
    try {
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      const response = await apiInstance.post<ApiResponse<Incident>>(
        `${this.baseEndpoint}/${id}/timeline`,
        event
      );
      return extractApiData<Incident>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async addEvidence(id: string, evidence: Partial<Evidence>): Promise<Incident> {
    try {
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      const response = await apiInstance.post<ApiResponse<Incident>>(
        `${this.baseEndpoint}/${id}/evidence`,
        evidence
      );
      return extractApiData<Incident>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getTimeline(id: string): Promise<TimelineEvent[]> {
    try {
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      const response = await apiInstance.get<ApiResponse<TimelineEvent[]>>(
        `${this.baseEndpoint}/${id}/timeline`
      );
      return extractApiData<TimelineEvent[]>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getStatistics(filters?: IncidentFilters): Promise<IncidentStatistics> {
    try {
      const validatedFilters = filters ? incidentFiltersSchema.parse(filters) : {};
      const params = buildUrlParams(validatedFilters);
      const url = `${this.baseEndpoint}/stats${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await apiInstance.get<ApiResponse<IncidentStatistics>>(url);
      return extractApiData<IncidentStatistics>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async search(query: string, filters?: IncidentFilters): Promise<Incident[]> {
    try {
      const validatedFilters = filters ? incidentFiltersSchema.parse(filters) : {};
      const searchParams = { ...validatedFilters, q: query };
      const params = buildUrlParams(searchParams);
      
      const response = await apiInstance.get<ApiResponse<Incident[]>>(
        `${this.baseEndpoint}/search?${params.toString()}`
      );
      return extractApiData<Incident[]>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// ==========================================
// SINGLETON EXPORT
// ==========================================

export const incidentResponseApi: IncidentResponseApi = new IncidentResponseApiImpl();
