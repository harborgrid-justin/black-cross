/**
 * WF-COMP-002 | apiUtils.ts - API utility functions
 * Purpose: Common utility functions for API operations
 * Dependencies: axios
 * Last Updated: 2025-10-22 | File Type: .ts
 */

import { AxiosResponse, AxiosError } from 'axios';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    pages: number;
  };
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export interface RetryOptions {
  maxRetries?: number;
  backoffMs?: number;
  shouldRetry?: (error: unknown) => boolean;
}

// ==========================================
// ERROR HANDLING
// ==========================================

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): never {
  if (error instanceof AxiosError) {
    const apiError: ApiError = {
      message: error.response?.data?.message || error.response?.data?.error || error.message,
      code: error.response?.data?.code || error.code,
      status: error.response?.status,
      details: error.response?.data?.details,
    };
    
    throw apiError;
  }
  
  if (error instanceof Error) {
    throw {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    } as ApiError;
  }
  
  throw {
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
  } as ApiError;
}

// ==========================================
// DATA EXTRACTION
// ==========================================

/**
 * Extract data from API response
 */
export function extractApiData<T>(response: AxiosResponse<ApiResponse<T>>): T {
  if (response.data && response.data.success && response.data.data !== undefined) {
    return response.data.data;
  }
  
  // Handle direct data response (some endpoints may not wrap in success/data)
  if (response.data) {
    return response.data as T;
  }
  
  throw new Error('Invalid API response format');
}

/**
 * Extract data from API response, return null if not present
 */
export function extractApiDataOptional<T>(response: AxiosResponse<ApiResponse<T>>): T | null {
  try {
    return extractApiData(response);
  } catch {
    return null;
  }
}

// ==========================================
// URL & PARAMETER BUILDERS
// ==========================================

/**
 * Build URL search parameters from object
 */
export function buildUrlParams(params: Record<string, unknown>): URLSearchParams {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams;
}

/**
 * Build pagination parameters
 */
export function buildPaginationParams(page?: number, perPage?: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  
  if (page !== undefined) params.page = page;
  if (perPage !== undefined) params.perPage = perPage;
  if (sortBy) params.sortBy = sortBy;
  if (sortOrder) params.sortOrder = sortOrder;
  
  return params;
}

// ==========================================
// DATE UTILITIES
// ==========================================

/**
 * Format date for API (ISO string)
 */
export function formatDateForApi(date: Date | string): string {
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return date.toISOString();
}

/**
 * Parse date from API response
 */
export function parseDateFromApi(dateString: string): Date {
  return new Date(dateString);
}

// ==========================================
// RETRY LOGIC
// ==========================================

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    backoffMs = 1000,
    shouldRetry = (error: unknown) => {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        // Retry on 5xx errors and network errors
        return !status || status >= 500;
      }
      return false;
    },
  } = options;
  
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries && shouldRetry(error)) {
        const delay = backoffMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      break;
    }
  }
  
  throw lastError;
}

// ==========================================
// FORM DATA
// ==========================================

/**
 * Create FormData from object
 */
export function createFormData(data: Record<string, unknown>): FormData {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, String(item)));
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });
  
  return formData;
}

// ==========================================
// TYPE GUARDS
// ==========================================

/**
 * Check if response is an API response
 */
export function isApiResponse<T>(response: unknown): response is ApiResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    typeof (response as ApiResponse<T>).success === 'boolean'
  );
}

/**
 * Check if response is a paginated response
 */
export function isPaginatedResponse<T>(response: unknown): response is PaginatedResponse<T> {
  return (
    isApiResponse(response) &&
    'pagination' in response &&
    typeof (response as PaginatedResponse<T>).pagination === 'object'
  );
}

// ==========================================
// CACHE UTILITIES (SIMPLE IMPLEMENTATION)
// ==========================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  
  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
  
  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

export const apiCache = new SimpleCache();

/**
 * Wrap a function with caching
 */
export function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs?: number
): Promise<T> {
  const cached = apiCache.get<T>(key);
  if (cached !== null) {
    return Promise.resolve(cached);
  }
  
  return fn().then(result => {
    apiCache.set(key, result, ttlMs);
    return result;
  });
}

// ==========================================
// DEBOUNCE
// ==========================================

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: unknown, ...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delayMs);
  };
}
