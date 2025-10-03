const logger = {
  info: (message, ...args) => console.log(`[THREAT-FEEDS] [INFO] ${message}`, ...args),
  error: (message, ...args) => console.error(`[THREAT-FEEDS] [ERROR] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[THREAT-FEEDS] [WARN] ${message}`, ...args),
};
module.exports = logger;
