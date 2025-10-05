/**
 * IoC Management Module Logger
 * Uses centralized Winston logger with module context
 */

const { createModuleLogger } = require('../../../utils/logger');

const logger = createModuleLogger('ioc-management');

module.exports = logger;
