/**
 * @fileoverview API Constants
 * 
 * Centralized API endpoints and configuration including base URLs, endpoints,
 * HTTP status codes, headers, and content types.
 * 
 * @module constants/api
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api/v1',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

/**
 * API Version
 */
export const API_VERSION = '/api/v1';

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
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
 * HTTP Status Codes
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
 * HTTP Headers
 */
export const HTTP_HEADERS = {
  AUTHORIZATION: 'Authorization',
  CONTENT_TYPE: 'Content-Type',
  ACCEPT: 'Accept',
  X_REQUEST_ID: 'X-Request-ID',
} as const;

/**
 * Content Types
 */
export const CONTENT_TYPE = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
} as const;
