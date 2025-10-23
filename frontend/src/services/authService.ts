/**
 * @fileoverview Authentication API service.
 * 
 * Provides methods for user authentication, login, logout, password management,
 * and token handling.
 * 
 * @module services/authService
 */

import { apiClient } from './api';
import type { User, ApiResponse } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  expires_in: number;
  user: User;
}

/**
 * Service for handling auth API operations.
 * 
 * Provides methods for CRUD operations and specialized functionality.
 * All methods return promises and handle errors appropriately.
 * 
 * @namespace authService
 */
export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
  },

  async logout(): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<ApiResponse<User>>('/auth/me');
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/auth/change-password', data);
  },

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token');
    }
    return null;
  },

  setToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('token', token);
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
