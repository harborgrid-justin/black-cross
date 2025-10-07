/**
 * Security Constants
 * Security-related constants and configurations
 */

/**
 * Password Requirements
 */
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
  SPECIAL_CHARS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  MAX_CONSECUTIVE_CHARS: 3,
  MIN_UNIQUE_CHARS: 5,
} as const;

/**
 * Session Configuration
 */
export const SESSION_CONFIG = {
  DURATION: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_THRESHOLD: 60 * 60 * 1000, // 1 hour before expiry
  MAX_SESSIONS_PER_USER: 5,
  IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  ABSOLUTE_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

/**
 * Rate Limiting Tiers
 */
export const RATE_LIMITS = {
  AUTHENTICATION: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_ATTEMPTS: 5,
    BLOCK_DURATION: 60 * 60 * 1000, // 1 hour
  },
  API_GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
  API_WRITE: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 10,
  },
  API_READ: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 60,
  },
  SEARCH: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 30,
  },
  EXPORT: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 10,
  },
} as const;

/**
 * Encryption Settings
 */
export const ENCRYPTION = {
  ALGORITHM: 'aes-256-gcm',
  KEY_LENGTH: 32, // bytes
  IV_LENGTH: 16,  // bytes
  SALT_LENGTH: 64, // bytes
  TAG_LENGTH: 16,  // bytes
} as const;

/**
 * CORS Configuration
 */
export const CORS_CONFIG = {
  ALLOWED_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://black-cross.io',
  ],
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: [
    'Content-Type',
    'Authorization',
    'X-Request-ID',
    'X-Correlation-ID',
  ],
  EXPOSE_HEADERS: [
    'X-Request-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  CREDENTIALS: true,
  MAX_AGE: 86400, // 24 hours
} as const;

/**
 * CSP (Content Security Policy) Directives
 */
export const CSP_DIRECTIVES = {
  DEFAULT_SRC: ["'self'"],
  SCRIPT_SRC: ["'self'", "'unsafe-inline'"],
  STYLE_SRC: ["'self'", "'unsafe-inline'"],
  IMG_SRC: ["'self'", 'data:', 'https:'],
  FONT_SRC: ["'self'", 'data:'],
  CONNECT_SRC: ["'self'"],
  FRAME_ANCESTORS: ["'none'"],
  FORM_ACTION: ["'self'"],
  BASE_URI: ["'self'"],
} as const;

/**
 * Security Headers
 */
export const SECURITY_HEADERS = {
  HSTS: 'max-age=31536000; includeSubDomains',
  X_FRAME_OPTIONS: 'DENY',
  X_CONTENT_TYPE_OPTIONS: 'nosniff',
  X_XSS_PROTECTION: '1; mode=block',
  REFERRER_POLICY: 'strict-origin-when-cross-origin',
  PERMISSIONS_POLICY: 'geolocation=(), microphone=(), camera=()',
} as const;

/**
 * API Key Configuration
 */
export const API_KEY_CONFIG = {
  LENGTH: 32,
  PREFIX: 'bc_',
  EXPIRY_DAYS: 90,
  MAX_KEYS_PER_USER: 10,
} as const;

/**
 * Audit Log Events
 */
export const AUDIT_EVENTS = {
  // Authentication
  LOGIN_SUCCESS: 'auth.login.success',
  LOGIN_FAILURE: 'auth.login.failure',
  LOGOUT: 'auth.logout',
  PASSWORD_CHANGE: 'auth.password.change',
  PASSWORD_RESET: 'auth.password.reset',
  MFA_ENABLED: 'auth.mfa.enabled',
  MFA_DISABLED: 'auth.mfa.disabled',

  // User Management
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_LOCKED: 'user.locked',
  USER_UNLOCKED: 'user.unlocked',

  // Data Access
  DATA_VIEWED: 'data.viewed',
  DATA_CREATED: 'data.created',
  DATA_UPDATED: 'data.updated',
  DATA_DELETED: 'data.deleted',
  DATA_EXPORTED: 'data.exported',

  // System
  SETTINGS_CHANGED: 'system.settings.changed',
  INTEGRATION_ADDED: 'system.integration.added',
  INTEGRATION_REMOVED: 'system.integration.removed',
  API_KEY_CREATED: 'system.api_key.created',
  API_KEY_REVOKED: 'system.api_key.revoked',
} as const;

/**
 * Threat Detection Thresholds
 */
export const THREAT_THRESHOLDS = {
  CRITICAL: 9.0,
  HIGH: 7.0,
  MEDIUM: 4.0,
  LOW: 0.1,
  BULK_IOC_LIMIT: 10000,
  CORRELATION_WINDOW_HOURS: 24,
} as const;
