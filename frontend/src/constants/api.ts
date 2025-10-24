/**
 * @fileoverview API Constants and endpoint definitions for the Black-Cross platform.
 *
 * Provides centralized configuration for all API communication including:
 * - Base URLs and configuration settings
 * - Typed endpoint definitions for all platform modules
 * - HTTP status code constants
 * - Standard headers and content types
 *
 * All endpoints are organized by feature module for maintainability and
 * type safety. Dynamic endpoints use factory functions for URL construction.
 *
 * @module constants/api
 *
 * @example
 * ```typescript
 * import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';
 *
 * // Using configuration
 * const apiUrl = API_CONFIG.BASE_URL;
 *
 * // Using endpoint
 * const threatsUrl = API_ENDPOINTS.THREATS.LIST;
 * const threatUrl = API_ENDPOINTS.THREATS.BY_ID('123');
 * ```
 */

/**
 * Core API configuration settings.
 *
 * @constant
 * @type {Object}
 * @property {string} BASE_URL - Base API URL from environment or default '/api/v1'
 * @property {number} TIMEOUT - Request timeout in milliseconds (30 seconds)
 * @property {number} RETRY_ATTEMPTS - Number of retry attempts for failed requests
 * @property {number} RETRY_DELAY - Delay between retry attempts in milliseconds (1 second)
 *
 * @example
 * ```typescript
 * import axios from 'axios';
 * import { API_CONFIG } from '@/constants/api';
 *
 * const client = axios.create({
 *   baseURL: API_CONFIG.BASE_URL,
 *   timeout: API_CONFIG.TIMEOUT,
 * });
 * ```
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api/v1',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

/**
 * API version prefix for all endpoints.
 *
 * @constant
 * @type {string}
 */
export const API_VERSION = '/api/v1';

/**
 * Comprehensive API endpoint definitions organized by feature module.
 *
 * Each module contains static endpoint strings and dynamic endpoint factory
 * functions for parameterized URLs. All endpoints use absolute paths from
 * the API root.
 *
 * @constant
 * @type {Object}
 */
export const API_ENDPOINTS = {
  /**
   * Authentication endpoints for user login, registration, and session management.
   *
   * @property {string} LOGIN - User login endpoint
   * @property {string} LOGOUT - User logout endpoint
   * @property {string} REGISTER - New user registration
   * @property {string} REFRESH - Token refresh endpoint
   * @property {string} ME - Get current user information
   * @property {string} FORGOT_PASSWORD - Request password reset
   * @property {string} RESET_PASSWORD - Complete password reset
   */
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Threat Intelligence
  THREATS: {
    BASE: '/threat-intelligence',
    LIST: '/threat-intelligence',
    BY_ID: (id: string) => `/threat-intelligence/${id}`,
    SEARCH: '/threat-intelligence/search',
    STATS: '/threat-intelligence/stats',
    EXPORT: '/threat-intelligence/export',
    CORRELATE: '/threat-intelligence/correlate',
    ENRICH: (id: string) => `/threat-intelligence/${id}/enrich`,
  },

  // Incidents
  INCIDENTS: {
    BASE: '/incident-response',
    LIST: '/incident-response',
    BY_ID: (id: string) => `/incident-response/${id}`,
    CREATE: '/incident-response',
    UPDATE: (id: string) => `/incident-response/${id}`,
    DELETE: (id: string) => `/incident-response/${id}`,
    TIMELINE: (id: string) => `/incident-response/${id}/timeline`,
    STATS: '/incident-response/stats',
  },

  // Vulnerabilities
  VULNERABILITIES: {
    BASE: '/vulnerability-management',
    LIST: '/vulnerability-management',
    BY_ID: (id: string) => `/vulnerability-management/${id}`,
    SCAN: '/vulnerability-management/scan',
    STATS: '/vulnerability-management/stats',
    EXPORT: '/vulnerability-management/export',
  },

  // IOCs
  IOCS: {
    BASE: '/ioc-management',
    LIST: '/ioc-management',
    BY_ID: (id: string) => `/ioc-management/${id}`,
    SEARCH: '/ioc-management/search',
    CHECK: '/ioc-management/check',
    BULK_IMPORT: '/ioc-management/bulk-import',
  },

  // Threat Actors
  THREAT_ACTORS: {
    BASE: '/threat-actors',
    LIST: '/threat-actors',
    BY_ID: (id: string) => `/threat-actors/${id}`,
    SEARCH: '/threat-actors/search',
    CAMPAIGNS: (id: string) => `/threat-actors/${id}/campaigns`,
  },

  // Threat Feeds
  FEEDS: {
    BASE: '/threat-feeds',
    LIST: '/threat-feeds',
    BY_ID: (id: string) => `/threat-feeds/${id}`,
    SYNC: (id: string) => `/threat-feeds/${id}/sync`,
    STATS: '/threat-feeds/stats',
  },

  // SIEM
  SIEM: {
    BASE: '/siem',
    EVENTS: '/siem/events',
    ALERTS: '/siem/alerts',
    DASHBOARD: '/siem/dashboard',
    SEARCH: '/siem/search',
  },

  // Threat Hunting
  THREAT_HUNTING: {
    BASE: '/threat-hunting',
    SESSIONS: '/threat-hunting/sessions',
    BY_ID: (id: string) => `/threat-hunting/sessions/${id}`,
    QUERIES: '/threat-hunting/queries',
    RESULTS: (id: string) => `/threat-hunting/sessions/${id}/results`,
  },

  // Risk Assessment
  RISK: {
    BASE: '/risk-assessment',
    ASSESSMENTS: '/risk-assessment',
    BY_ID: (id: string) => `/risk-assessment/${id}`,
    CALCULATE: '/risk-assessment/calculate',
    DASHBOARD: '/risk-assessment/dashboard',
  },

  // Malware Analysis
  MALWARE: {
    BASE: '/malware-analysis',
    SAMPLES: '/malware-analysis/samples',
    BY_ID: (id: string) => `/malware-analysis/samples/${id}`,
    UPLOAD: '/malware-analysis/upload',
    ANALYZE: (id: string) => `/malware-analysis/samples/${id}/analyze`,
    REPORT: (id: string) => `/malware-analysis/samples/${id}/report`,
  },

  // Dark Web
  DARK_WEB: {
    BASE: '/dark-web',
    INTEL: '/dark-web/intel',
    MONITOR: '/dark-web/monitor',
    ALERTS: '/dark-web/alerts',
  },

  // Compliance
  COMPLIANCE: {
    BASE: '/compliance',
    FRAMEWORKS: '/compliance/frameworks',
    AUDITS: '/compliance/audits',
    REPORTS: '/compliance/reports',
  },

  // Collaboration
  COLLABORATION: {
    BASE: '/collaboration',
    WORKSPACES: '/collaboration/workspaces',
    BY_ID: (id: string) => `/collaboration/workspaces/${id}`,
    INVITE: (id: string) => `/collaboration/workspaces/${id}/invite`,
  },

  // Reporting
  REPORTING: {
    BASE: '/reporting',
    REPORTS: '/reporting',
    BY_ID: (id: string) => `/reporting/${id}`,
    GENERATE: '/reporting/generate',
    TEMPLATES: '/reporting/templates',
  },

  // Automation & Playbooks
  AUTOMATION: {
    BASE: '/automation',
    PLAYBOOKS: '/automation/playbooks',
    BY_ID: (id: string) => `/automation/playbooks/${id}`,
    EXECUTE: (id: string) => `/automation/playbooks/${id}/execute`,
    INTEGRATIONS: '/automation/integrations',
  },

  // System
  SYSTEM: {
    HEALTH: '/health',
    METRICS: '/metrics',
    SETTINGS: '/settings',
  },
} as const;

/**
 * Standard HTTP status codes used throughout the application.
 *
 * @constant
 * @type {Object}
 * @property {number} OK - 200: Request succeeded
 * @property {number} CREATED - 201: Resource created successfully
 * @property {number} NO_CONTENT - 204: Success with no response body
 * @property {number} BAD_REQUEST - 400: Invalid request parameters
 * @property {number} UNAUTHORIZED - 401: Authentication required
 * @property {number} FORBIDDEN - 403: Insufficient permissions
 * @property {number} NOT_FOUND - 404: Resource not found
 * @property {number} CONFLICT - 409: Request conflicts with current state
 * @property {number} UNPROCESSABLE_ENTITY - 422: Validation failed
 * @property {number} TOO_MANY_REQUESTS - 429: Rate limit exceeded
 * @property {number} INTERNAL_SERVER_ERROR - 500: Server error
 * @property {number} SERVICE_UNAVAILABLE - 503: Service temporarily unavailable
 *
 * @example
 * ```typescript
 * import { HTTP_STATUS } from '@/constants/api';
 *
 * if (response.status === HTTP_STATUS.UNAUTHORIZED) {
 *   redirectToLogin();
 * }
 * ```
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Standard HTTP header names.
 *
 * @constant
 * @type {Object}
 * @property {string} AUTHORIZATION - Authorization header for bearer tokens
 * @property {string} CONTENT_TYPE - Content type specification
 * @property {string} ACCEPT - Accepted response content types
 * @property {string} X_REQUEST_ID - Request correlation ID for tracing
 *
 * @example
 * ```typescript
 * import { HTTP_HEADERS } from '@/constants/api';
 *
 * headers[HTTP_HEADERS.AUTHORIZATION] = `Bearer ${token}`;
 * headers[HTTP_HEADERS.CONTENT_TYPE] = 'application/json';
 * ```
 */
export const HTTP_HEADERS = {
  AUTHORIZATION: 'Authorization',
  CONTENT_TYPE: 'Content-Type',
  ACCEPT: 'Accept',
  X_REQUEST_ID: 'X-Request-ID',
} as const;

/**
 * Standard content type MIME types.
 *
 * @constant
 * @type {Object}
 * @property {string} JSON - application/json for JSON payloads
 * @property {string} FORM_DATA - multipart/form-data for file uploads
 * @property {string} URL_ENCODED - application/x-www-form-urlencoded for form submissions
 *
 * @example
 * ```typescript
 * import { CONTENT_TYPE } from '@/constants/api';
 *
 * headers['Content-Type'] = CONTENT_TYPE.JSON;
 * ```
 */
export const CONTENT_TYPE = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
} as const;
