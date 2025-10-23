/**
 * @fileoverview API Client
 * 
 * Provides the main API client class for making HTTP requests with
 * authentication, error handling, and request/response interceptors.
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
 * @class ApiClient
 */
class ApiClient {
  private readonly client: AxiosInstance;

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

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
