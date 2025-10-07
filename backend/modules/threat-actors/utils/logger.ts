/**
 * Threat Actors Module Logger
 * Uses centralized Winston logger with module context
 */

import {  createModuleLogger  } from '../../../utils/logger';

const logger = createModuleLogger('threat-actors');

export default logger;

