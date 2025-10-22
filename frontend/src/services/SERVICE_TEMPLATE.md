# Service Template

Use this template when creating new domain-specific API services.

## Template File: `modules/{domain}Api.ts`

Replace placeholders:
- `{Domain}` - PascalCase domain name (e.g., `Incident`, `Vulnerability`)
- `{domain}` - camelCase domain name (e.g., `incident`, `vulnerability`)
- `{domain-kebab}` - kebab-case domain name (e.g., `incident-response`, `vulnerability-management`)
- `{DOMAIN}` - UPPERCASE domain name for constants (e.g., `INCIDENT`, `VULNERABILITY`)

```typescript
/**
 * WF-COMP-XXX | {domain}Api.ts - {Domain} API service module
 * Purpose: {Domain} domain API operations with type safety and validation
 * Upstream: ../config/apiConfig, ../utils/apiUtils, ../types | Dependencies: axios, zod
 * Downstream: Components, Redux stores | Called by: {Domain} components and stores
 * Related: {Domain} types, {domain} Redux slice
 * Exports: {domain}Api instance, types | Key Features: CRUD operations, validation, error handling
 * Last Updated: {date} | File Type: .ts
 * Critical Path: Component request → API call → Backend → Response transformation → Component update
 * LLM Context: Domain-specific API service with comprehensive type safety and validation
 */

import { apiInstance } from '../config/apiConfig';
import { 
  ApiResponse, 
  PaginatedResponse, 
  buildUrlParams,
  handleApiError,
  extractApiData,
  withRetry
} from '../utils/apiUtils';
import { z } from 'zod';
import type { {Domain} } from '../../types';

// ==========================================
// INTERFACES & TYPES
// ==========================================

export interface {Domain}Filters {
  search?: string;
  status?: string[];
  // Add domain-specific filters
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Create{Domain}Data {
  // Define required fields for creation
  name: string;
  description?: string;
  // Add domain-specific fields
}

export interface Update{Domain}Data {
  // Define fields that can be updated (usually partial)
  name?: string;
  description?: string;
  status?: string;
  // Add domain-specific fields
}

export interface {Domain}Statistics {
  total: number;
  // Add domain-specific statistics
  byStatus: {
    [key: string]: number;
  };
}

export interface {Domain}Api {
  // Basic CRUD operations
  getAll(filters?: {Domain}Filters): Promise<PaginatedResponse<{Domain}>>;
  getById(id: string): Promise<{Domain}>;
  create(data: Create{Domain}Data): Promise<{Domain}>;
  update(id: string, data: Update{Domain}Data): Promise<{Domain}>;
  delete(id: string): Promise<void>;
  
  // Advanced operations (optional, add as needed)
  getStatistics(filters?: {Domain}Filters): Promise<{Domain}Statistics>;
  bulkUpdate?(ids: string[], data: Partial<Update{Domain}Data>): Promise<{Domain}[]>;
  export?(filters?: {Domain}Filters): Promise<Blob>;
  import?(file: File): Promise<{ success: number; errors: string[] }>;
  
  // Search and filtering
  search(query: string, filters?: {Domain}Filters): Promise<{Domain}[]>;
}

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

// Common validation patterns
const ID_REGEX = /^[a-zA-Z0-9-_]{1,50}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
const URL_REGEX = /^https?:\/\/.+/;

/**
 * Create {domain} validation schema
 */
const create{Domain}Schema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200, 'Name cannot exceed 200 characters')
    .trim(),
    
  description: z
    .string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
    
  // Add domain-specific validations
  // Example: email field
  // email: z.string().email('Invalid email address').optional(),
  
  // Example: number field
  // priority: z.number().min(1).max(5).default(3),
  
  // Example: enum field
  // status: z.enum(['active', 'inactive', 'pending']),
  
  // Example: array field
  // tags: z.array(z.string().max(50)).max(10).optional(),
  
  // Example: nested object
  // metadata: z.object({
  //   key: z.string(),
  //   value: z.string(),
  // }).optional(),
  
}).strict(); // Prevent additional properties

/**
 * Update {domain} validation schema (partial of create)
 */
const update{Domain}Schema = create{Domain}Schema.partial();

/**
 * Filter validation schema
 */
const {domain}FiltersSchema = z.object({
  search: z.string().max(200).optional(),
  status: z.array(z.string()).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  perPage: z.number().int().min(1).max(100).optional(),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
}).strict();

// ==========================================
// API IMPLEMENTATION CLASS
// ==========================================

class {Domain}ApiImpl implements {Domain}Api {
  private readonly baseEndpoint = '/api/{domain-kebab}';

  /**
   * Get all {domain} items with filtering and pagination
   */
  async getAll(filters?: {Domain}Filters): Promise<PaginatedResponse<{Domain}>> {
    try {
      // Validate filters
      const validatedFilters = filters ? {domain}FiltersSchema.parse(filters) : {};
      
      // Build query parameters
      const params = buildUrlParams(validatedFilters);
      const url = `${this.baseEndpoint}${params.toString() ? `?${params.toString()}` : ''}`;
      
      // Make request with retry logic
      const response = await withRetry(() => apiInstance.get(url), {
        maxRetries: 3,
        backoffMs: 1000
      });
      
      // Extract and validate response
      return response.data as PaginatedResponse<{Domain}>;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get a single {domain} item by ID
   */
  async getById(id: string): Promise<{Domain}> {
    try {
      // Validate ID format
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      const response = await apiInstance.get<ApiResponse<{Domain}>>(`${this.baseEndpoint}/${id}`);
      return extractApiData<{Domain}>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Create a new {domain} item
   */
  async create(data: Create{Domain}Data): Promise<{Domain}> {
    try {
      // Validate input data
      const validatedData = create{Domain}Schema.parse(data);
      
      const response = await apiInstance.post<ApiResponse<{Domain}>>(this.baseEndpoint, validatedData);
      return extractApiData<{Domain}>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Update an existing {domain} item
   */
  async update(id: string, data: Update{Domain}Data): Promise<{Domain}> {
    try {
      // Validate ID and input data
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      const validatedData = update{Domain}Schema.parse(data);
      
      const response = await apiInstance.put<ApiResponse<{Domain}>>(`${this.baseEndpoint}/${id}`, validatedData);
      return extractApiData<{Domain}>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Delete a {domain} item
   */
  async delete(id: string): Promise<void> {
    try {
      // Validate ID format
      if (!ID_REGEX.test(id)) {
        throw new Error('Invalid ID format');
      }
      
      await apiInstance.delete(`${this.baseEndpoint}/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Get statistics for {domain} items
   */
  async getStatistics(filters?: {Domain}Filters): Promise<{Domain}Statistics> {
    try {
      const validatedFilters = filters ? {domain}FiltersSchema.parse(filters) : {};
      const params = buildUrlParams(validatedFilters);
      const url = `${this.baseEndpoint}/statistics${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await apiInstance.get<ApiResponse<{Domain}Statistics>>(url);
      return extractApiData<{Domain}Statistics>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Search {domain} items
   */
  async search(query: string, filters?: {Domain}Filters): Promise<{Domain}[]> {
    try {
      const validatedFilters = filters ? {domain}FiltersSchema.parse(filters) : {};
      const searchParams = { ...validatedFilters, q: query };
      const params = buildUrlParams(searchParams);
      
      const response = await apiInstance.get<ApiResponse<{Domain}[]>>(`${this.baseEndpoint}/search?${params.toString()}`);
      return extractApiData<{Domain}[]>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // ==========================================
  // DOMAIN-SPECIFIC METHODS
  // ==========================================
  
  /**
   * Add custom methods specific to this domain
   * Examples:
   * 
   * async activate(id: string): Promise<{Domain}> {
   *   try {
   *     if (!ID_REGEX.test(id)) throw new Error('Invalid ID format');
   *     const response = await apiInstance.post<ApiResponse<{Domain}>>(`${this.baseEndpoint}/${id}/activate`);
   *     return extractApiData<{Domain}>(response);
   *   } catch (error) {
   *     throw handleApiError(error);
   *   }
   * }
   * 
   * async assignTo(id: string, userId: string): Promise<{Domain}> {
   *   try {
   *     if (!ID_REGEX.test(id)) throw new Error('Invalid ID format');
   *     const response = await apiInstance.post<ApiResponse<{Domain}>>(
   *       `${this.baseEndpoint}/${id}/assign`,
   *       { userId }
   *     );
   *     return extractApiData<{Domain}>(response);
   *   } catch (error) {
   *     throw handleApiError(error);
   *   }
   * }
   */
}

// ==========================================
// SINGLETON EXPORT
// ==========================================

/**
 * Singleton instance of {Domain}Api
 * Use this throughout the application
 */
export const {domain}Api: {Domain}Api = new {Domain}ApiImpl();
```

## Checklist for New Service

When creating a new service, ensure you:

- [ ] Replace all template placeholders
- [ ] Define domain-specific interfaces
- [ ] Create appropriate Zod validation schemas
- [ ] Implement all CRUD operations
- [ ] Add domain-specific methods as needed
- [ ] Handle errors consistently
- [ ] Validate all inputs
- [ ] Add JSDoc comments
- [ ] Export singleton instance
- [ ] Add to `index.new.ts` exports
- [ ] Update service README
- [ ] Write usage examples
- [ ] Test all operations

## Example: Creating a User Service

```typescript
// modules/userApi.ts
import { apiInstance } from '../config/apiConfig';
import { z } from 'zod';

// Types
export interface UserFilters {
  role?: string[];
  status?: string[];
  search?: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  role: 'admin' | 'analyst' | 'viewer';
}

export interface UpdateUserData {
  name?: string;
  role?: 'admin' | 'analyst' | 'viewer';
  status?: 'active' | 'inactive';
}

// Validation
const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'analyst', 'viewer']),
});

// Implementation
class UserApiImpl {
  private readonly baseEndpoint = '/api/users';
  
  async getAll(filters?: UserFilters) {
    // Implementation
  }
  
  async create(data: CreateUserData) {
    const validated = createUserSchema.parse(data);
    const response = await apiInstance.post(this.baseEndpoint, validated);
    return extractApiData(response);
  }
  
  // ... other methods
}

export const userApi = new UserApiImpl();
```

## Common Patterns

### Handling File Uploads

```typescript
async uploadFile(id: string, file: File): Promise<{Domain}> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiInstance.post<ApiResponse<{Domain}>>(
      `${this.baseEndpoint}/${id}/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    
    return extractApiData<{Domain}>(response);
  } catch (error) {
    throw handleApiError(error);
  }
}
```

### Handling Downloads

```typescript
async downloadReport(id: string): Promise<Blob> {
  try {
    const response = await apiInstance.get(
      `${this.baseEndpoint}/${id}/download`,
      {
        responseType: 'blob',
        headers: {
          Accept: 'application/pdf'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
```

### Bulk Operations

```typescript
async bulkUpdate(ids: string[], data: Partial<Update{Domain}Data>): Promise<{Domain}[]> {
  try {
    ids.forEach(id => {
      if (!ID_REGEX.test(id)) throw new Error(`Invalid ID: ${id}`);
    });
    
    const validatedData = update{Domain}Schema.partial().parse(data);
    
    const response = await apiInstance.patch<ApiResponse<{Domain}[]>>(
      `${this.baseEndpoint}/bulk`,
      { ids, data: validatedData }
    );
    
    return extractApiData<{Domain}[]>(response);
  } catch (error) {
    throw handleApiError(error);
  }
}
```

### Polling Operations

```typescript
async pollStatus(id: string, maxAttempts: number = 30): Promise<{Domain}> {
  try {
    for (let i = 0; i < maxAttempts; i++) {
      const item = await this.getById(id);
      
      if (item.status === 'completed' || item.status === 'failed') {
        return item;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    }
    
    throw new Error('Polling timeout: operation did not complete');
  } catch (error) {
    throw handleApiError(error);
  }
}
```

## Tips

1. **Keep it simple**: Start with basic CRUD, add complexity as needed
2. **Validate early**: Always validate inputs with Zod
3. **Handle errors**: Use try-catch and `handleApiError`
4. **Type everything**: No `any` types
5. **Document well**: Add JSDoc comments
6. **Test thoroughly**: Test success and error cases
7. **Follow conventions**: Match existing service patterns
8. **Cache wisely**: Use caching for read-heavy operations
9. **Retry smartly**: Configure retries based on operation type
10. **Monitor performance**: Track slow operations

## Next Steps

After creating your service:

1. Add to `index.new.ts` exports
2. Update service README with usage examples
3. Create unit tests (future)
4. Update migration guide if replacing legacy service
5. Document any new patterns you discover
