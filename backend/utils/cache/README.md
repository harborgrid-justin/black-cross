# Redis Caching Layer

High-performance caching layer using Redis for improved performance.

## Features

- ✅ Redis client with auto-reconnection
- ✅ High-level caching operations
- ✅ TTL (Time To Live) support
- ✅ Bulk operations (mget, mset)
- ✅ Pattern-based deletion
- ✅ Counter operations (increment/decrement)
- ✅ Get-or-set pattern
- ✅ Cache statistics
- ✅ Graceful fallback when Redis unavailable

## Configuration

Set Redis connection via environment variable:

```bash
REDIS_URL=redis://localhost:6379
```

## Usage Example

```typescript
import { cacheService } from './utils/cache';

// Initialize Redis connection (in main app)
import { redisClient } from './utils/cache';
await redisClient.connect();

// Get/Set
await cacheService.set('user:123', { name: 'John' }, 3600); // 1 hour TTL
const user = await cacheService.get('user:123');

// Get or Set pattern
const data = await cacheService.getOrSet(
  'expensive:query',
  async () => {
    // Expensive operation
    return await database.complexQuery();
  },
  1800 // 30 minutes TTL
);

// Bulk operations
await cacheService.mset([
  { key: 'key1', value: 'value1', ttl: 600 },
  { key: 'key2', value: 'value2', ttl: 600 }
]);

const values = await cacheService.mget(['key1', 'key2']);

// Pattern deletion
await cacheService.deletePattern('user:*');

// Counters
await cacheService.increment('api:requests', 1);
await cacheService.decrement('api:quota', 1);

// Statistics
const stats = await cacheService.getStats();
console.log('Cache keys:', stats.keys);
console.log('Memory used:', stats.memoryUsed);
```

## Cache Key Namespacing

All keys are automatically prefixed with `blackcross:` to avoid conflicts.

## Performance Tips

1. Use appropriate TTL values to balance freshness and performance
2. Use bulk operations for multiple keys
3. Implement cache warming for frequently accessed data
4. Monitor cache hit rates and adjust caching strategy accordingly
5. Use get-or-set pattern for expensive operations
