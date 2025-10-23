/**
 * IoC Management Module Logger
 * Uses centralized Winston logger with module context
 */

import { createModuleLogger } from '../../../utils/logger';

const logger = createModuleLogger('ioc-management');

export default logger;
