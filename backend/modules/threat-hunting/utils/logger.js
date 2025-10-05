/**
 * Threat Hunting Module Logger
 * Uses centralized Winston logger with module context
 */

const { createModuleLogger } = require('../../../utils/logger');

const logger = createModuleLogger('threat-hunting');

module.exports = logger;
