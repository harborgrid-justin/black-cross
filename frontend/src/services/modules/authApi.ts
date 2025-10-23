/**
 * @fileoverview API module for auth. Provides type-safe API methods and request/response handling.
 * 
 * @module services/modules/authApi
 */

/**
 * WF-COMP-008 | authApi.ts - Authentication API service module
 * Purpose: Authentication and authorization operations with type safety and validation
 * Upstream: ../config/apiConfig, ../utils/apiUtils, ../types | Dependencies: axios, zod
 * Downstream: Components, Redux stores | Called by: Auth components and stores
 * Related: User types, auth Redux slice
 * Exports: authApi instance, types | Key Features: Login, logout, registration, password management
 * Last Updated: 2025-10-22 | File Type: .ts
 * Critical Path: Component request → API call → Backend → Token storage → Component update
 * LLM Context: Authentication service with comprehensive token management and validation
 */

import { apiInstance, tokenUtils } from '../config/apiConfig';
import type { 
  ApiResponse} from '../utils/apiUtils';
import { 
  handleApiError,
  extractApiData
} from '../utils/apiUtils';
import { z } from 'zod';
import type { User } from '../../types';

// ==========================================
// INTERFACES & TYPES
// ==========================================

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  role?: 'admin' | 'analyst' | 'viewer';
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  expires_in: number;
  user: User;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expires_in: number;
}

export interface AuthApi {
  // Authentication
  login(credentials: LoginCredentials): Promise<LoginResponse>;
  logout(): Promise<void>;
  register(data: RegisterData): Promise<LoginResponse>;
  
  // Token management
  refreshToken(): Promise<RefreshTokenResponse>;
  
  // User info
  getCurrentUser(): Promise<User>;
  updateProfile(data: Partial<User>): Promise<User>;
  
  // Password management
  changePassword(data: PasswordChangeData): Promise<void>;
  requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }>;
  confirmPasswordReset(data: PasswordResetConfirm): Promise<{ message: string }>;
  
  // Session management
  isAuthenticated(): boolean;
  getToken(): string | null;
  clearAuth(): void;
}

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

const loginCredentialsSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255),
    
  password: z
    .string()
    .min(1, 'Password is required'),
    
  rememberMe: z
    .boolean()
    .optional(),
}).strict();

const registerDataSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255),
    
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
    
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(128, 'Password cannot exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
    
  role: z
    .enum(['admin', 'analyst', 'viewer'])
    .optional(),
}).strict().refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
    
  newPassword: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(128, 'Password cannot exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your new password'),
}).strict().refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255),
}).strict();

const passwordResetConfirmSchema = z.object({
  token: z
    .string()
    .min(1, 'Reset token is required'),
    
  newPassword: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(128, 'Password cannot exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your new password'),
}).strict().refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ==========================================
// API IMPLEMENTATION CLASS
// ==========================================

class AuthApiImpl implements AuthApi {
  private readonly baseEndpoint = '/auth';

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const validatedData = loginCredentialsSchema.parse(credentials);
      
      const response = await apiInstance.post<ApiResponse<LoginResponse>>(
        `${this.baseEndpoint}/login`,
        validatedData
      );
      
      const data = extractApiData<LoginResponse>(response);
      
      // Store token
      tokenUtils.setToken(data.token);
      
      // Store user info
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint (optional, backend may handle this)
      await apiInstance.post(`${this.baseEndpoint}/logout`);
    } catch (error) {
      // Continue with local logout even if server call fails
      console.warn('Server logout failed, continuing with local logout');
    } finally {
      // Always clear local auth data
      this.clearAuth();
    }
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      const validatedData = registerDataSchema.parse(data);
      
      // Remove confirmPassword before sending to server
      const { confirmPassword, ...registerPayload } = validatedData;
      
      const response = await apiInstance.post<ApiResponse<LoginResponse>>(
        `${this.baseEndpoint}/register`,
        registerPayload
      );
      
      const responseData = extractApiData<LoginResponse>(response);
      
      // Store token
      tokenUtils.setToken(responseData.token);
      
      // Store user info
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('user', JSON.stringify(responseData.user));
      }
      
      return responseData;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const response = await apiInstance.post<ApiResponse<RefreshTokenResponse>>(
        `${this.baseEndpoint}/refresh`
      );
      
      const data = extractApiData<RefreshTokenResponse>(response);
      
      // Update stored token
      tokenUtils.setToken(data.token);
      
      return data;
    } catch (error) {
      // If refresh fails, clear auth and redirect to login
      this.clearAuth();
      throw handleApiError(error);
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiInstance.get<ApiResponse<User>>(`${this.baseEndpoint}/me`);
      const user = extractApiData<User>(response);
      
      // Update stored user info
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return user;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await apiInstance.patch<ApiResponse<User>>(
        `${this.baseEndpoint}/profile`,
        data
      );
      
      const user = extractApiData<User>(response);
      
      // Update stored user info
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return user;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async changePassword(data: PasswordChangeData): Promise<void> {
    try {
      const validatedData = passwordChangeSchema.parse(data);
      
      // Remove confirmPassword before sending to server
      const { confirmPassword, ...changePayload } = validatedData;
      
      await apiInstance.post<ApiResponse<void>>(
        `${this.baseEndpoint}/change-password`,
        changePayload
      );
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<{ message: string }> {
    try {
      const validatedData = passwordResetRequestSchema.parse(data);
      
      const response = await apiInstance.post<ApiResponse<{ message: string }>>(
        `${this.baseEndpoint}/forgot-password`,
        validatedData
      );
      
      return extractApiData<{ message: string }>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async confirmPasswordReset(data: PasswordResetConfirm): Promise<{ message: string }> {
    try {
      const validatedData = passwordResetConfirmSchema.parse(data);
      
      // Remove confirmPassword before sending to server
      const { confirmPassword, ...resetPayload } = validatedData;
      
      const response = await apiInstance.post<ApiResponse<{ message: string }>>(
        `${this.baseEndpoint}/reset-password`,
        resetPayload
      );
      
      return extractApiData<{ message: string }>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  isAuthenticated(): boolean {
    return tokenUtils.isAuthenticated();
  }

  getToken(): string | null {
    return tokenUtils.getToken();
  }

  clearAuth(): void {
    tokenUtils.clearAuth();
  }
}

// ==========================================
// SINGLETON EXPORT
// ==========================================

export const authApi: AuthApi = new AuthApiImpl();
