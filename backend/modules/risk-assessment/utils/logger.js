/**
 * Risk Assessment Module Logger
 * Uses centralized Winston logger with module context
 */

const { createModuleLogger } = require('../../../utils/logger');

const logger = createModuleLogger('risk-assessment');

module.exports = logger;
