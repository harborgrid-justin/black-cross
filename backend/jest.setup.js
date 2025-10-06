/**
 * Jest Setup File
 * Global test configuration and utilities
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.APP_PORT = '8080';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-min-32-chars';
process.env.ENCRYPTION_KEY = '12345678901234567890123456789012'; // Exactly 32 characters
process.env.LOG_LEVEL = 'error'; // Reduce noise in tests
process.env.LOG_MAX_FILES = '5';
process.env.MONGODB_URI = 'mongodb://localhost:27017/blackcross-test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/blackcross-test';
process.env.POSTGRES_PORT = '5432';
process.env.POSTGRES_PASSWORD = 'test';
process.env.BCRYPT_ROUNDS = '10';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.ELASTICSEARCH_URL = 'http://localhost:9200';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';
process.env.METRICS_PORT = '9090';

// Suppress console output in tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
  error: console.error,
};

// Global test timeout
jest.setTimeout(10000);
