/**
 * Logger Utility Tests
 * Test enterprise logging functionality
 */

const { logger, createModuleLogger, addCorrelationId } = require('../../utils/logger');

describe('Logger', () => {
  describe('base logger', () => {
    it('should be defined', () => {
      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
    });
  });

  describe('createModuleLogger', () => {
    it('should create child logger with module context', () => {
      const moduleLogger = createModuleLogger('test-module');

      expect(moduleLogger).toBeDefined();
      expect(moduleLogger.defaultMeta).toEqual({ module: 'test-module' });
    });
  });

  describe('addCorrelationId', () => {
    it('should add correlation ID to logger context', () => {
      const correlationLogger = addCorrelationId(logger, 'test-correlation-id');

      expect(correlationLogger).toBeDefined();
      expect(correlationLogger.defaultMeta).toEqual({
        correlationId: 'test-correlation-id',
      });
    });

    it('should work with module logger', () => {
      const moduleLogger = createModuleLogger('test-module');
      const correlationLogger = addCorrelationId(moduleLogger, 'test-id');

      expect(correlationLogger.defaultMeta).toEqual({
        module: 'test-module',
        correlationId: 'test-id',
      });
    });
  });
});
