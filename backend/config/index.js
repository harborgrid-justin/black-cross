/**
 * Centralized Configuration Management
 * Enterprise-grade configuration with validation
 *
 * Features:
 * - Environment-based configuration
 * - Configuration validation
 * - Type-safe access
 * - Defaults and overrides
 */

require('dotenv').config();
const Joi = require('joi');

// Configuration schema
const configSchema = Joi.object({
  // Application
  app: Joi.object({
    name: Joi.string().default('Black-Cross'),
    env: Joi.string().valid('development', 'production', 'test').default('development'),
    port: Joi.number().integer().min(1).max(65535)
      .default(8080),
    host: Joi.string().default('0.0.0.0'),
    url: Joi.string().uri().default('http://localhost:8080'),
  }).required(),

  // Database
  database: Joi.object({
    mongodb: Joi.object({
      uri: Joi.string().required(),
      options: Joi.object({
        maxPoolSize: Joi.number().integer().default(10),
        minPoolSize: Joi.number().integer().default(2),
      }).default(),
    }).required(),

    postgresql: Joi.object({
      url: Joi.string().required(),
      host: Joi.string().default('localhost'),
      port: Joi.number().integer().default(5432),
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
      expiration: Joi.string().default('24h'),
    }).required(),

    bcrypt: Joi.object({
      rounds: Joi.number().integer().min(10).max(15)
        .default(10),
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
    level: Joi.string().valid('error', 'warn', 'info', 'debug', 'verbose').default('info'),
    file: Joi.boolean().default(false),
    maxSize: Joi.string().default('10m'),
    maxFiles: Joi.number().integer().default(5),
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

// Build configuration from environment
const rawConfig = {
  app: {
    name: process.env.APP_NAME,
    env: process.env.NODE_ENV,
    port: parseInt(process.env.APP_PORT, 10),
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
      port: parseInt(process.env.POSTGRES_PORT, 10),
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
      rounds: parseInt(process.env.BCRYPT_ROUNDS, 10),
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
    maxFiles: parseInt(process.env.LOG_MAX_FILES, 10),
  },

  rateLimiting: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10),
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
    port: parseInt(process.env.METRICS_PORT, 10),
    prometheus: process.env.PROMETHEUS_ENABLED === 'true',
  },
};

// Validate configuration
const { error, value: config } = configSchema.validate(rawConfig, {
  abortEarly: false,
  stripUnknown: true,
});

if (error) {
  console.error('Configuration validation failed:');
  error.details.forEach((detail) => {
    console.error(`  - ${detail.path.join('.')}: ${detail.message}`);
  });
  process.exit(1);
}

module.exports = config;
