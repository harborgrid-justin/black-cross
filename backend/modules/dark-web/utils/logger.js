const logger = {
  info: (message, ...args) => console.log(`[DARK-WEB] [INFO] ${message}`, ...args),
  error: (message, ...args) => console.error(`[DARK-WEB] [ERROR] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[DARK-WEB] [WARN] ${message}`, ...args),
};
module.exports = logger;
