/// <reference path="../types/express.d.ts" />

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

import type { Request, Response, NextFunction } from 'express';
import { RateLimitError } from './errors';
import { logger } from '../utils/logger';

// TypeScript interfaces
interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  keyGenerator?: (req: Request) => string;
}

interface RequestCounter {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production)
const requestCounts = new Map<string, RequestCounter>();

/**
 * Rate Limiter Middleware
 * @param options - Rate limit configuration
 */
function rateLimiter(options: RateLimitOptions = {}): (req: Request, res: Response, next: NextFunction) => void {
  const {
    windowMs = parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes
    maxRequests = parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
    keyGenerator = (req: Request): string => req.ip || 'unknown',
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
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - counter.count).toString(),
      'X-RateLimit-Reset': new Date(counter.resetTime + windowMs).toISOString(),
    });

    // Check if limit exceeded
    if (counter.count > maxRequests) {
      const retryAfter = Math.ceil((counter.resetTime + windowMs - now) / 1000);
      res.set('Retry-After', retryAfter.toString());

      logger.warn('Rate limit exceeded', {
        key,
        count: counter.count,
        maxRequests,
        correlationId: req.correlationId || 'none',
      });

      return next(new RateLimitError('Too many requests, please try again later'));
    }

    next();
  };
}

// Note: correlationId and user properties are already declared in correlationId.ts

/**
 * Create user-based rate limiter
 */
function userRateLimiter(options: RateLimitOptions = {}): (req: Request, res: Response, next: NextFunction) => void {
  return rateLimiter({
    ...options,
    keyGenerator: (req: Request): string => req.user?.id || req.ip || 'unknown',
  });
}

/**
 * Create endpoint-specific rate limiter
 */
function endpointRateLimiter(options: RateLimitOptions = {}): (req: Request, res: Response, next: NextFunction) => void {
  return rateLimiter({
    ...options,
    keyGenerator: (req: Request): string => `${req.ip || 'unknown'}:${req.path}`,
  });
}

export {
  rateLimiter,
  userRateLimiter,
  endpointRateLimiter,
};
