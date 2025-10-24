/**
 * Logger utility for development and production environments
 *
 * In development: Logs to console
 * In production: Only logs errors, other logs are stripped by Vite terser
 *
 * @example
 * import { logger } from '@/utils/logger';
 * logger.debug('User clicked button');
 * logger.error('API call failed', error);
 */

const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;

export const logger = {
  /**
   * Debug-level logging - only in development
   */
  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info-level logging - only in development
   */
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Warning-level logging
   */
  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Error-level logging - always logged
   * In production, should be sent to error tracking service
   */
  error: (...args: unknown[]): void => {
    console.error('[ERROR]', ...args);

    // TODO: Send to error tracking service in production
    // if (!isDevelopment) {
    //   sendToErrorTracking(args);
    // }
  },

  /**
   * Performance timing helper
   */
  time: (label: string): void => {
    if (isDevelopment) {
      console.time(label);
    }
  },

  /**
   * End performance timing
   */
  timeEnd: (label: string): void => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  },
};

export default logger;
