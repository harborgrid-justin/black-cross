# Resilience Services

This directory contains services for handling failures and improving reliability.

## Planned Components

- **RetryStrategies.ts** - Configurable retry logic
- **CircuitBreaker.ts** - Circuit breaker pattern implementation
- **FallbackHandler.ts** - Graceful degradation and fallbacks

## Implementation Status

⚠️ Basic retry logic exists in `utils/apiUtils.ts` (`withRetry` function).
These components are placeholders for advanced resilience patterns.

## Usage Example

```typescript
// Current retry implementation
import { withRetry } from '../utils/apiUtils';

const data = await withRetry(
  () => api.getThreats(),
  {
    maxRetries: 3,
    backoffMs: 1000,
    shouldRetry: (error) => error.response?.status >= 500
  }
);
```

## Notes

- Current: Exponential backoff retry for 5xx errors
- Future: Circuit breaker to prevent cascading failures
- Future: Bulkhead pattern for resource isolation
- Future: Fallback to cached data on failures
