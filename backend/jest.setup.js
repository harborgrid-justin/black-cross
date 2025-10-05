/**
 * Jest Setup File
 * Global test configuration and utilities
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-min-32-chars';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars!!';
process.env.LOG_LEVEL = 'error'; // Reduce noise in tests
process.env.MONGODB_URI = 'mongodb://localhost:27017/blackcross-test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/blackcross-test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.ELASTICSEARCH_URL = 'http://localhost:9200';

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
