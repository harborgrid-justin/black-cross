const logger = {
  info: (message, ...args) => console.log(`[COMPLIANCE] [INFO] ${message}`, ...args),
  error: (message, ...args) => console.error(`[COMPLIANCE] [ERROR] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[COMPLIANCE] [WARN] ${message}`, ...args),
};
module.exports = logger;
