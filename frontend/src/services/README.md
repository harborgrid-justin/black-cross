# Frontend Services Structure

This directory contains the frontend service layer with a modular, type-safe architecture.

## 📁 Directory Structure

```
services/
├── index.new.ts                      # Main service exports (new structure)
├── config/
│   └── apiConfig.ts                  # Axios configuration and interceptors
├── core/
│   ├── index.ts                      # Core service exports
│   └── BaseApiService.ts             # Abstract base class for CRUD operations
├── modules/
│   ├── threatIntelligenceApi.ts      # Threat Intelligence service (new structure)
│   └── [other domain APIs...]        # Other domain-specific services
├── utils/
│   └── apiUtils.ts                   # HTTP utility functions
├── types/
│   └── index.ts                      # Service type re-exports
├── security/                         # Security services (placeholder)
│   └── README.md
├── cache/                            # Caching services (placeholder)
│   └── README.md
├── monitoring/                       # Monitoring services (placeholder)
│   └── README.md
└── resilience/                       # Resilience patterns (placeholder)
    └── README.md
```

## 🎯 Architecture Overview

The service layer follows a modular architecture with:

- **Core Infrastructure**: Shared configuration, base classes, and utilities
- **Domain-Specific APIs**: Type-safe services for each business domain
- **Type Safety**: Full TypeScript support with Zod validation
- **Error Handling**: Consistent error handling across all services
- **Monitoring**: Performance tracking and logging
- **Resilience**: Retry logic and failure handling

## 🚀 Getting Started

### Using the New Structured API

```typescript
import { threatIntelligenceApi } from '@/services';

// Get all threats with filtering
const threats = await threatIntelligenceApi.getAll({
  status: ['active'],
  severity: ['critical', 'high'],
  page: 1,
  perPage: 20,
});

// Get single threat
const threat = await threatIntelligenceApi.getById('threat-123');

// Create new threat
const newThreat = await threatIntelligenceApi.create({
  name: 'Suspicious Activity',
  type: 'malware',
  severity: 'high',
  confidence: 85,
  description: 'Detected suspicious behavior...',
});

// Update threat
const updated = await threatIntelligenceApi.update('threat-123', {
  status: 'resolved',
});
```

### Using Utilities

```typescript
import { 
  withRetry, 
  withCache, 
  buildUrlParams,
  handleApiError 
} from '@/services';

// Retry failed requests
const data = await withRetry(
  () => api.getThreats(),
  { maxRetries: 3, backoffMs: 1000 }
);

// Cache API responses
const cachedData = await withCache(
  'threats-key',
  () => api.getThreats(),
  5 * 60 * 1000 // 5 minutes
);

// Build query parameters
const params = buildUrlParams({ page: 1, status: 'active' });
```

### Creating Custom Services

Use the `BaseApiService` to create new domain services:

```typescript
import { BaseApiService, type BaseEntity } from '@/services/core';
import { z } from 'zod';

interface CustomEntity extends BaseEntity {
  name: string;
  value: number;
}

interface CreateCustomDto {
  name: string;
  value: number;
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  value: z.number().min(0),
});

class CustomApiService extends BaseApiService<CustomEntity, CreateCustomDto> {
  constructor() {
    super('/api/custom', { createSchema });
  }
  
  // Add custom methods
  async getByName(name: string): Promise<CustomEntity> {
    const response = await this.client.get(this.buildUrl(`/by-name/${name}`));
    return response.data;
  }
}

export const customApi = new CustomApiService();
```

## 📝 API Service Template

Each domain API should follow this structure:

1. **Interfaces & Types**: Define domain-specific types
2. **Validation Schemas**: Zod schemas for runtime validation
3. **Implementation Class**: Service class implementing the interface
4. **Singleton Export**: Single instance for the entire app
5. **Type Exports**: Export all types for consumers

Example structure:

```typescript
// 1. Types
export interface DomainApi {
  getAll(filters?: Filters): Promise<PaginatedResponse<Entity>>;
  getById(id: string): Promise<Entity>;
  create(data: CreateData): Promise<Entity>;
  update(id: string, data: UpdateData): Promise<Entity>;
  delete(id: string): Promise<void>;
}

// 2. Validation
const createSchema = z.object({
  name: z.string().min(1),
  // ... other fields
});

// 3. Implementation
class DomainApiImpl implements DomainApi {
  private readonly baseEndpoint = '/api/domain';
  
  async getAll(filters?: Filters): Promise<PaginatedResponse<Entity>> {
    // Implementation with validation and error handling
  }
  
  // ... other methods
}

// 4. Singleton
export const domainApi: DomainApi = new DomainApiImpl();

// 5. Type exports
export type { DomainApi };
```

## 🔧 Configuration

### API Instance

The global API instance is configured in `config/apiConfig.ts`:

- Base URL from environment variables
- Request/response interceptors
- Authentication token handling
- Error handling and retries
- Performance monitoring

### Environment Variables

```env
VITE_API_URL=/api/v1
```

## 🛡️ Type Safety

All services use TypeScript for type safety:

- **Input Validation**: Zod schemas validate data at runtime
- **Type Guards**: Utility functions for type checking
- **Strict Types**: No `any` types in service layer
- **Generic Types**: Reusable patterns with generics

## 📊 Error Handling

Consistent error handling across all services:

```typescript
try {
  const data = await api.create(input);
} catch (error) {
  if (isApiError(error)) {
    console.error(error.message, error.code, error.status);
  }
}
```

Error types:
- `ApiError`: Structured error from API responses
- Validation errors from Zod schemas
- Network errors with proper messages

## 🔄 Migration Guide

### Migrating Legacy Services

To migrate an existing service to the new structure:

1. **Create New Module**: Add to `modules/` directory
2. **Define Types**: Create interfaces for filters, create/update DTOs
3. **Add Validation**: Define Zod schemas
4. **Implement API**: Use the template structure
5. **Update Imports**: Gradually update components to use new API
6. **Maintain Compatibility**: Keep old service until migration complete

### Backward Compatibility

The `index.new.ts` file exports both new and legacy services:

```typescript
// New structured API
import { threatIntelligenceApi } from '@/services';

// Legacy API (still works)
import { threatService } from '@/services';
```

## 📚 Best Practices

1. **Use Type-Safe APIs**: Prefer new structured APIs over legacy
2. **Validate Input**: Always validate user input with Zod
3. **Handle Errors**: Use try-catch and proper error handling
4. **Cache Wisely**: Use caching for read-heavy operations
5. **Retry Smart**: Configure retries based on operation type
6. **Monitor Performance**: Track slow requests and errors
7. **Document Changes**: Update this README when adding services

## 🔮 Future Enhancements

Planned improvements (see placeholder directories):

- **Security**: Token encryption, CSRF protection, permission checks
- **Cache**: Advanced caching with IndexedDB, cache warming
- **Monitoring**: Integration with error tracking services
- **Resilience**: Circuit breakers, bulkheads, graceful degradation

## 📖 Related Documentation

- [API Constants](../constants/api.ts) - API endpoint definitions
- [Type Definitions](../types/index.ts) - Domain type definitions
- [Testing Guide](../../cypress/README.md) - E2E testing services

## 🤝 Contributing

When adding new services:

1. Follow the template structure
2. Add comprehensive JSDoc comments
3. Include validation schemas
4. Write unit tests (future)
5. Update this README
6. Maintain backward compatibility

## 📄 License

Part of the Black-Cross Enterprise Cyber Threat Intelligence Platform
