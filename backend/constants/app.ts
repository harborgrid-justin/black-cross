/**
 * Application-wide Constants
 * Centralized constants for the Black-Cross platform
 */

/**
 * Application metadata
 */
export const APP = {
  NAME: 'Black-Cross',
  TITLE: 'Enterprise Cyber Threat Intelligence Platform',
  VERSION: '1.0.0',
  DESCRIPTION: 'Enterprise-grade Cyber Threat Intelligence Platform API',
  CONTACT: {
    NAME: 'Black-Cross Team',
    EMAIL: 'support@black-cross.io',
  },
  LICENSE: {
    NAME: 'MIT',
    URL: 'https://opensource.org/licenses/MIT',
  },
} as const;

/**
 * Default port values
 */
export const PORTS = {
  APP: 8080,
  METRICS: 9090,
  MONGODB: 27017,
  POSTGRESQL: 5432,
  REDIS: 6379,
  ELASTICSEARCH: 9200,
  RABBITMQ: 5672,
  RABBITMQ_MANAGEMENT: 15672,
} as const;

/**
 * Time constants in milliseconds
 */
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Cache durations in milliseconds
 */
export const CACHE_DURATION = {
  HEALTH_CHECK: 5 * TIME.SECOND,
  SHORT: 1 * TIME.MINUTE,
  MEDIUM: 5 * TIME.MINUTE,
  LONG: 15 * TIME.MINUTE,
  VERY_LONG: 1 * TIME.HOUR,
} as const;

/**
 * Rate limiting defaults
 */
export const RATE_LIMIT = {
  WINDOW_MS: 15 * TIME.MINUTE,
  MAX_REQUESTS_GLOBAL: 1000,
  MAX_REQUESTS_API: 100,
  MAX_REQUESTS_AUTH: 5,
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

/**
 * Module feature count
 */
export const MODULES = {
  PRIMARY_COUNT: 15,
  SUB_FEATURES_COUNT: 105,
} as const;

/**
 * JWT defaults
 */
export const JWT = {
  DEFAULT_EXPIRATION: '24h',
  ISSUER: 'black-cross',
  AUDIENCE: 'black-cross-api',
} as const;

/**
 * Bcrypt defaults
 */
export const BCRYPT = {
  DEFAULT_ROUNDS: 10,
  MIN_ROUNDS: 10,
  MAX_ROUNDS: 15,
} as const;

/**
 * Logging defaults
 */
export const LOGGING = {
  DEFAULT_LEVEL: 'info',
  DEFAULT_MAX_SIZE: '10m',
  DEFAULT_MAX_FILES: 5,
} as const;

/**
 * Metrics constants
 */
export const METRICS = {
  MAX_DURATION_RECORDS: 1000,
  PROMETHEUS_VERSION: '0.0.4',
} as const;

/**
 * MongoDB connection options
 */
export const MONGODB = {
  DEFAULT_MAX_POOL_SIZE: 10,
  DEFAULT_MIN_POOL_SIZE: 2,
  SERVER_SELECTION_TIMEOUT_MS: 5000,
  SOCKET_TIMEOUT_MS: 45000,
} as const;

/**
 * Swagger UI customization
 */
export const SWAGGER = {
  CUSTOM_SITE_TITLE: 'Black-Cross API Documentation',
  CUSTOM_CSS: '.swagger-ui .topbar { display: none }',
} as const;

/**
 * Status values
 */
export const STATUS = {
  OPERATIONAL: 'operational',
  DEGRADED: 'degraded',
  OFFLINE: 'offline',
  HEALTHY: 'healthy',
  UNHEALTHY: 'unhealthy',
  READY: 'ready',
  NOT_READY: 'not ready',
  ALIVE: 'alive',
} as const;

/**
 * Environment values
 */
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;
