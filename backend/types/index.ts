/**
 * TypeScript type definitions for Black-Cross backend
 */

import { Request } from 'express';

/**
 * Module health status
 */
export interface ModuleHealth {
  module: string;
  status: 'operational' | 'degraded' | 'offline';
  version: string;
  database?: 'connected' | 'disconnected';
  subFeatures?: string[];
}

/**
 * Platform health status
 */
export interface PlatformHealth {
  status: 'operational' | 'degraded' | 'offline';
  platform: string;
  version: string;
  timestamp: string;
  modules: {
    [key: string]: 'operational' | 'degraded' | 'offline';
  };
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Filter parameters
 */
export interface FilterParams {
  search?: string;
  status?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Authenticated request with user
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}
