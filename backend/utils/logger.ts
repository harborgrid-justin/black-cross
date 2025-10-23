/**
 * Centralized Logger Configuration
 * Enterprise-grade logging with Winston
 *
 * Features:
 * - Structured logging with JSON format
 * - Multiple transports (Console, File, Error file)
 * - Request correlation IDs
 * - Log rotation
 * - Different log levels for development/production
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
  winston.format.json(),
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({
    timestamp, level, message, module, correlationId, ...meta
  }) => {
    let log = `${timestamp} [${level}]`;
    if (module) log += ` [${module}]`;
    if (correlationId) log += ` [${correlationId}]`;
    log += `: ${message}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    return log;
  }),
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define transports based on environment
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
    level: process.env.LOG_LEVEL || 'info',
  }),
];

// Add file transports in production or if explicitly enabled
if (process.env.NODE_ENV === 'production' || process.env.LOG_FILE === 'true') {
  transports.push(
    // All logs
    new winston.transports.File({
      filename: path.join(logsDir, 'application.log'),
      format: logFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
  );
}

// Create base logger
const baseLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exitOnError: false,
});

// Export the base logger as 'logger' for backward compatibility
const logger = baseLogger;

/**
 * Create a child logger with module context
 * @param module - Module name
 * @returns Child logger with module context
 */
function createModuleLogger(module: string): winston.Logger {
  return baseLogger.child({ module });
}

/**
 * Add correlation ID to logger context
 * @param logger - Base or child logger
 * @param correlationId - Request correlation ID
 * @returns Logger with correlation context
 */
function addCorrelationId(logger: winston.Logger, correlationId: string): winston.Logger {
  return logger.child({ correlationId });
}

export {
  logger,
  createModuleLogger,
  addCorrelationId,
};
