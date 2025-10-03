const logger = {
  info: (message, ...args) => console.log(`[SIEM] [INFO] ${message}`, ...args),
  error: (message, ...args) => console.error(`[SIEM] [ERROR] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[SIEM] [WARN] ${message}`, ...args),
};
module.exports = logger;
