/**
 * Redis Caching Layer - Service
 * High-level caching operations with fallback
 */

import { redisClient } from './redis-client';

/**
 * Cache key prefix for namespacing
 */
const KEY_PREFIX = 'blackcross:';

/**
 * Default TTL in seconds (1 hour)
 */
const DEFAULT_TTL = 3600;

/**
 * Cache service with Redis backend
 */
export class CacheService {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!redisClient.isConnected()) {
      return null;
    }

    try {
      const client = redisClient.getClient();
      if (!client) return null;

      const value = await client.get(this.prefixKey(key));
      
      if (!value || typeof value !== 'string') {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL
   */
  async set(key: string, value: any, ttl: number = DEFAULT_TTL): Promise<boolean> {
    if (!redisClient.isConnected()) {
      return false;
    }

    try {
      const client = redisClient.getClient();
      if (!client) return false;

      const serialized = JSON.stringify(value);
      await client.setEx(this.prefixKey(key), ttl, serialized);

      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!redisClient.isConnected()) {
      return false;
    }

    try {
      const client = redisClient.getClient();
      if (!client) return false;

      await client.del(this.prefixKey(key));
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete all keys matching pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!redisClient.isConnected()) {
      return 0;
    }

    try {
      const client = redisClient.getClient();
      if (!client) return 0;

      const keys = await client.keys(this.prefixKey(pattern));
      
      if (keys.length === 0) {
        return 0;
      }

      await client.del(keys);
      return keys.length;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!redisClient.isConnected()) {
      return false;
    }

    try {
      const client = redisClient.getClient();
      if (!client) return false;

      const result = await client.exists(this.prefixKey(key));
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get multiple values at once
   */
  async mget<T>(keys: string[]): Promise<Array<T | null>> {
    if (!redisClient.isConnected() || keys.length === 0) {
      return keys.map(() => null);
    }

    try {
      const client = redisClient.getClient();
      if (!client) return keys.map(() => null);

      const prefixedKeys = keys.map((k) => this.prefixKey(k));
      const values = await client.mGet(prefixedKeys);

      return values.map((v) => (v && typeof v === 'string' ? JSON.parse(v) : null));
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple values at once
   */
  async mset(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<boolean> {
    if (!redisClient.isConnected() || entries.length === 0) {
      return false;
    }

    try {
      const client = redisClient.getClient();
      if (!client) return false;

      // Use pipeline for atomic operations
      const pipeline = client.multi();

      for (const entry of entries) {
        const serialized = JSON.stringify(entry.value);
        const ttl = entry.ttl || DEFAULT_TTL;
        pipeline.setEx(this.prefixKey(entry.key), ttl, serialized);
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, amount: number = 1): Promise<number | null> {
    if (!redisClient.isConnected()) {
      return null;
    }

    try {
      const client = redisClient.getClient();
      if (!client) return null;

      const result = await client.incrBy(this.prefixKey(key), amount);
      return result;
    } catch (error) {
      console.error('Cache increment error:', error);
      return null;
    }
  }

  /**
   * Decrement counter
   */
  async decrement(key: string, amount: number = 1): Promise<number | null> {
    if (!redisClient.isConnected()) {
      return null;
    }

    try {
      const client = redisClient.getClient();
      if (!client) return null;

      const result = await client.decrBy(this.prefixKey(key), amount);
      return result;
    } catch (error) {
      console.error('Cache decrement error:', error);
      return null;
    }
  }

  /**
   * Get or set pattern - fetch from cache or execute function and cache result
   */
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number = DEFAULT_TTL
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    // Execute function to get fresh data
    const data = await fetchFunction();

    // Store in cache (fire and forget)
    this.set(key, data, ttl).catch((err) =>
      console.error('Failed to cache result:', err)
    );

    return data;
  }

  /**
   * Flush all cache
   */
  async flushAll(): Promise<boolean> {
    if (!redisClient.isConnected()) {
      return false;
    }

    try {
      const client = redisClient.getClient();
      if (!client) return false;

      await client.flushAll();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ keys: number; memoryUsed: string; connected: boolean }> {
    const stats = {
      keys: 0,
      memoryUsed: '0 bytes',
      connected: redisClient.isConnected(),
    };

    if (!redisClient.isConnected()) {
      return stats;
    }

    try {
      const client = redisClient.getClient();
      if (!client) return stats;

      const keys = await client.keys(this.prefixKey('*'));
      stats.keys = keys.length;

      const info = await client.info('memory');
      const match = info.match(/used_memory_human:([^\r\n]+)/);
      if (match) {
        stats.memoryUsed = match[1];
      }

      return stats;
    } catch (error) {
      console.error('Cache stats error:', error);
      return stats;
    }
  }

  /**
   * Helper: Add prefix to key
   */
  private prefixKey(key: string): string {
    return `${KEY_PREFIX}${key}`;
  }
}

// Export singleton instance
export const cacheService = new CacheService();
