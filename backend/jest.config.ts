/**
 * Jest Configuration
 * Enterprise-grade testing setup
 */

export default {
  // Use ts-jest preset for TypeScript
  preset: 'ts-jest',
  
  // Test environment
  testEnvironment: 'node',

  // TypeScript configuration
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },

  // Coverage configuration
  collectCoverageFrom: [
    'modules/**/*.ts',
    'middleware/**/*.ts',
    'utils/**/*.ts',
    '!modules/**/models/*.ts', // Exclude models
    '!**/*.test.ts',
    '!**/*.spec.ts',
    '!**/node_modules/**',
  ],

  coverageDirectory: 'coverage',

  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
  ],

  coverageThreshold: {
    global: {
      branches: 5,
      functions: 5,
      lines: 5,
      statements: 5,
    },
  },

  // Test patterns
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/*.test.ts',
    '**/*.spec.ts',
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Module paths
  moduleDirectories: ['node_modules', '<rootDir>'],

  // Transform ES modules in node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)',
  ],

  // Timeouts
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

