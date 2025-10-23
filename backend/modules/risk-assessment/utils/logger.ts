/**
 * Risk Assessment Module Logger
 * Uses centralized Winston logger with module context
 */

import { createModuleLogger } from '../../../utils/logger';

const logger = createModuleLogger('risk-assessment');

export default logger;
