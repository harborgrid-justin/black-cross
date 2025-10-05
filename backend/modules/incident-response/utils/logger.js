/**
 * Incident Response Module Logger
 * Uses centralized Winston logger with module context
 */

const { createModuleLogger } = require('../../../utils/logger');

const logger = createModuleLogger('incident-response');

module.exports = logger;
