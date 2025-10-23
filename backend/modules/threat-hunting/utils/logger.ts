/**
 * Threat Hunting Module Logger
 * Uses centralized Winston logger with module context
 */

import { createModuleLogger } from '../../../utils/logger';

const logger = createModuleLogger('threat-hunting');

export default logger;
