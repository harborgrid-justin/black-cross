/**
 * @fileoverview Application Constants
 * 
 * Centralized application-wide constants including app metadata, storage keys,
 * timeouts, pagination settings, colors, and validation rules.
 * 
 * @module constants/app
 */

/**
 * Application Metadata
 */
export const APP = {
  NAME: 'Black-Cross',
  TITLE: 'Enterprise Cyber Threat Intelligence Platform',
  VERSION: '1.0.0',
  DESCRIPTION: 'Advanced threat intelligence and security operations platform',
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_STATE: 'sidebarState',
  RECENT_SEARCHES: 'recentSearches',
  PREFERENCES: 'preferences',
  DASHBOARD_LAYOUT: 'dashboardLayout',
} as const;

/**
 * Session Storage Keys
 */
export const SESSION_KEYS = {
  REDIRECT_URL: 'redirectUrl',
  TEMP_DATA: 'tempData',
  FORM_STATE: 'formState',
} as const;

/**
 * Cookie Names
 */
export const COOKIE_NAMES = {
  SESSION_ID: 'sessionId',
  CSRF_TOKEN: 'csrfToken',
  REMEMBER_ME: 'rememberMe',
} as const;

/**
 * Default Timeouts (in milliseconds)
 */
export const TIMEOUTS = {
  SHORT: 3000,    // 3 seconds
  MEDIUM: 5000,   // 5 seconds
  LONG: 10000,    // 10 seconds
  VERY_LONG: 30000, // 30 seconds
} as const;

/**
 * Debounce Delays (in milliseconds)
 */
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  INPUT: 500,
  RESIZE: 200,
  SCROLL: 150,
} as const;

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  FULL: 'YYYY-MM-DD HH:mm:ss',
  DATE_ONLY: 'YYYY-MM-DD',
  TIME_ONLY: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm',
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_TIME: 'MMM DD, YYYY HH:mm',
  ISO: 'iso',
  RELATIVE: 'relative',
} as const;

/**
 * Chart Colors
 */
export const CHART_COLORS = {
  PRIMARY: '#1976d2',
  SECONDARY: '#dc004e',
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  ERROR: '#f44336',
  INFO: '#2196f3',
  GREY: '#9e9e9e',
  CRITICAL: '#d32f2f',
  HIGH: '#f57c00',
  MEDIUM: '#fbc02d',
  LOW: '#388e3c',
} as const;

/**
 * Severity Levels
 */
export const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFORMATIONAL: 'informational',
} as const;

/**
 * Severity Colors
 */
export const SEVERITY_COLORS = {
  [SEVERITY.CRITICAL]: CHART_COLORS.CRITICAL,
  [SEVERITY.HIGH]: CHART_COLORS.HIGH,
  [SEVERITY.MEDIUM]: CHART_COLORS.MEDIUM,
  [SEVERITY.LOW]: CHART_COLORS.LOW,
  [SEVERITY.INFORMATIONAL]: CHART_COLORS.INFO,
} as const;

/**
 * Status Values
 */
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  IN_PROGRESS: 'in_progress',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
} as const;

/**
 * Priority Levels
 */
export const PRIORITY = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

/**
 * User Roles
 */
export const ROLES = {
  ADMIN: 'admin',
  ANALYST: 'analyst',
  VIEWER: 'viewer',
} as const;

/**
 * Theme Values
 */
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
} as const;

/**
 * Language Codes
 */
export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  JA: 'ja',
  ZH: 'zh',
} as const;

/**
 * Notification Types
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

/**
 * File Upload Limits
 */
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_SIZE_LABEL: '10MB',
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    CSV: ['text/csv', 'application/vnd.ms-excel'],
    JSON: ['application/json'],
    ALL: ['*/*'],
  },
} as const;

/**
 * Validation Rules
 */
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 255,
  SEARCH_MIN_LENGTH: 2,
  SEARCH_MAX_LENGTH: 100,
} as const;

/**
 * Animation Durations (in milliseconds)
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * Z-Index Layers
 */
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  NOTIFICATION: 1080,
} as const;
