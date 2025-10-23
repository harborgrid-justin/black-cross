/**
 * Automation Module Logger
 * Uses centralized Winston logger with module context
 */

import { createModuleLogger } from '../../../utils/logger';

const logger = createModuleLogger('automation');

export default logger;
