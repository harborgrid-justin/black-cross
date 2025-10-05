/**
 * Threat Actors Module Logger
 * Uses centralized Winston logger with module context
 */

const { createModuleLogger } = require('../../../utils/logger');

const logger = createModuleLogger('threat-actors');

module.exports = logger;
