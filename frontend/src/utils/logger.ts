/**
 * @fileoverview Environment-aware logging utility for the Black-Cross platform.
 *
 * Provides a centralized logging interface that adapts behavior based on the
 * environment (development vs production). In development, all log levels are
 * output to the console. In production, only errors are logged to prevent
 * console pollution and potential information leakage.
 *
 * Features:
 * - Multiple log levels (debug, info, warn, error)
 * - Environment-aware logging
 * - Performance timing utilities
 * - Consistent log formatting with prefixes
 * - Production-ready with error tracking hooks
 *
 * The logger is designed to be tree-shakeable in production builds when using
 * Vite's terser minification, removing unused logging code.
 *
 * @module utils/logger
 *
 * @example
 * ```typescript
 * import { logger } from '@/utils/logger';
 *
 * // Development: Outputs to console
 * // Production: No output
 * logger.debug('User clicked button', { buttonId: 'submit' });
 * logger.info('API request initiated', { endpoint: '/api/threats' });
 *
 * // Always logged, even in production
 * logger.error('API call failed', error);
 *
 * // Performance timing
 * logger.time('dataProcessing');
 * processData();
 * logger.timeEnd('dataProcessing');
 * ```
 */

/**
 * Determines if the application is running in development mode.
 *
 * Checks both MODE and DEV environment variables for compatibility
 * with different Vite configurations.
 *
 * @constant
 * @type {boolean}
 */
const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.DEV;

/**
 * Logger utility object providing environment-aware logging methods.
 *
 * All methods except `error` are only active in development mode. The `error`
 * method logs in all environments and should be integrated with error tracking
 * services in production.
 *
 * @constant
 * @type {Object}
 */
export const logger = {
  /**
   * Logs debug-level messages for detailed troubleshooting.
   *
   * Only outputs in development mode. Use for verbose logging that helps
   * during development but would be noise in production.
   *
   * @param {...unknown} args - Values to log (any type, spread into console)
   * @returns {void}
   *
   * @example
   * ```typescript
   * logger.debug('Component rendered', { props, state });
   * logger.debug('Cache hit', cacheKey);
   * ```
   */
  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Logs informational messages about application flow.
   *
   * Only outputs in development mode. Use for general information about
   * application state and flow that's useful during development.
   *
   * @param {...unknown} args - Values to log (any type, spread into console)
   * @returns {void}
   *
   * @example
   * ```typescript
   * logger.info('User authenticated', { userId: user.id });
   * logger.info('WebSocket connected');
   * ```
   */
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Logs warning messages for potentially problematic situations.
   *
   * Only outputs in development mode. Use for conditions that are unusual
   * but not errors, or deprecation warnings.
   *
   * @param {...unknown} args - Values to log (any type, spread into console)
   * @returns {void}
   *
   * @example
   * ```typescript
   * logger.warn('Deprecated API usage', { method: 'oldMethod' });
   * logger.warn('Rate limit approaching', { remaining: 10 });
   * ```
   */
  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Logs error messages for exceptions and failures.
   *
   * ALWAYS logs in both development and production. In production, this should
   * be integrated with error tracking services (Sentry, LogRocket, etc.) to
   * capture and monitor production errors.
   *
   * @param {...unknown} args - Error information to log (typically Error objects and context)
   * @returns {void}
   *
   * @example
   * ```typescript
   * logger.error('API request failed', error, { endpoint, method });
   * logger.error('Failed to parse response', new Error('Invalid JSON'));
   * ```
   *
   * @remarks
   * TODO: Integrate with error tracking service in production builds:
   * - Sentry.captureException()
   * - LogRocket.captureException()
   * - Custom error reporting endpoint
   */
  error: (...args: unknown[]): void => {
    console.error('[ERROR]', ...args);

    // TODO: Send to error tracking service in production
    // if (!isDevelopment) {
    //   sendToErrorTracking(args);
    // }
  },

  /**
   * Starts a performance timing measurement.
   *
   * Only active in development mode. Use with `timeEnd()` to measure
   * execution time of operations. The label must match between time()
   * and timeEnd() calls.
   *
   * @param {string} label - Unique identifier for the timing measurement
   * @returns {void}
   *
   * @example
   * ```typescript
   * logger.time('fetchThreats');
   * await fetchThreats();
   * logger.timeEnd('fetchThreats'); // Outputs: fetchThreats: 245.32ms
   * ```
   */
  time: (label: string): void => {
    if (isDevelopment) {
      console.time(label);
    }
  },

  /**
   * Ends a performance timing measurement and logs the duration.
   *
   * Only active in development mode. Must be called with the same label
   * used in the corresponding `time()` call.
   *
   * @param {string} label - Unique identifier matching the time() call
   * @returns {void}
   *
   * @example
   * ```typescript
   * logger.time('dataProcessing');
   * const result = processLargeDataset(data);
   * logger.timeEnd('dataProcessing'); // Outputs: dataProcessing: 1.2s
   * ```
   */
  timeEnd: (label: string): void => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  },
};

/**
 * Default export of the logger utility.
 *
 * @default
 */
export default logger;
