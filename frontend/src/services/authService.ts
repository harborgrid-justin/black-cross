/**
 * @fileoverview Authentication API service.
 *
 * Provides methods for user authentication, login, logout, password management,
 * and token handling. Manages localStorage for token persistence.
 *
 * Authentication Flow:
 * 1. User calls login() with credentials
 * 2. Server returns JWT token and user data
 * 3. Token is stored in localStorage via setToken()
 * 4. All subsequent API calls include token automatically (via apiClient interceptor)
 * 5. On 401 errors, token is cleared and user redirected to login
 *
 * @module services/authService
 */

import { apiClient } from './api';
import type { User, ApiResponse } from '@/types';

/**
 * Login credentials structure.
 */
interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login response structure from the API.
 */
interface LoginResponse {
  token: string;
  expires_in: number;
  user: User;
}

/**
 * Service for handling authentication API operations.
 *
 * Provides methods for user authentication, session management, and password operations.
 * All methods handle localStorage operations safely for SSR compatibility.
 *
 * Token Management:
 * - Tokens are stored in localStorage under 'token' key
 * - The apiClient automatically injects tokens into request headers
 * - Tokens are cleared on logout or 401 errors
 *
 * @namespace authService
 *
 * @example
 * ```typescript
 * import { authService } from './services/authService';
 *
 * // Login user
 * const response = await authService.login({
 *   email: 'user@example.com',
 *   password: 'securePassword123'
 * });
 * authService.setToken(response.data.token);
 *
 * // Check authentication
 * if (authService.isAuthenticated()) {
 *   const user = await authService.getCurrentUser();
 * }
 *
 * // Logout
 * await authService.logout();
 * ```
 */
export const authService = {
  /**
   * Authenticates a user with email and password.
   *
   * On successful login, returns a JWT token, expiration time, and user profile.
   * The token must be stored via setToken() to persist authentication.
   *
   * @async
   * @param {LoginCredentials} credentials - User credentials
   * @param {string} credentials.email - User email address
   * @param {string} credentials.password - User password
   * @returns {Promise<ApiResponse<LoginResponse>>} Login response with token and user data
   * @throws {Error} Network error if connection fails
   * @throws {Error} 400 Bad Request if credentials are malformed
   * @throws {Error} 401 Unauthorized if credentials are invalid
   * @throws {Error} 429 Too Many Requests if rate limit exceeded
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * try {
   *   const response = await authService.login({
   *     email: 'analyst@company.com',
   *     password: 'SecureP@ssw0rd'
   *   });
   *
   *   // Store token for subsequent requests
   *   authService.setToken(response.data.token);
   *   localStorage.setItem('user', JSON.stringify(response.data.user));
   *
   *   console.log(`Welcome ${response.data.user.name}`);
   *   console.log(`Token expires in ${response.data.expires_in} seconds`);
   * } catch (error) {
   *   console.error('Login failed:', error.message);
   * }
   * ```
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
  },

  /**
   * Logs out the current user by clearing authentication data from localStorage.
   *
   * This is a client-side operation that removes the token and user data.
   * No API call is made to the server.
   *
   * @async
   * @returns {Promise<void>} Resolves when logout is complete
   *
   * @example
   * ```typescript
   * // Logout and redirect to login page
   * await authService.logout();
   * window.location.href = '/login';
   * ```
   */
  async logout(): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Retrieves the current authenticated user's profile.
   *
   * Requires a valid authentication token. Returns complete user profile
   * including name, email, roles, and permissions.
   *
   * @async
   * @returns {Promise<ApiResponse<User>>} The current user's profile
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized if token is invalid or expired (triggers automatic logout)
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * const response = await authService.getCurrentUser();
   * const user = response.data;
   * console.log(`Current user: ${user.name} (${user.email})`);
   * console.log(`Roles: ${user.roles.join(', ')}`);
   * ```
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<ApiResponse<User>>('/auth/me');
  },

  /**
   * Changes the current user's password.
   *
   * Requires both the current password for verification and the new password.
   * Password must meet security requirements (typically 8+ characters with mixed case, numbers).
   *
   * @async
   * @param {Object} data - Password change data
   * @param {string} data.currentPassword - The user's current password for verification
   * @param {string} data.newPassword - The new password to set
   * @returns {Promise<ApiResponse<void>>} Empty response on success
   * @throws {Error} Network error if connection fails
   * @throws {Error} 400 Bad Request if new password doesn't meet requirements
   * @throws {Error} 401 Unauthorized if current password is incorrect or token invalid
   * @throws {Error} 422 Unprocessable Entity if new password is same as current
   * @throws {Error} 500 Server Error if backend error occurs
   *
   * @example
   * ```typescript
   * try {
   *   await authService.changePassword({
   *     currentPassword: 'OldP@ssw0rd',
   *     newPassword: 'NewSecureP@ssw0rd123'
   *   });
   *   console.log('Password changed successfully');
   * } catch (error) {
   *   if (error.response?.status === 401) {
   *     console.error('Current password is incorrect');
   *   } else if (error.response?.status === 400) {
   *     console.error('New password does not meet requirements');
   *   }
   * }
   * ```
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/auth/change-password', data);
  },

  /**
   * Retrieves the authentication token from localStorage.
   *
   * Returns null if no token exists or if running in a non-browser environment.
   * Safe to call during SSR.
   *
   * @returns {string | null} The JWT token or null if not authenticated
   *
   * @example
   * ```typescript
   * const token = authService.getToken();
   * if (token) {
   *   console.log('User is authenticated');
   *   // Token format: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   * } else {
   *   console.log('User is not authenticated');
   * }
   * ```
   */
  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token');
    }
    return null;
  },

  /**
   * Stores the authentication token in localStorage.
   *
   * This token will be automatically included in all subsequent API requests
   * via the apiClient request interceptor.
   *
   * @param {string} token - The JWT token to store
   *
   * @example
   * ```typescript
   * // After successful login
   * const loginResponse = await authService.login(credentials);
   * authService.setToken(loginResponse.data.token);
   *
   * // Now all API calls will include this token
   * const user = await authService.getCurrentUser(); // Uses stored token
   * ```
   */
  setToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('token', token);
    }
  },

  /**
   * Checks if the user is currently authenticated.
   *
   * Returns true if a token exists in localStorage, false otherwise.
   * Note: This only checks for token presence, not validity.
   * Invalid tokens will be detected on first API call.
   *
   * @returns {boolean} True if token exists, false otherwise
   *
   * @example
   * ```typescript
   * // Guard route access
   * if (!authService.isAuthenticated()) {
   *   window.location.href = '/login';
   *   return;
   * }
   *
   * // Show/hide UI elements
   * const showAdminPanel = authService.isAuthenticated();
   * ```
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
