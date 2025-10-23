/**
 * Redis Caching Layer - Client
 * Redis client configuration and connection management
 */

import { createClient, RedisClientType } from 'redis';

/**
 * Redis client singleton
 */
class RedisClient {
  private client: RedisClientType | null = null;
  private connected: boolean = false;

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    if (this.connected && this.client) {
      return;
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('❌ Redis: Too many reconnection attempts');
              return new Error('Too many reconnection attempts');
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        console.log('🔌 Redis: Connecting...');
      });

      this.client.on('ready', () => {
        console.log('✅ Redis: Ready');
        this.connected = true;
      });

      this.client.on('end', () => {
        console.log('🔌 Redis: Connection ended');
        this.connected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      this.connected = false;
      // Don't throw - allow application to run without Redis
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected && this.client !== null;
  }

  /**
   * Get Redis client instance
   */
  getClient(): RedisClientType | null {
    return this.client;
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.connected = false;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isConnected() || !this.client) {
      return false;
    }

    try {
      await this.client.ping();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const redisClient = new RedisClient();
