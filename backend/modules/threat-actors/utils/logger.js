const logger = {
  info: (message, ...args) => console.log(`[THREAT-ACTORS] [INFO] ${message}`, ...args),
  error: (message, ...args) => console.error(`[THREAT-ACTORS] [ERROR] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[THREAT-ACTORS] [WARN] ${message}`, ...args),
};
module.exports = logger;
