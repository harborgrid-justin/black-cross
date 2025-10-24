/**
 * Centralized Configuration Management
 *
 * Enterprise-grade configuration system with comprehensive validation and type safety.
 * This module serves as the single source of truth for all application configuration,
 * loading settings from environment variables with sensible defaults and strict validation.
 *
 * @module config
 *
 * @remarks
 * The configuration system uses Joi for runtime validation and TypeScript interfaces
 * for compile-time type safety. Configuration is validated on startup, and the
 * application will exit with detailed error messages if validation fails.
 *
 * Features:
 * - Environment-based configuration with .env file support
 * - Strict validation using Joi schemas
 * - Type-safe access via TypeScript interfaces
 * - Sensible defaults for all non-sensitive settings
 * - Support for multiple databases (PostgreSQL, MongoDB, Redis, Elasticsearch)
 * - Security settings (JWT, bcrypt, encryption, CORS)
 * - Feature flags for optional functionality
 * - Rate limiting and monitoring configuration
 *
 * @example
 * ```typescript
 * import config from './config';
 *
 * // Access application settings
 * console.log(`Server running on port ${config.app.port}`);
 *
 * // Check feature flags
 * if (config.features.darkWebMonitoring) {
 *   startDarkWebMonitoring();
 * }
 *
 * // Use database configuration
 * const dbUrl = config.database.postgresql.url;
 * ```
 *
 * @see {@link https://joi.dev/api/ Joi Validation Documentation}
 */

import 'dotenv/config';
import Joi from 'joi';
import {
  PORTS, BCRYPT, LOGGING, MONGODB, JWT, ENVIRONMENT,
} from '../constants';

/**
 * Application-level configuration settings.
 *
 * Defines core application properties including environment mode,
 * network settings, and identification.
 *
 * @interface AppConfig
 *
 * @property {string} name - Application name displayed in logs and headers
 * @property {'development' | 'production' | 'test'} env - Current runtime environment
 * @property {number} port - TCP port number for HTTP server (1-65535)
 * @property {string} host - Network interface to bind (e.g., '0.0.0.0', 'localhost')
 * @property {string} url - Full base URL for the application (used for callbacks, links)
 *
 * @example
 * ```typescript
 * const appConfig: AppConfig = {
 *   name: 'Black-Cross',
 *   env: 'production',
 *   port: 8080,
 *   host: '0.0.0.0',
 *   url: 'https://api.example.com'
 * };
 * ```
 */
export interface AppConfig {
  name: string;
  env: 'development' | 'production' | 'test';
  port: number;
  host: string;
  url: string;
}

/**
 * Database connection configuration for all supported data stores.
 *
 * Provides connection settings for PostgreSQL (primary relational database),
 * MongoDB (optional document store), Redis (caching and session management),
 * and Elasticsearch (search and analytics).
 *
 * @interface DatabaseConfig
 *
 * @property {Object} mongodb - MongoDB configuration for unstructured data and logs
 * @property {string} mongodb.uri - MongoDB connection URI (e.g., 'mongodb://localhost:27017/blackcross')
 * @property {Object} mongodb.options - Connection pool settings
 * @property {number} mongodb.options.maxPoolSize - Maximum number of connections in pool
 * @property {number} mongodb.options.minPoolSize - Minimum number of connections to maintain
 *
 * @property {Object} postgresql - PostgreSQL configuration (primary database)
 * @property {string} postgresql.url - Full PostgreSQL connection URL
 * @property {string} postgresql.host - PostgreSQL server hostname
 * @property {number} postgresql.port - PostgreSQL server port (default: 5432)
 * @property {string} postgresql.database - Database name
 * @property {string} postgresql.user - Database username
 * @property {string} postgresql.password - Database password (sensitive)
 *
 * @property {Object} redis - Redis configuration for caching and sessions
 * @property {string} redis.url - Redis connection URL (e.g., 'redis://localhost:6379')
 * @property {string} redis.password - Redis authentication password (empty string if not required)
 *
 * @property {Object} elasticsearch - Elasticsearch configuration for search and analytics
 * @property {string} elasticsearch.url - Elasticsearch cluster URL
 * @property {string} elasticsearch.username - Authentication username (empty string if not required)
 * @property {string} elasticsearch.password - Authentication password (empty string if not required)
 *
 * @remarks
 * PostgreSQL is required for the application to function. MongoDB, Redis, and
 * Elasticsearch are optional services that enhance functionality when available.
 *
 * @example
 * ```typescript
 * const dbConfig: DatabaseConfig = {
 *   mongodb: {
 *     uri: 'mongodb://localhost:27017/blackcross',
 *     options: { maxPoolSize: 10, minPoolSize: 2 }
 *   },
 *   postgresql: {
 *     url: 'postgresql://user:pass@localhost:5432/blackcross',
 *     host: 'localhost',
 *     port: 5432,
 *     database: 'blackcross',
 *     user: 'blackcross',
 *     password: 'secure_password'
 *   },
 *   redis: {
 *     url: 'redis://localhost:6379',
 *     password: ''
 *   },
 *   elasticsearch: {
 *     url: 'http://localhost:9200',
 *     username: 'elastic',
 *     password: 'changeme'
 *   }
 * };
 * ```
 */
export interface DatabaseConfig {
  mongodb: {
    uri: string;
    options: {
      maxPoolSize: number;
      minPoolSize: number;
    };
  };
  postgresql: {
    url: string;
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  redis: {
    url: string;
    password: string;
  };
  elasticsearch: {
    url: string;
    username: string;
    password: string;
  };
}

/**
 * Security-related configuration settings.
 *
 * Encompasses all security mechanisms including JWT authentication,
 * password hashing, data encryption, and CORS policies.
 *
 * @interface SecurityConfig
 *
 * @property {Object} jwt - JSON Web Token configuration for authentication
 * @property {string} jwt.secret - Secret key for signing JWTs (minimum 32 characters, must be cryptographically random)
 * @property {string} jwt.expiration - Token expiration time (e.g., '24h', '7d', '30m')
 *
 * @property {Object} bcrypt - Password hashing configuration
 * @property {number} bcrypt.rounds - Number of bcrypt salt rounds (4-31, recommended: 10-12)
 *
 * @property {Object} encryption - Data encryption configuration
 * @property {string} encryption.key - 32-character encryption key for AES-256 encryption
 *
 * @property {Object} cors - Cross-Origin Resource Sharing configuration
 * @property {string} cors.origin - Allowed origin for CORS requests (e.g., 'http://localhost:3000')
 *
 * @remarks
 * All security-sensitive values (jwt.secret, encryption.key) must be:
 * - Generated using cryptographically secure random number generators
 * - Stored securely in environment variables, never in code
 * - Rotated periodically according to security policies
 * - Kept confidential and never committed to version control
 *
 * Higher bcrypt rounds increase security but also increase CPU usage and login time.
 * Balance security requirements with performance needs.
 *
 * @example
 * ```typescript
 * const securityConfig: SecurityConfig = {
 *   jwt: {
 *     secret: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', // 32+ characters
 *     expiration: '24h'
 *   },
 *   bcrypt: {
 *     rounds: 10
 *   },
 *   encryption: {
 *     key: '0123456789abcdef0123456789abcdef' // Exactly 32 characters
 *   },
 *   cors: {
 *     origin: 'https://app.example.com'
 *   }
 * };
 * ```
 *
 * @see {@link https://jwt.io/ JSON Web Tokens}
 * @see {@link https://en.wikipedia.org/wiki/Bcrypt bcrypt Algorithm}
 */
export interface SecurityConfig {
  jwt: {
    secret: string;
    expiration: string;
  };
  bcrypt: {
    rounds: number;
  };
  encryption: {
    key: string;
  };
  cors: {
    origin: string;
  };
}

/**
 * Logging system configuration.
 *
 * Controls application logging behavior including output destinations,
 * verbosity levels, and log rotation policies.
 *
 * @interface LoggingConfig
 *
 * @property {'error' | 'warn' | 'info' | 'debug' | 'verbose'} level - Minimum log level to record
 * @property {boolean} file - Whether to write logs to files (in addition to console)
 * @property {string} maxSize - Maximum size of each log file before rotation (e.g., '10m', '100k')
 * @property {number} maxFiles - Number of rotated log files to retain
 *
 * @remarks
 * Log levels in order of verbosity (least to most):
 * - 'error': Only critical errors
 * - 'warn': Warnings and errors
 * - 'info': General information, warnings, and errors (recommended for production)
 * - 'debug': Debug information plus all above (useful for development)
 * - 'verbose': All logging output including trace information
 *
 * When file logging is enabled, logs are written to disk with automatic rotation
 * based on maxSize and maxFiles settings. Old logs are automatically deleted
 * when the retention limit is reached.
 *
 * @example
 * ```typescript
 * const loggingConfig: LoggingConfig = {
 *   level: 'info',
 *   file: true,
 *   maxSize: '10m',  // 10 megabytes
 *   maxFiles: 5      // Keep 5 rotated files
 * };
 * ```
 */
export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug' | 'verbose';
  file: boolean;
  maxSize: string;
  maxFiles: number;
}

/**
 * Rate limiting configuration for API endpoints.
 *
 * Controls request throttling to prevent abuse and ensure fair resource usage.
 * Rate limits apply per IP address and reset after the time window.
 *
 * @interface RateLimitingConfig
 *
 * @property {number} windowMs - Time window in milliseconds for rate limit tracking
 * @property {number} maxRequests - Maximum number of requests allowed per window
 *
 * @remarks
 * Rate limiting helps protect against:
 * - Brute force attacks
 * - API abuse
 * - Denial of service attempts
 * - Resource exhaustion
 *
 * When a client exceeds the rate limit, they receive a 429 (Too Many Requests)
 * response. The X-RateLimit headers indicate the limit, remaining requests,
 * and reset time.
 *
 * Common configurations:
 * - Development: 1000 requests per 15 minutes
 * - Production: 100 requests per 15 minutes
 * - Strict: 50 requests per 5 minutes
 *
 * @example
 * ```typescript
 * const rateLimitConfig: RateLimitingConfig = {
 *   windowMs: 900000,  // 15 minutes (15 * 60 * 1000)
 *   maxRequests: 100   // 100 requests per 15 minutes
 * };
 * ```
 */
export interface RateLimitingConfig {
  windowMs: number;
  maxRequests: number;
}

/**
 * Feature flags for optional platform capabilities.
 *
 * Enables or disables specific security features based on organizational
 * requirements, licensing, or resource availability.
 *
 * @interface FeaturesConfig
 *
 * @property {boolean} darkWebMonitoring - Enable dark web intelligence gathering and monitoring
 * @property {boolean} malwareSandbox - Enable malware analysis and sandboxing capabilities
 * @property {boolean} automatedResponse - Enable automated incident response and remediation
 * @property {boolean} threatHunting - Enable proactive threat hunting features
 * @property {boolean} complianceManagement - Enable compliance tracking and reporting
 *
 * @remarks
 * Feature flags allow for:
 * - Gradual feature rollout
 * - A/B testing in enterprise environments
 * - Disabling resource-intensive features
 * - License-based feature access control
 * - Environment-specific configurations
 *
 * Disabling a feature does not remove its code but prevents initialization
 * and hides related UI elements. Data associated with disabled features
 * remains accessible.
 *
 * @example
 * ```typescript
 * // Production configuration with all features enabled
 * const features: FeaturesConfig = {
 *   darkWebMonitoring: true,
 *   malwareSandbox: true,
 *   automatedResponse: true,
 *   threatHunting: true,
 *   complianceManagement: true
 * };
 *
 * // Development configuration with resource-intensive features disabled
 * const devFeatures: FeaturesConfig = {
 *   darkWebMonitoring: false,
 *   malwareSandbox: false,
 *   automatedResponse: true,
 *   threatHunting: true,
 *   complianceManagement: true
 * };
 * ```
 */
export interface FeaturesConfig {
  darkWebMonitoring: boolean;
  malwareSandbox: boolean;
  automatedResponse: boolean;
  threatHunting: boolean;
  complianceManagement: boolean;
}

/**
 * Application monitoring and metrics configuration.
 *
 * Controls system health monitoring, metrics collection, and observability
 * integration with tools like Prometheus.
 *
 * @interface MonitoringConfig
 *
 * @property {boolean} enabled - Whether to enable monitoring and metrics collection
 * @property {number} port - TCP port for metrics endpoint (separate from main application port)
 * @property {boolean} prometheus - Whether to expose Prometheus-compatible metrics endpoint
 *
 * @remarks
 * When monitoring is enabled, the application exposes:
 * - Health check endpoints (/health, /ready)
 * - Application metrics (request rates, response times, error rates)
 * - System metrics (CPU, memory, database connections)
 * - Custom business metrics
 *
 * The Prometheus endpoint (when enabled) provides metrics in Prometheus text format
 * at `/metrics` on the monitoring port. This allows integration with Prometheus,
 * Grafana, and other observability platforms.
 *
 * @example
 * ```typescript
 * const monitoringConfig: MonitoringConfig = {
 *   enabled: true,
 *   port: 9090,
 *   prometheus: true  // Expose /metrics endpoint for Prometheus scraping
 * };
 * ```
 *
 * @see {@link https://prometheus.io/ Prometheus Monitoring}
 */
export interface MonitoringConfig {
  enabled: boolean;
  port: number;
  prometheus: boolean;
}

/**
 * Complete application configuration object.
 *
 * Aggregates all configuration sections into a single, type-safe interface.
 * This is the main configuration object exported and used throughout the application.
 *
 * @interface Config
 *
 * @property {AppConfig} app - Application-level settings (name, environment, port, host, URL)
 * @property {DatabaseConfig} database - Database connection settings for all data stores
 * @property {SecurityConfig} security - Security settings (JWT, bcrypt, encryption, CORS)
 * @property {LoggingConfig} logging - Logging configuration (level, file output, rotation)
 * @property {RateLimitingConfig} rateLimiting - API rate limiting settings
 * @property {FeaturesConfig} features - Feature flags for optional capabilities
 * @property {MonitoringConfig} monitoring - Monitoring and metrics configuration
 *
 * @remarks
 * This interface represents the complete, validated configuration after:
 * 1. Loading environment variables
 * 2. Applying defaults for missing values
 * 3. Validating against the Joi schema
 * 4. Type checking against TypeScript interfaces
 *
 * The configuration is immutable after initialization and should be treated
 * as read-only throughout the application lifecycle.
 *
 * @example
 * ```typescript
 * import config from './config';
 *
 * // Access nested configuration
 * const port = config.app.port;
 * const dbUrl = config.database.postgresql.url;
 * const jwtSecret = config.security.jwt.secret;
 *
 * // Check feature flags
 * if (config.features.darkWebMonitoring) {
 *   initializeDarkWebMonitoring();
 * }
 *
 * // Use logging configuration
 * logger.setLevel(config.logging.level);
 * ```
 */
export interface Config {
  app: AppConfig;
  database: DatabaseConfig;
  security: SecurityConfig;
  logging: LoggingConfig;
  rateLimiting: RateLimitingConfig;
  features: FeaturesConfig;
  monitoring: MonitoringConfig;
}

/**
 * Joi validation schema for configuration object.
 *
 * Defines validation rules, defaults, and constraints for all configuration values.
 * This schema ensures that loaded configuration meets all requirements before
 * the application starts.
 *
 * @constant {Joi.ObjectSchema} configSchema
 *
 * @remarks
 * The schema performs the following validations:
 * - Type checking (string, number, boolean, object)
 * - Range validation (min/max values for numbers, length for strings)
 * - Format validation (URI format, valid enum values)
 * - Required field enforcement
 * - Default value application for optional fields
 *
 * Validation occurs during module initialization. If validation fails,
 * the application will exit with detailed error messages indicating
 * which fields are invalid and why.
 *
 * Schema sections:
 * - app: Application settings with port range validation
 * - database: Connection strings with required fields
 * - security: Cryptographic key length enforcement
 * - logging: Valid log levels and rotation settings
 * - rateLimiting: Numeric constraints for throttling
 * - features: Boolean feature flags with defaults
 * - monitoring: Monitoring port and toggle settings
 *
 * @see {@link https://joi.dev/api/ Joi API Documentation}
 */
const configSchema = Joi.object({
  // Application
  app: Joi.object({
    name: Joi.string().default('Black-Cross'),
    env: Joi.string().valid(ENVIRONMENT.DEVELOPMENT, ENVIRONMENT.PRODUCTION, ENVIRONMENT.TEST).default(ENVIRONMENT.DEVELOPMENT),
    port: Joi.number().integer().min(1).max(65535)
      .default(PORTS.APP),
    host: Joi.string().default('0.0.0.0'),
    url: Joi.string().uri().default(`http://localhost:${PORTS.APP}`),
  }).required(),

  // Database
  database: Joi.object({
    mongodb: Joi.object({
      uri: Joi.string().required(),
      options: Joi.object({
        maxPoolSize: Joi.number().integer().default(MONGODB.DEFAULT_MAX_POOL_SIZE),
        minPoolSize: Joi.number().integer().default(MONGODB.DEFAULT_MIN_POOL_SIZE),
      }).default(),
    }).required(),

    postgresql: Joi.object({
      url: Joi.string().required(),
      host: Joi.string().default('localhost'),
      port: Joi.number().integer().default(PORTS.POSTGRESQL),
      database: Joi.string().default('blackcross'),
      user: Joi.string().default('blackcross'),
      password: Joi.string().required(),
    }).required(),

    redis: Joi.object({
      url: Joi.string().required(),
      password: Joi.string().allow('').default(''),
    }).required(),

    elasticsearch: Joi.object({
      url: Joi.string().required(),
      username: Joi.string().allow('').default(''),
      password: Joi.string().allow('').default(''),
    }).required(),
  }).required(),

  // Security
  security: Joi.object({
    jwt: Joi.object({
      secret: Joi.string().min(32).required(),
      expiration: Joi.string().default(JWT.DEFAULT_EXPIRATION),
    }).required(),

    bcrypt: Joi.object({
      rounds: Joi.number().integer().min(BCRYPT.MIN_ROUNDS).max(BCRYPT.MAX_ROUNDS)
        .default(BCRYPT.DEFAULT_ROUNDS),
    }).default(),

    encryption: Joi.object({
      key: Joi.string().length(32).required(),
    }).required(),

    cors: Joi.object({
      origin: Joi.string().default('http://localhost:3000'),
    }).default(),
  }).required(),

  // Logging
  logging: Joi.object({
    level: Joi.string().valid('error', 'warn', 'info', 'debug', 'verbose').default(LOGGING.DEFAULT_LEVEL),
    file: Joi.boolean().default(false),
    maxSize: Joi.string().default(LOGGING.DEFAULT_MAX_SIZE),
    maxFiles: Joi.number().integer().default(LOGGING.DEFAULT_MAX_FILES),
  }).required(),

  // Rate Limiting
  rateLimiting: Joi.object({
    windowMs: Joi.number().integer().default(900000), // 15 minutes
    maxRequests: Joi.number().integer().default(100),
  }).required(),

  // Features
  features: Joi.object({
    darkWebMonitoring: Joi.boolean().default(true),
    malwareSandbox: Joi.boolean().default(true),
    automatedResponse: Joi.boolean().default(true),
    threatHunting: Joi.boolean().default(true),
    complianceManagement: Joi.boolean().default(true),
  }).default(),

  // Monitoring
  monitoring: Joi.object({
    enabled: Joi.boolean().default(true),
    port: Joi.number().integer().default(9090),
    prometheus: Joi.boolean().default(false),
  }).default(),
}).required();

/**
 * Raw configuration object built from environment variables.
 *
 * Loads configuration values from process.env before validation and default
 * application. This object contains unvalidated, potentially incomplete
 * configuration that will be processed by the Joi schema.
 *
 * @constant {Object} rawConfig
 *
 * @remarks
 * Environment variable mapping:
 * - APP_NAME, NODE_ENV, APP_PORT, APP_HOST, APP_URL → app configuration
 * - MONGODB_URI → MongoDB connection
 * - DATABASE_URL, POSTGRES_* → PostgreSQL connection
 * - REDIS_URL, REDIS_PASSWORD → Redis connection
 * - ELASTICSEARCH_URL, ELASTICSEARCH_USERNAME, ELASTICSEARCH_PASSWORD → Elasticsearch
 * - JWT_SECRET, JWT_EXPIRATION → JWT authentication
 * - BCRYPT_ROUNDS → Password hashing
 * - ENCRYPTION_KEY → Data encryption
 * - CORS_ORIGIN → Cross-origin settings
 * - LOG_LEVEL, LOG_FILE, LOG_MAX_SIZE, LOG_MAX_FILES → Logging
 * - RATE_LIMIT_* → Rate limiting
 * - FEATURE_* → Feature flags (defaults to true if not 'false')
 * - METRICS_*, PROMETHEUS_ENABLED → Monitoring
 *
 * Missing required values will be caught during validation. Optional values
 * will receive defaults from the configSchema.
 *
 * @example
 * Environment variables required for minimal configuration:
 * ```bash
 * MONGODB_URI=mongodb://localhost:27017/blackcross
 * DATABASE_URL=postgresql://user:pass@localhost:5432/blackcross
 * POSTGRES_PASSWORD=secure_password
 * REDIS_URL=redis://localhost:6379
 * ELASTICSEARCH_URL=http://localhost:9200
 * JWT_SECRET=your-32-character-secret-key-here
 * ENCRYPTION_KEY=32-character-encryption-key-value
 * ```
 */
const rawConfig = {
  app: {
    name: process.env.APP_NAME,
    env: process.env.NODE_ENV,
    port: parseInt(process.env.APP_PORT || String(PORTS.APP), 10),
    host: process.env.APP_HOST,
    url: process.env.APP_URL,
  },

  database: {
    mongodb: {
      uri: process.env.MONGODB_URI,
      options: {},
    },
    postgresql: {
      url: process.env.DATABASE_URL,
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || String(PORTS.POSTGRESQL), 10),
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
    },
    redis: {
      url: process.env.REDIS_URL,
      password: process.env.REDIS_PASSWORD,
    },
    elasticsearch: {
      url: process.env.ELASTICSEARCH_URL,
      username: process.env.ELASTICSEARCH_USERNAME,
      password: process.env.ELASTICSEARCH_PASSWORD,
    },
  },

  security: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiration: process.env.JWT_EXPIRATION,
    },
    bcrypt: {
      rounds: parseInt(process.env.BCRYPT_ROUNDS || String(BCRYPT.DEFAULT_ROUNDS), 10),
    },
    encryption: {
      key: process.env.ENCRYPTION_KEY,
    },
    cors: {
      origin: process.env.CORS_ORIGIN,
    },
  },

  logging: {
    level: process.env.LOG_LEVEL,
    file: process.env.LOG_FILE === 'true',
    maxSize: process.env.LOG_MAX_SIZE,
    maxFiles: parseInt(process.env.LOG_MAX_FILES || String(LOGGING.DEFAULT_MAX_FILES), 10),
  },

  rateLimiting: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  features: {
    darkWebMonitoring: process.env.FEATURE_DARK_WEB_MONITORING !== 'false',
    malwareSandbox: process.env.FEATURE_MALWARE_SANDBOX !== 'false',
    automatedResponse: process.env.FEATURE_AUTOMATED_RESPONSE !== 'false',
    threatHunting: process.env.FEATURE_THREAT_HUNTING !== 'false',
    complianceManagement: process.env.FEATURE_COMPLIANCE_MANAGEMENT !== 'false',
  },

  monitoring: {
    enabled: process.env.METRICS_ENABLED !== 'false',
    port: parseInt(process.env.METRICS_PORT || String(PORTS.METRICS), 10),
    prometheus: process.env.PROMETHEUS_ENABLED === 'true',
  },
};

/**
 * Validation result from Joi schema validation.
 *
 * Contains either a validation error with detailed field-level error messages,
 * or the validated, type-safe configuration object with defaults applied.
 *
 * @constant {Object} validationResult
 * @property {Joi.ValidationError | undefined} error - Validation error if validation failed
 * @property {Config} value - Validated configuration object (assigned to config constant)
 *
 * @remarks
 * Validation options:
 * - abortEarly: false - Collects all validation errors instead of stopping at first error
 * - stripUnknown: true - Removes any properties not defined in the schema
 *
 * If validation fails (error is defined), the application will:
 * 1. Log all validation errors to console with field paths and messages
 * 2. Exit with status code 1 to prevent startup with invalid configuration
 *
 * This fail-fast approach ensures that configuration issues are caught immediately
 * during application startup rather than causing runtime errors later.
 */
const { error, value: config } = configSchema.validate(rawConfig, {
  abortEarly: false,
  stripUnknown: true,
});

// Handle validation errors by logging details and exiting
if (error) {
  console.error('Configuration validation failed:');
  error.details.forEach((detail) => {
    console.error(`  - ${detail.path.join('.')}: ${detail.message}`);
  });
  process.exit(1);
}

/**
 * Validated and type-safe application configuration.
 *
 * This is the default export of the configuration module, providing access to
 * all application settings with full type safety and validation guarantees.
 *
 * @type {Config}
 * @default config
 *
 * @remarks
 * This configuration object is:
 * - Loaded from environment variables with dotenv support
 * - Validated against a comprehensive Joi schema
 * - Enhanced with sensible defaults for all optional values
 * - Type-checked via TypeScript interfaces
 * - Immutable and read-only (treat as constant throughout the application)
 *
 * The configuration is guaranteed to be valid when this module loads successfully.
 * If validation fails, the application will exit during startup with detailed
 * error messages.
 *
 * Usage patterns:
 * - Import once at the top of files that need configuration
 * - Access properties directly via dot notation
 * - Check feature flags before initializing optional features
 * - Pass to service constructors and middleware initialization
 *
 * @example
 * ```typescript
 * import config from './config';
 *
 * // Start server with configured port
 * app.listen(config.app.port, config.app.host, () => {
 *   console.log(`${config.app.name} running on ${config.app.url}`);
 * });
 *
 * // Initialize database connections
 * await connectPostgreSQL(config.database.postgresql.url);
 * if (config.features.darkWebMonitoring) {
 *   await connectMongoDB(config.database.mongodb.uri);
 * }
 *
 * // Configure security middleware
 * app.use(jwt({ secret: config.security.jwt.secret }));
 * app.use(cors({ origin: config.security.cors.origin }));
 *
 * // Apply rate limiting
 * app.use(rateLimit({
 *   windowMs: config.rateLimiting.windowMs,
 *   max: config.rateLimiting.maxRequests
 * }));
 * ```
 *
 * @see {@link Config} for the complete configuration interface definition
 */
export default config;
