const logger = {
  info: (message, ...args) => console.log(`[IOC-MANAGEMENT] [INFO] ${message}`, ...args),
  error: (message, ...args) => console.error(`[IOC-MANAGEMENT] [ERROR] ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[IOC-MANAGEMENT] [WARN] ${message}`, ...args),
};
module.exports = logger;
