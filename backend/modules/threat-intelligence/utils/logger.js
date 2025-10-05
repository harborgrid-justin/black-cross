/**
 * Threat Intelligence Module Logger
 * Uses centralized Winston logger with module context
 */

const { createModuleLogger } = require('../../../utils/logger');

const logger = createModuleLogger('threat-intelligence');

module.exports = logger;
