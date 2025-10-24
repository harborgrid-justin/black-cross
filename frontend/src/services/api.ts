/**
 * @fileoverview API Client
 *
 * Provides the main API client class for making HTTP requests with
 * authentication, error handling, and request/response interceptors.
 *
 * Features:
 * - Automatic Bearer token injection from localStorage
 * - Automatic redirect to login on 401 Unauthorized
 * - JSON content type headers by default
 * - Configurable timeout and base URL
 *
 * @module services/api
 */

import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { API_CONFIG, HTTP_STATUS, HTTP_HEADERS, CONTENT_TYPE, STORAGE_KEYS, PUBLIC_ROUTES } from '../constants';

/**
 * API Client class for handling HTTP requests.
 *
 * Provides methods for GET, POST, PUT, DELETE, and PATCH requests
 * with automatic token injection and error handling.
 *
 * All requests automatically include:
 * - Bearer token from localStorage (if available)
 * - JSON content-type headers
 * - Configured timeout
 *
 * Error Handling:
 * - 401 Unauthorized: Automatically clears token and redirects to login
 * - Network errors: Rejects promise with error details
 *
 * @class ApiClient
 *
 * @example
 * ```typescript
 * // The apiClient is already instantiated and exported
 * import { apiClient } from './api';
 *
 * // Make a GET request
 * const data = await apiClient.get<User>('/users/123');
 *
 * // Make a POST request
 * const created = await apiClient.post<User>('/users', { name: 'John' });
 * ```
 */
class ApiClient {
  private readonly client: AxiosInstance;

  /**
   * Creates a new ApiClient instance.
   *
   * Configures axios with base URL, timeout, and interceptors for:
   * - Automatic bearer token injection
   * - Automatic 401 handling with redirect to login
   *
   * @constructor
   */
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPE.JSON,
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
          if (token) {
            config.headers[HTTP_HEADERS.AUTHORIZATION] = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            window.location.href = PUBLIC_ROUTES.LOGIN;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Performs a GET request.
   *
   * @async
   * @template T - The expected response data type
   * @param {string} url - The API endpoint path (relative to base URL)
   * @param {AxiosRequestConfig} [config] - Optional axios configuration
   * @returns {Promise<T>} The response data
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized - triggers automatic logout and redirect
   * @throws {Error} Other HTTP errors from the API
   *
   * @example
   * ```typescript
   * const user = await apiClient.get<User>('/users/123');
   * console.log(user.name);
   *
   * // With query parameters
   * const users = await apiClient.get<User[]>('/users?role=admin');
   * ```
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * Performs a POST request.
   *
   * @async
   * @template T - The expected response data type
   * @param {string} url - The API endpoint path (relative to base URL)
   * @param {unknown} [data] - The request body data
   * @param {AxiosRequestConfig} [config] - Optional axios configuration
   * @returns {Promise<T>} The response data
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized - triggers automatic logout and redirect
   * @throws {Error} 400 Bad Request if validation fails
   * @throws {Error} Other HTTP errors from the API
   *
   * @example
   * ```typescript
   * const newUser = await apiClient.post<User>('/users', {
   *   name: 'John Doe',
   *   email: 'john@example.com'
   * });
   * console.log(newUser.id);
   * ```
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Performs a PUT request.
   *
   * @async
   * @template T - The expected response data type
   * @param {string} url - The API endpoint path (relative to base URL)
   * @param {unknown} [data] - The request body data
   * @param {AxiosRequestConfig} [config] - Optional axios configuration
   * @returns {Promise<T>} The response data
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized - triggers automatic logout and redirect
   * @throws {Error} 404 Not Found if resource doesn't exist
   * @throws {Error} 400 Bad Request if validation fails
   * @throws {Error} Other HTTP errors from the API
   *
   * @example
   * ```typescript
   * const updated = await apiClient.put<User>('/users/123', {
   *   name: 'Jane Doe'
   * });
   * console.log(updated.name); // "Jane Doe"
   * ```
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Performs a DELETE request.
   *
   * @async
   * @template T - The expected response data type
   * @param {string} url - The API endpoint path (relative to base URL)
   * @param {AxiosRequestConfig} [config] - Optional axios configuration
   * @returns {Promise<T>} The response data
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized - triggers automatic logout and redirect
   * @throws {Error} 404 Not Found if resource doesn't exist
   * @throws {Error} 403 Forbidden if user lacks delete permissions
   * @throws {Error} Other HTTP errors from the API
   *
   * @example
   * ```typescript
   * await apiClient.delete<void>('/users/123');
   * // User deleted successfully
   * ```
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Performs a PATCH request for partial updates.
   *
   * @async
   * @template T - The expected response data type
   * @param {string} url - The API endpoint path (relative to base URL)
   * @param {unknown} [data] - The partial update data
   * @param {AxiosRequestConfig} [config] - Optional axios configuration
   * @returns {Promise<T>} The response data
   * @throws {Error} Network error if connection fails
   * @throws {Error} 401 Unauthorized - triggers automatic logout and redirect
   * @throws {Error} 404 Not Found if resource doesn't exist
   * @throws {Error} 400 Bad Request if validation fails
   * @throws {Error} Other HTTP errors from the API
   *
   * @example
   * ```typescript
   * const updated = await apiClient.patch<User>('/users/123', {
   *   email: 'newemail@example.com'
   * });
   * // Only email updated, other fields unchanged
   * ```
   */
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }
}

/**
 * Pre-configured ApiClient instance for making HTTP requests.
 *
 * This is the primary API client used throughout the application.
 * It is configured with the base URL from API_CONFIG and includes
 * automatic authentication token management.
 *
 * @type {ApiClient}
 *
 * @example
 * ```typescript
 * import { apiClient } from './api';
 *
 * // All service files use this instance
 * export const userService = {
 *   getUser: (id: string) => apiClient.get(`/users/${id}`)
 * };
 * ```
 */
export const apiClient = new ApiClient();
