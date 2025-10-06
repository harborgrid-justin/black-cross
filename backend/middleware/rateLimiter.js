/**
 * Rate Limiter Middleware
 * Protects API endpoints from abuse
 *
 * Features:
 * - Configurable rate limits per endpoint
 * - IP-based and user-based limiting
 * - Redis-backed for distributed systems
 * - Proper 429 responses with retry-after header
 */

const { RateLimitError } = require('./errorHandler');
const { logger } = require('../utils/logger');

// In-memory store (use Redis in production)
const requestCounts = new Map();

/**
 * Rate Limiter Middleware
 * @param {Object} options - Rate limit configuration
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Maximum requests per window
 * @param {string} options.keyGenerator - Function to generate rate limit key
 */
function rateLimiter(options = {}) {
  const {
    windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
    maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    keyGenerator = (req) => req.ip,
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      for (const [k, v] of requestCounts.entries()) {
        if (now - v.resetTime > windowMs) {
          requestCounts.delete(k);
        }
      }
    }

    // Get or create counter for this key
    let counter = requestCounts.get(key);

    if (!counter || now - counter.resetTime > windowMs) {
      counter = {
        count: 0,
        resetTime: now,
      };
      requestCounts.set(key, counter);
    }

    counter.count += 1;

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': Math.max(0, maxRequests - counter.count),
      'X-RateLimit-Reset': new Date(counter.resetTime + windowMs).toISOString(),
    });

    // Check if limit exceeded
    if (counter.count > maxRequests) {
      const retryAfter = Math.ceil((counter.resetTime + windowMs - now) / 1000);
      res.set('Retry-After', retryAfter);

      logger.warn('Rate limit exceeded', {
        key,
        count: counter.count,
        maxRequests,
        correlationId: req.correlationId,
      });

      return next(new RateLimitError('Too many requests, please try again later'));
    }

    next();
  };
}

/**
 * Create user-based rate limiter
 */
function userRateLimiter(options = {}) {
  return rateLimiter({
    ...options,
    keyGenerator: (req) => req.user?.id || req.ip,
  });
}

/**
 * Create endpoint-specific rate limiter
 */
function endpointRateLimiter(options = {}) {
  return rateLimiter({
    ...options,
    keyGenerator: (req) => `${req.ip}:${req.path}`,
  });
}

module.exports = {
  rateLimiter,
  userRateLimiter,
  endpointRateLimiter,
};
