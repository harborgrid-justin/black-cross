/**
 * Threat Feeds Module Logger
 * Uses centralized Winston logger with module context
 */

const { createModuleLogger } = require('../../../utils/logger');

const logger = createModuleLogger('threat-feeds');

module.exports = logger;
