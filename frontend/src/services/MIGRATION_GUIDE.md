# Service Layer Migration Guide

This guide helps you migrate from legacy services to the new structured service architecture.

## 📋 Overview

The new service architecture provides:
- ✅ **Type Safety**: Full TypeScript with runtime validation
- ✅ **Consistency**: Standardized patterns across all services
- ✅ **Error Handling**: Better error messages and handling
- ✅ **Performance**: Built-in caching and retry logic
- ✅ **Maintainability**: Clear structure and documentation

## 🔄 Migration Steps

### Step 1: Understanding the Differences

#### Legacy Service (Old)
```typescript
import { threatService } from '@/services/threatService';

// Calling the service
const response = await threatService.getThreats({ status: 'active' });
const threats = response.data;
```

#### New Structured Service
```typescript
import { threatIntelligenceApi } from '@/services';

// Calling the service - cleaner, type-safe
const response = await threatIntelligenceApi.getAll({ 
  status: ['active'],
  page: 1,
  perPage: 20 
});
const threats = response.data;
```

### Step 2: Update Imports

#### Before
```typescript
import { threatService } from '@/services/threatService';
import { incidentService } from '@/services/incidentService';
import { vulnerabilityService } from '@/services/vulnerabilityService';
```

#### After
```typescript
import { 
  threatIntelligenceApi,
  // incidentApi, (when migrated)
  // vulnerabilityApi, (when migrated)
} from '@/services';
```

### Step 3: Update Service Calls

#### Legacy Pattern
```typescript
// Get threats
const response = await threatService.getThreats(filters);
if (response.success) {
  setThreats(response.data);
}

// Get single threat
const threat = await threatService.getThreat(id);

// Create threat
const newThreat = await threatService.collectThreat(data);

// Update threat
const updated = await threatService.updateThreat(id, data);

// Delete threat
await threatService.deleteThreat(id);
```

#### New Structured Pattern
```typescript
// Get threats - better typing and validation
const response = await threatIntelligenceApi.getAll(filters);
setThreats(response.data);

// Get single threat
const threat = await threatIntelligenceApi.getById(id);

// Create threat - validated with Zod
const newThreat = await threatIntelligenceApi.create(data);

// Update threat - partial updates supported
const updated = await threatIntelligenceApi.update(id, data);

// Delete threat
await threatIntelligenceApi.delete(id);
```

### Step 4: Update Error Handling

#### Legacy Error Handling
```typescript
try {
  const response = await threatService.getThreats();
  if (response.success) {
    setThreats(response.data);
  } else {
    setError(response.error);
  }
} catch (error) {
  setError('Failed to fetch threats');
}
```

#### New Error Handling
```typescript
import { type ApiError } from '@/services';

try {
  const response = await threatIntelligenceApi.getAll();
  setThreats(response.data);
} catch (error) {
  const apiError = error as ApiError;
  setError(apiError.message);
  console.error('Status:', apiError.status, 'Code:', apiError.code);
}
```

### Step 5: Update Redux Slices

#### Before
```typescript
// threatSlice.ts
import { threatService } from '@/services/threatService';

export const fetchThreats = createAsyncThunk(
  'threats/fetchThreats',
  async (filters: FilterOptions) => {
    const response = await threatService.getThreats(filters);
    return response;
  }
);
```

#### After
```typescript
// threatSlice.ts
import { threatIntelligenceApi } from '@/services';

export const fetchThreats = createAsyncThunk(
  'threats/fetchThreats',
  async (filters: ThreatFilters) => {
    const response = await threatIntelligenceApi.getAll(filters);
    return response;
  }
);
```

## 📊 Service Comparison Table

| Feature | Legacy Services | New Services |
|---------|----------------|--------------|
| Type Safety | Partial | Full |
| Validation | Manual | Zod schemas |
| Error Handling | Inconsistent | Standardized |
| Retry Logic | None | Built-in |
| Caching | None | Built-in |
| Documentation | Minimal | Comprehensive |
| Consistency | Varies | Standardized |

## 🎯 Migration Checklist per Service

When migrating a service:

- [ ] Create new API module in `modules/` directory
- [ ] Define TypeScript interfaces for:
  - [ ] Entity types
  - [ ] Filter parameters
  - [ ] Create/Update DTOs
  - [ ] API interface
- [ ] Create Zod validation schemas for:
  - [ ] Create operations
  - [ ] Update operations
  - [ ] Filter parameters
- [ ] Implement API class with:
  - [ ] Basic CRUD operations
  - [ ] Domain-specific operations
  - [ ] Proper error handling
  - [ ] Input validation
- [ ] Export singleton instance
- [ ] Add to `index.new.ts` exports
- [ ] Update components to use new service
- [ ] Update Redux slices to use new service
- [ ] Test all operations
- [ ] Mark legacy service for deprecation

## 🔧 Advanced Features

### Using Retry Logic

```typescript
import { withRetry } from '@/services';

// Automatic retry for failed requests
const data = await withRetry(
  () => threatIntelligenceApi.getAll(),
  {
    maxRetries: 3,
    backoffMs: 1000,
    shouldRetry: (error) => {
      // Custom retry logic
      return error.status >= 500;
    }
  }
);
```

### Using Cache

```typescript
import { withCache } from '@/services';

// Cache response for 5 minutes
const data = await withCache(
  'threats-list',
  () => threatIntelligenceApi.getAll(),
  5 * 60 * 1000
);

// Clear cache when needed
import { apiCache } from '@/services';
apiCache.clear('threats-list');
```

### Custom Validation

```typescript
import { z } from 'zod';

// Define custom schema
const customSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(18).max(120),
});

// Use in service call
try {
  const validatedData = customSchema.parse(formData);
  await api.create(validatedData);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation errors
    setErrors(error.flatten());
  }
}
```

## 🚀 Example: Complete Component Migration

### Before (Legacy)
```typescript
import React, { useEffect, useState } from 'react';
import { threatService } from '@/services/threatService';

export function ThreatsPage() {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadThreats() {
      try {
        setLoading(true);
        const response = await threatService.getThreats({ 
          status: 'active' 
        });
        
        if (response.success) {
          setThreats(response.data);
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError('Failed to load threats');
      } finally {
        setLoading(false);
      }
    }
    
    loadThreats();
  }, []);

  const handleDelete = async (id) => {
    try {
      await threatService.deleteThreat(id);
      setThreats(threats.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete threat');
    }
  };

  // ... render
}
```

### After (New Service)
```typescript
import React, { useEffect, useState } from 'react';
import { threatIntelligenceApi, type ApiError } from '@/services';
import type { Threat, ThreatFilters } from '@/services';

export function ThreatsPage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadThreats() {
      try {
        setLoading(true);
        const filters: ThreatFilters = { 
          status: ['active'],
          page: 1,
          perPage: 20
        };
        
        const response = await threatIntelligenceApi.getAll(filters);
        setThreats(response.data);
        setError(null);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to load threats');
      } finally {
        setLoading(false);
      }
    }
    
    loadThreats();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await threatIntelligenceApi.delete(id);
      setThreats(threats.filter(t => t.id !== id));
      setError(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete threat');
    }
  };

  // ... render
}
```

## 📝 Best Practices

1. **Always validate input**: Use Zod schemas before API calls
2. **Handle errors properly**: Use typed error objects
3. **Use caching wisely**: Cache read-heavy operations
4. **Implement retry logic**: For critical operations
5. **Type everything**: Leverage TypeScript fully
6. **Clear error messages**: Provide helpful user feedback
7. **Test thoroughly**: Test success and error cases

## 🔍 Troubleshooting

### "Module not found" errors
- Ensure you're importing from `@/services` not `@/services/index`
- Check that the service module is exported in `index.new.ts`

### Type errors
- Verify you're using the correct type imports
- Check that filter parameters match the API interface

### Validation errors
- Review Zod schema definitions
- Check that input data matches schema structure
- Use try-catch to handle validation errors

## 📚 Additional Resources

- [Services README](./README.md) - Complete service architecture documentation
- [API Utils Documentation](./utils/apiUtils.ts) - Utility functions reference
- [Base Service Documentation](./core/BaseApiService.ts) - Extending base services
- [Type Definitions](../types/index.ts) - Domain type definitions

## 🎓 Learning Path

1. **Read the README**: Understand the architecture
2. **Study the example**: Review `threatIntelligenceApi.ts`
3. **Migrate one component**: Start small with a single component
4. **Migrate Redux slice**: Update thunk actions
5. **Migrate entire feature**: Complete feature migration
6. **Create new services**: Build new domain services

## ⚠️ Important Notes

- Don't remove legacy services until all components are migrated
- Both old and new services can coexist during transition
- Test thoroughly after each migration
- Update documentation as you migrate

## 🤝 Getting Help

If you encounter issues during migration:
1. Check this guide and the main README
2. Review the reference implementation (`threatIntelligenceApi.ts`)
3. Ask the team for help
4. Document any patterns you discover
