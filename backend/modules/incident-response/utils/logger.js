/**
 * Logger utility for incident-response module
 */

const logger = {
  info: (message, ...args) => {
    console.log(`[INCIDENT-RESPONSE] [INFO] ${message}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`[INCIDENT-RESPONSE] [ERROR] ${message}`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`[INCIDENT-RESPONSE] [WARN] ${message}`, ...args);
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[INCIDENT-RESPONSE] [DEBUG] ${message}`, ...args);
    }
  },
};

module.exports = logger;
