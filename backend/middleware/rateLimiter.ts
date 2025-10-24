/// <reference path="../types/express.d.ts" />

/**
 * Redis-Backed Rate Limiter Middleware
 * Production-grade distributed rate limiting
 *
 * Features:
 * - Redis-backed for distributed systems
 * - Atomic operations (no race conditions)
 * - Configurable rate limits per endpoint
 * - IP-based and user-based limiting
 * - Proper 429 responses with retry-after header
 * - Graceful degradation if Redis unavailable
 *
 * @see https://redis.io/commands/incr/
 */

import type { Request, Response, NextFunction } from 'express';
import { RateLimitError } from './errors';
import { logger } from '../utils/logger';
import { redisClient } from '../utils/cache/redis-client';

// TypeScript interfaces
interface RateLimitOptions {
  /** Time window in milliseconds (default: 15 minutes) */
  windowMs?: number;
  /** Maximum requests per window (default: 100) */
  maxRequests?: number;
  /** Function to generate rate limit key (default: IP address) */
  keyGenerator?: (req: Request) => string;
  /** Skip rate limiting (useful for health checks) */
  skip?: (req: Request) => boolean;
  /** Handler called when limit exceeded */
  onLimitReached?: (req: Request) => void;
  /** Fail open (allow) or closed (deny) if Redis unavailable */
  failOpen?: boolean;
}

/**
 * Redis-backed Rate Limiter Middleware
 *
 * Uses atomic Redis INCR with expiration for distributed rate limiting
 *
 * @param options - Rate limit configuration
 * @returns Express middleware
 *
 * @example
 * ```typescript
 * // Global rate limit
 * app.use(rateLimiter({ windowMs: 60000, maxRequests: 100 }));
 *
 * // Endpoint-specific
 * router.post('/login', rateLimiter({ maxRequests: 5 }), loginHandler);
 * ```
 */
function rateLimiter(options: RateLimitOptions = {}): (req: Request, res: Response, next: NextFunction) => void {
  const {
    windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    keyGenerator = (req: Request): string => req.ip || 'unknown',
    skip = () => false,
    onLimitReached,
    failOpen = true, // Allow requests if Redis fails
  } = options;

  return async (req, res, next) => {
    try {
      // Skip if configured
      if (skip(req)) {
        return next();
      }

      const key = `ratelimit:${keyGenerator(req)}`;
      const client = redisClient.getClient();

      // Handle Redis unavailable
      if (!client || !redisClient.isConnected()) {
        logger.warn('Redis not available for rate limiting', {
          correlationId: req.correlationId,
        });

        if (failOpen) {
          return next(); // Allow request
        } else {
          return next(new RateLimitError('Rate limiting temporarily unavailable'));
        }
      }

      // Atomic increment with Lua script for better performance
      // This ensures count and expiration are set atomically
      const count = await client.eval(
        `
        local current = redis.call("INCR", KEYS[1])
        if current == 1 then
          redis.call("PEXPIRE", KEYS[1], ARGV[1])
        end
        return current
        `,
        {
          keys: [key],
          arguments: [windowMs.toString()],
        }
      ) as number;

      // Get TTL for retry-after header
      const ttl = await client.pTTL(key);
      const resetTime = Date.now() + ttl;

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, maxRequests - count).toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      });

      // Check if limit exceeded
      if (count > maxRequests) {
        const retryAfter = Math.ceil(ttl / 1000);
        res.set('Retry-After', retryAfter.toString());

        logger.warn('Rate limit exceeded', {
          key,
          count,
          maxRequests,
          ip: req.ip,
          path: req.path,
          correlationId: req.correlationId || 'none',
        });

        // Call custom handler if provided
        if (onLimitReached) {
          onLimitReached(req);
        }

        return next(new RateLimitError('Too many requests, please try again later'));
      }

      next();
    } catch (error) {
      logger.error('Rate limiter error', {
        error,
        correlationId: req.correlationId,
      });

      // Fail open or closed based on configuration
      if (failOpen) {
        next();
      } else {
        next(new RateLimitError('Rate limiting error'));
      }
    }
  };
}

/**
 * Create user-based rate limiter
 * Uses authenticated user ID for rate limiting
 *
 * @example
 * ```typescript
 * router.post('/api/data', authenticate, userRateLimiter(), handler);
 * ```
 */
function userRateLimiter(options: RateLimitOptions = {}): (req: Request, res: Response, next: NextFunction) => void {
  return rateLimiter({
    ...options,
    keyGenerator: (req: Request): string => {
      // Use user ID if authenticated, fallback to IP
      return req.user?.id || req.ip || 'unknown';
    },
  });
}

/**
 * Create endpoint-specific rate limiter
 * Limits requests per IP per endpoint
 *
 * @example
 * ```typescript
 * router.post('/sensitive', endpointRateLimiter({ maxRequests: 10 }), handler);
 * ```
 */
function endpointRateLimiter(options: RateLimitOptions = {}): (req: Request, res: Response, next: NextFunction) => void {
  return rateLimiter({
    ...options,
    keyGenerator: (req: Request): string => `${req.ip || 'unknown'}:${req.path}`,
  });
}

/**
 * Strict rate limiter for authentication endpoints
 * Very low limits to prevent brute force attacks
 *
 * @example
 * ```typescript
 * router.post('/login', strictAuthRateLimiter(), loginHandler);
 * ```
 */
export function strictAuthRateLimiter(options: RateLimitOptions = {}): (req: Request, res: Response, next: NextFunction) => void {
  return rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // Only 5 attempts per 15 minutes
    ...options,
    keyGenerator: (req: Request): string => {
      // Use email from body if available for more accurate limiting
      const email = req.body?.email;
      const identifier = email || req.ip || 'unknown';
      return `auth:${identifier}`;
    },
    failOpen: false, // Fail closed for auth endpoints
    onLimitReached: (req: Request) => {
      logger.warn('Login rate limit exceeded', {
        ip: req.ip,
        email: req.body?.email,
        correlationId: req.correlationId,
      });
    },
  });
}

/**
 * Get current rate limit status for a key
 *
 * @param key - Rate limit key
 * @returns Current count and TTL
 *
 * @example
 * ```typescript
 * const status = await getRateLimitStatus(`ratelimit:${ip}`);
 * console.log(`Requests: ${status.count}/${status.limit}, resets in ${status.ttl}ms`);
 * ```
 */
export async function getRateLimitStatus(key: string): Promise<{
  count: number;
  ttl: number;
  exceeded: boolean;
} | null> {
  try {
    const client = redisClient.getClient();
    if (!client) return null;

    const countValue = await client.get(key);
    const ttl = await client.pTTL(key);

    return {
      count: countValue ? parseInt(countValue, 10) : 0,
      ttl: ttl > 0 ? ttl : 0,
      exceeded: false, // Would need maxRequests to determine
    };
  } catch (error) {
    logger.error('Error getting rate limit status', { error, key });
    return null;
  }
}

/**
 * Reset rate limit for a specific key
 * Use sparingly, primarily for administrative purposes
 *
 * @param key - Rate limit key to reset
 *
 * @example
 * ```typescript
 * // Admin endpoint to reset user's rate limit
 * await resetRateLimit(`ratelimit:user:${userId}`);
 * ```
 */
export async function resetRateLimit(key: string): Promise<void> {
  try {
    const client = redisClient.getClient();
    if (!client) return;

    await client.del(key);
    logger.info('Rate limit reset', { key });
  } catch (error) {
    logger.error('Error resetting rate limit', { error, key });
    throw error;
  }
}

export {
  rateLimiter,
  userRateLimiter,
  endpointRateLimiter,
};
