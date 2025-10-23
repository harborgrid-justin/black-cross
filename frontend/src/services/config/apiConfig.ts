/**
 * @fileoverview API Configuration and Axios Setup
 * 
 * WF-COMP-001 | apiConfig.ts - API configuration and Axios setup
 * Purpose: Central API configuration with authentication and interceptors
 * Dependencies: axios, API constants, security modules
 * Last Updated: 2025-10-22 | File Type: .ts
 * 
 * @module services/config/apiConfig
 */

import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import axios from 'axios';
import { API_CONFIG, HTTP_STATUS, CONTENT_TYPE, STORAGE_KEYS, PUBLIC_ROUTES } from '../../constants';

// ==========================================
// TYPES
// ==========================================

interface RequestMetadata {
  startTime: number;
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: RequestMetadata;
    _retry?: boolean;
  }
}

// ==========================================
// API INSTANCE CREATION
// ==========================================

export const apiInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': CONTENT_TYPE.JSON,
    'Accept': CONTENT_TYPE.JSON,
  },
  withCredentials: true,
});

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================

apiInstance.interceptors.request.use(
  (config) => {
    // Start performance tracking
    config.metadata = { startTime: performance.now() };
    
    // Add authentication token
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Add request ID for tracing
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================

apiInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Record performance metrics
    const startTime = response.config.metadata?.startTime;
    if (startTime) {
      const duration = performance.now() - startTime;
      // Log performance metric (can be extended with monitoring service)
      if (duration > 1000) {
        console.warn(`[API] Slow request: ${response.config.url} took ${duration.toFixed(2)}ms`);
      }
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // Handle token refresh for 401 errors
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // For now, just clear tokens and redirect to login
      // Future enhancement: implement token refresh logic
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = PUBLIC_ROUTES.LOGIN;
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('[apiConfig] Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export const tokenUtils = {
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      return !!token;
    }
    return false;
  },
  
  /**
   * Get current user token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(STORAGE_KEYS.TOKEN);
    }
    return null;
  },
  
  /**
   * Clear all authentication data
   */
  clearAuth(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },
  
  /**
   * Set authentication token
   */
  setToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }
  }
};

// ==========================================
// EXPORTS
// ==========================================

export { API_CONFIG };
export default apiInstance;
