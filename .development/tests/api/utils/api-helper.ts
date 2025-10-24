/**
 * API Testing Helper Utilities
 * 
 * Provides common utilities for testing API endpoints including
 * authentication, request helpers, and validation utilities.
 */

import { APIRequestContext, expect } from '@playwright/test';

export interface ApiResponse<T = any> {
  status: number;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Base API helper class for making authenticated requests
 */
export class ApiHelper {
  private baseURL: string;
  private authToken?: string;

  constructor(baseURL: string = 'http://localhost:8080') {
    this.baseURL = baseURL;
  }

  /**
   * Set authentication token for subsequent requests
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Get authentication headers
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Make GET request
   */
  async get<T = any>(
    request: APIRequestContext,
    endpoint: string
  ): Promise<ApiResponse<T>> {
    const response = await request.get(`${this.baseURL}${endpoint}`, {
      headers: this.getHeaders(),
    });

    const data = await response.json().catch(() => ({}));
    return {
      status: response.status(),
      data,
    };
  }

  /**
   * Make POST request
   */
  async post<T = any>(
    request: APIRequestContext,
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    const response = await request.post(`${this.baseURL}${endpoint}`, {
      headers: this.getHeaders(),
      data: body,
    });

    const data = await response.json().catch(() => ({}));
    return {
      status: response.status(),
      data,
    };
  }

  /**
   * Make PUT request
   */
  async put<T = any>(
    request: APIRequestContext,
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    const response = await request.put(`${this.baseURL}${endpoint}`, {
      headers: this.getHeaders(),
      data: body,
    });

    const data = await response.json().catch(() => ({}));
    return {
      status: response.status(),
      data,
    };
  }

  /**
   * Make DELETE request
   */
  async delete<T = any>(
    request: APIRequestContext,
    endpoint: string
  ): Promise<ApiResponse<T>> {
    const response = await request.delete(`${this.baseURL}${endpoint}`, {
      headers: this.getHeaders(),
    });

    const data = await response.json().catch(() => ({}));
    return {
      status: response.status(),
      data,
    };
  }

  /**
   * Authenticate and get token
   */
  async authenticate(
    request: APIRequestContext,
    username: string = 'admin',
    password: string = 'admin123'
  ): Promise<string> {
    const response = await this.post(request, '/api/v1/auth/login', {
      username,
      password,
    });

    if (response.data?.token) {
      this.setAuthToken(response.data.token);
      return response.data.token;
    }

    throw new Error('Authentication failed');
  }

  /**
   * Validate successful response
   */
  validateSuccess(response: ApiResponse, expectedStatus: number = 200): void {
    expect(response.status).toBe(expectedStatus);
    expect(response.data).toBeDefined();
  }

  /**
   * Validate error response
   */
  validateError(response: ApiResponse, expectedStatus: number): void {
    expect(response.status).toBe(expectedStatus);
  }

  /**
   * Validate response has required fields
   */
  validateFields(data: any, fields: string[]): void {
    for (const field of fields) {
      expect(data).toHaveProperty(field);
    }
  }
}

/**
 * Wait for service to be ready
 */
export async function waitForService(
  request: APIRequestContext,
  url: string,
  maxAttempts: number = 30,
  interval: number = 1000
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await request.get(url);
      if (response.ok()) {
        return true;
      }
    } catch (error) {
      // Service not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  return false;
}

/**
 * Generate test data for creating resources
 */
export const TestDataGenerator = {
  threat: () => ({
    name: `Test Threat ${Date.now()}`,
    type: 'malware',
    severity: 'high',
    description: 'Test threat intelligence data',
    indicators: ['192.168.1.1', 'malicious.example.com'],
  }),

  incident: () => ({
    title: `Test Incident ${Date.now()}`,
    severity: 'critical',
    status: 'open',
    description: 'Test incident for API testing',
  }),

  vulnerability: () => ({
    cve: `CVE-2024-${Math.floor(Math.random() * 10000)}`,
    severity: 'high',
    description: 'Test vulnerability',
    affected_systems: ['test-system-1'],
  }),

  ioc: () => ({
    type: 'ip',
    value: `192.168.1.${Math.floor(Math.random() * 255)}`,
    threat_level: 'high',
    description: 'Test IOC',
  }),

  threatActor: () => ({
    name: `Test Actor ${Date.now()}`,
    aliases: ['Test Alias'],
    sophistication: 'advanced',
    motivation: 'financial',
  }),
};
