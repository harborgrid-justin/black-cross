/**
 * @fileoverview Application-wide constants and configuration for Black-Cross.
 *
 * Provides centralized constant definitions for:
 * - Application metadata and branding
 * - Storage keys for browser storage (localStorage, sessionStorage, cookies)
 * - Timeout and delay configurations
 * - Pagination defaults
 * - Date and time formatting
 * - UI colors and themes
 * - Severity and priority levels
 * - User roles and permissions
 * - File upload limits
 * - Validation rules
 * - Animation durations
 * - Z-index layer management
 *
 * All constants use `as const` assertion for strict type safety and
 * to prevent accidental modifications.
 *
 * @module constants/app
 *
 * @example
 * ```typescript
 * import { APP, STORAGE_KEYS, PAGINATION } from '@/constants/app';
 *
 * console.log(APP.NAME); // 'Black-Cross'
 * localStorage.setItem(STORAGE_KEYS.TOKEN, token);
 * const pageSize = PAGINATION.DEFAULT_PAGE_SIZE; // 20
 * ```
 */

/**
 * Application metadata and branding information.
 *
 * @constant
 * @type {Object}
 * @property {string} NAME - Application name
 * @property {string} TITLE - Full application title
 * @property {string} VERSION - Current version number (SemVer)
 * @property {string} DESCRIPTION - Application description
 */
export const APP = {
  NAME: 'Black-Cross',
  TITLE: 'Enterprise Cyber Threat Intelligence Platform',
  VERSION: '1.0.0',
  DESCRIPTION: 'Advanced threat intelligence and security operations platform',
} as const;

/**
 * LocalStorage keys for persisting application state.
 *
 * @constant
 * @type {Object}
 * @property {string} TOKEN - JWT authentication token
 * @property {string} USER - Serialized user object
 * @property {string} THEME - Selected UI theme (light/dark)
 * @property {string} LANGUAGE - Selected language code
 * @property {string} SIDEBAR_STATE - Sidebar collapsed/expanded state
 * @property {string} RECENT_SEARCHES - Array of recent search queries
 * @property {string} PREFERENCES - User preferences object
 * @property {string} DASHBOARD_LAYOUT - Dashboard widget layout configuration
 *
 * @example
 * ```typescript
 * import { STORAGE_KEYS } from '@/constants/app';
 *
 * localStorage.setItem(STORAGE_KEYS.TOKEN, authToken);
 * const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
 * ```
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
 * SessionStorage keys for temporary data that persists across page reloads
 * but is cleared when the browser tab is closed.
 *
 * @constant
 * @type {Object}
 * @property {string} REDIRECT_URL - URL to redirect to after authentication
 * @property {string} TEMP_DATA - Temporary application data
 * @property {string} FORM_STATE - In-progress form data for recovery
 *
 * @example
 * ```typescript
 * import { SESSION_KEYS } from '@/constants/app';
 *
 * sessionStorage.setItem(SESSION_KEYS.REDIRECT_URL, location.pathname);
 * ```
 */
export const SESSION_KEYS = {
  REDIRECT_URL: 'redirectUrl',
  TEMP_DATA: 'tempData',
  FORM_STATE: 'formState',
} as const;

/**
 * Cookie names for HTTP cookies.
 *
 * @constant
 * @type {Object}
 * @property {string} SESSION_ID - Session identifier cookie
 * @property {string} CSRF_TOKEN - CSRF protection token
 * @property {string} REMEMBER_ME - Remember me preference
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
 * Form validation rules and constraints.
 *
 * @constant
 * @type {Object}
 * @property {number} PASSWORD_MIN_LENGTH - Minimum password length (8 characters)
 * @property {number} PASSWORD_MAX_LENGTH - Maximum password length (128 characters)
 * @property {number} USERNAME_MIN_LENGTH - Minimum username length (3 characters)
 * @property {number} USERNAME_MAX_LENGTH - Maximum username length (50 characters)
 * @property {number} EMAIL_MAX_LENGTH - Maximum email length (255 characters)
 * @property {number} SEARCH_MIN_LENGTH - Minimum search query length (2 characters)
 * @property {number} SEARCH_MAX_LENGTH - Maximum search query length (100 characters)
 *
 * @example
 * ```typescript
 * import { VALIDATION } from '@/constants/app';
 *
 * if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
 *   throw new Error('Password too short');
 * }
 * ```
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
