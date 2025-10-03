const logger = {
  info: (message, ...args) => console.log(`[THREAT-HUNTING] [INFO] ${message}`, ...args),
  error: (message, ...args) => console.error(`[THREAT-HUNTING] [ERROR] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[THREAT-HUNTING] [WARN] ${message}`, ...args),
};
module.exports = logger;
