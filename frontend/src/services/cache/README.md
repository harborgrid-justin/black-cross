# Cache Services

This directory contains caching services for API responses and data.

## Planned Components

- **ApiCache.ts** - Advanced response caching with TTL
- **CacheStrategies.ts** - Different caching strategies (LRU, LFU, etc.)
- **CacheInvalidation.ts** - Cache invalidation patterns

## Implementation Status

⚠️ A simple cache implementation exists in `utils/apiUtils.ts`.
These components are placeholders for more advanced caching features.

## Usage Example

```typescript
// Current simple implementation
import { apiCache, withCache } from '../utils/apiUtils';

// Cache a response
const data = await withCache('threats-list', () => api.getThreats(), 5 * 60 * 1000);

// Clear cache
apiCache.clear('threats-list');
```

## Notes

- Current implementation uses in-memory Map
- Future: Implement IndexedDB for persistent caching
- Future: Add cache warming and background refresh
- Future: Implement smart invalidation patterns
