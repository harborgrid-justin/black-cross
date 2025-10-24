/**
 * JWT Token Blacklist Service
 * Implements token revocation using Redis for distributed systems
 *
 * Features:
 * - Blacklist tokens on logout
 * - Blacklist all user tokens on password change
 * - Automatic expiration of blacklist entries
 * - Distributed across multiple server instances
 *
 * @see https://auth0.com/blog/blacklist-json-web-token-api-keys/
 */

import { redisClient } from './cache/redis-client';
import { logger } from './logger';
import jwt from 'jsonwebtoken';

/**
 * Token blacklist manager
 */
export class TokenBlacklist {
  private readonly tokenPrefix = 'blacklist:token:';
  private readonly userPrefix = 'blacklist:user:';

  /**
   * Add a specific token to blacklist
   *
   * @param token - JWT token to blacklist
   * @param expiresIn - Seconds until token naturally expires
   *
   * @example
   * ```typescript
   * // On logout
   * const decoded = jwt.decode(token);
   * const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
   * await tokenBlacklist.addToken(token, expiresIn);
   * ```
   */
  async addToken(token: string, expiresIn: number): Promise<void> {
    try {
      const key = `${this.tokenPrefix}${token}`;
      const client = redisClient.getClient();

      if (!client) {
        logger.warn('Redis not available, token not blacklisted');
        return;
      }

      // Set key with expiration matching token's natural expiry
      await client.setEx(key, Math.max(expiresIn, 1), '1');

      logger.info('Token blacklisted successfully', {
        expiresIn,
        keyPrefix: this.tokenPrefix,
      });
    } catch (error) {
      logger.error('Error blacklisting token', { error });
      throw error;
    }
  }

  /**
   * Check if a token is blacklisted
   *
   * @param token - JWT token to check
   * @returns True if blacklisted, false otherwise
   *
   * @example
   * ```typescript
   * if (await tokenBlacklist.isBlacklisted(token)) {
   *   throw new AuthenticationError('Token has been revoked');
   * }
   * ```
   */
  async isBlacklisted(token: string): Promise<boolean> {
    try {
      const client = redisClient.getClient();

      if (!client) {
        // Fail open if Redis unavailable (or fail closed for stricter security)
        logger.warn('Redis not available, cannot check token blacklist');
        return false; // Change to true for stricter security
      }

      const key = `${this.tokenPrefix}${token}`;
      const result = await client.get(key);

      return result === '1';
    } catch (error) {
      logger.error('Error checking token blacklist', { error });
      // Fail open on error (or fail closed for stricter security)
      return false;
    }
  }

  /**
   * Blacklist all tokens for a specific user
   * Use this when user changes password or account is compromised
   *
   * @param userId - User ID
   * @param ttl - Time to live in seconds (default: 24 hours)
   *
   * @example
   * ```typescript
   * // On password change
   * await tokenBlacklist.blacklistAllUserTokens(userId, 86400);
   * ```
   */
  async blacklistAllUserTokens(userId: string, ttl: number = 86400): Promise<void> {
    try {
      const client = redisClient.getClient();

      if (!client) {
        logger.warn('Redis not available, user tokens not blacklisted');
        return;
      }

      const key = `${this.userPrefix}${userId}`;
      const timestamp = Date.now().toString();

      // Store timestamp when all tokens were invalidated
      await client.setEx(key, ttl, timestamp);

      logger.info('All user tokens blacklisted', {
        userId,
        ttl,
        timestamp,
      });
    } catch (error) {
      logger.error('Error blacklisting user tokens', { error, userId });
      throw error;
    }
  }

  /**
   * Check if a user has had all tokens invalidated
   *
   * @param userId - User ID
   * @param tokenIssuedAt - Token issued timestamp (iat claim)
   * @returns True if user's tokens were invalidated after this token was issued
   *
   * @example
   * ```typescript
   * const decoded = jwt.verify(token, secret);
   * if (await tokenBlacklist.isUserBlacklisted(decoded.id, decoded.iat)) {
   *   throw new AuthenticationError('Token invalidated due to password change');
   * }
   * ```
   */
  async isUserBlacklisted(userId: string, tokenIssuedAt: number): Promise<boolean> {
    try {
      const client = redisClient.getClient();

      if (!client) {
        logger.warn('Redis not available, cannot check user blacklist');
        return false;
      }

      const key = `${this.userPrefix}${userId}`;
      const invalidatedAt = await client.get(key);

      if (!invalidatedAt) {
        return false;
      }

      // Token is invalid if it was issued before the invalidation timestamp
      const tokenIssuedAtMs = tokenIssuedAt * 1000;
      return tokenIssuedAtMs < parseInt(invalidatedAt, 10);
    } catch (error) {
      logger.error('Error checking user blacklist', { error, userId });
      return false;
    }
  }

  /**
   * Remove a token from blacklist (rare use case)
   *
   * @param token - Token to remove from blacklist
   */
  async removeToken(token: string): Promise<void> {
    try {
      const client = redisClient.getClient();

      if (!client) {
        return;
      }

      const key = `${this.tokenPrefix}${token}`;
      await client.del(key);

      logger.info('Token removed from blacklist', { keyPrefix: this.tokenPrefix });
    } catch (error) {
      logger.error('Error removing token from blacklist', { error });
      throw error;
    }
  }

  /**
   * Clear user's blacklist (rare use case, e.g., after resolving security incident)
   *
   * @param userId - User ID
   */
  async clearUserBlacklist(userId: string): Promise<void> {
    try {
      const client = redisClient.getClient();

      if (!client) {
        return;
      }

      const key = `${this.userPrefix}${userId}`;
      await client.del(key);

      logger.info('User blacklist cleared', { userId });
    } catch (error) {
      logger.error('Error clearing user blacklist', { error, userId });
      throw error;
    }
  }

  /**
   * Get statistics about blacklisted tokens
   *
   * @returns Blacklist statistics
   */
  async getStatistics(): Promise<{
    totalBlacklistedTokens: number;
    totalBlacklistedUsers: number;
  }> {
    try {
      const client = redisClient.getClient();

      if (!client) {
        return {
          totalBlacklistedTokens: 0,
          totalBlacklistedUsers: 0,
        };
      }

      // Count keys matching patterns
      const tokenKeys = await client.keys(`${this.tokenPrefix}*`);
      const userKeys = await client.keys(`${this.userPrefix}*`);

      return {
        totalBlacklistedTokens: tokenKeys.length,
        totalBlacklistedUsers: userKeys.length,
      };
    } catch (error) {
      logger.error('Error getting blacklist statistics', { error });
      return {
        totalBlacklistedTokens: 0,
        totalBlacklistedUsers: 0,
      };
    }
  }

  /**
   * Cleanup expired entries (usually handled by Redis TTL, but useful for debugging)
   */
  async cleanup(): Promise<void> {
    logger.info('Token blacklist cleanup triggered (TTL auto-expires entries)');
    // Redis automatically removes expired keys, so this is a no-op
    // Kept for API consistency
  }
}

/**
 * Singleton instance
 */
export const tokenBlacklist = new TokenBlacklist();

/**
 * Helper function to extract TTL from JWT token
 *
 * @param token - JWT token
 * @returns Seconds until expiration
 */
export function getTokenTTL(token: string): number {
  try {
    const decoded = jwt.decode(token) as { exp?: number; iat?: number };

    if (!decoded || !decoded.exp) {
      return 86400; // Default 24 hours
    }

    const now = Math.floor(Date.now() / 1000);
    const ttl = decoded.exp - now;

    return Math.max(ttl, 1); // At least 1 second
  } catch (error) {
    logger.error('Error extracting token TTL', { error });
    return 86400;
  }
}

/**
 * Usage example:
 *
 * // In logout endpoint
 * router.post('/logout', authenticate, async (req, res) => {
 *   const token = req.headers.authorization?.substring(7);
 *   if (token) {
 *     const ttl = getTokenTTL(token);
 *     await tokenBlacklist.addToken(token, ttl);
 *   }
 *   res.json({ success: true, message: 'Logged out successfully' });
 * });
 *
 * // In password change endpoint
 * router.post('/change-password', authenticate, async (req, res) => {
 *   // ... change password logic
 *   await tokenBlacklist.blacklistAllUserTokens(req.user.id);
 *   res.json({ success: true, message: 'Password changed, please login again' });
 * });
 *
 * // In authentication middleware
 * const decoded = jwt.verify(token, secret);
 *
 * // Check token blacklist
 * if (await tokenBlacklist.isBlacklisted(token)) {
 *   throw new AuthenticationError('Token has been revoked');
 * }
 *
 * // Check user blacklist
 * if (await tokenBlacklist.isUserBlacklisted(decoded.id, decoded.iat)) {
 *   throw new AuthenticationError('Token invalidated due to security update');
 * }
 */
