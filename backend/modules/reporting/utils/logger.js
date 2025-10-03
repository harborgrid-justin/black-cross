const logger = {
  info: (message, ...args) => console.log(`[REPORTING] [INFO] ${message}`, ...args),
  error: (message, ...args) => console.error(`[REPORTING] [ERROR] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[REPORTING] [WARN] ${message}`, ...args),
};
module.exports = logger;
