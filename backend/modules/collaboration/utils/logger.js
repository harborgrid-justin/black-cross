const logger = {
  info: (message, ...args) => console.log(`[COLLABORATION] [INFO] ${message}`, ...args),
  error: (message, ...args) => console.error(`[COLLABORATION] [ERROR] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[COLLABORATION] [WARN] ${message}`, ...args),
};
module.exports = logger;
