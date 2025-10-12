# Example TypeScript Module

This is a **comprehensive demonstration module** showing TypeScript best practices and migration patterns for Black-Cross backend modules.

## Purpose

This module serves as a **reference implementation** demonstrating:
- 100% TypeScript implementation
- Strict type safety
- Modern TypeScript patterns
- Complete JSDoc documentation
- All TypeScript best practices

## Structure

```
example-typescript/
├── index.ts          # Module entry point
├── routes.ts         # Route definitions (RESTful API)
├── controller.ts     # Request handlers with type safety
├── service.ts        # Business logic with explicit types
├── types.ts          # Type definitions (discriminated unions, utility types)
└── README.md         # This file
```

## TypeScript Best Practices Demonstrated

### 1. Type Definitions (`types.ts`)

✅ **Readonly properties** for immutability
```typescript
export interface ExampleData {
  readonly id: string;
  readonly name: string;
  readonly status: ExampleStatus;
}
```

✅ **String literal unions** instead of enums
```typescript
export type ExampleStatus = 'active' | 'inactive';
```

✅ **Discriminated unions** for type-safe responses
```typescript
export type ExampleResponse<T> =
  | { readonly success: true; readonly data: T; }
  | { readonly success: false; readonly error: string; };
```

✅ **Utility types** for type transformations
```typescript
export type CreateInput = Omit<ExampleData, 'id' | 'createdAt'>;
export type UpdateInput = Partial<Pick<ExampleData, 'name' | 'status'>>;
```

✅ **Type guards** for runtime type checking
```typescript
export function isActiveExample(data: ExampleData): data is ExampleData & { status: 'active' } {
  return data.status === 'active';
}
```

### 2. Service Layer (`service.ts`)

✅ **Explicit return type annotations**
```typescript
public async getData(query: ExampleQuery): Promise<readonly ExampleData[]>
```

✅ **Optional chaining and nullish coalescing**
```typescript
const limit: number = query.limit ?? filtered.length;
```

✅ **Comprehensive JSDoc documentation**
```typescript
/**
 * Get example data with optional filtering
 * @param query - Query parameters for filtering
 * @returns Promise resolving to array of filtered example data
 */
```

✅ **Private methods** for encapsulation
```typescript
private generateId(): string { }
```

### 3. Controller Layer (`controller.ts`)

✅ **Type guards for error handling**
```typescript
function isError(error: unknown): error is Error {
  return error instanceof Error;
}
```

✅ **Type-safe query parsing**
```typescript
function parseQuery(query: Request['query']): ExampleQuery
```

✅ **Explicit error responses**
```typescript
const response: ExampleResponse<never> = {
  success: false,
  error: errorMessage,
};
```

### 4. Routes (`routes.ts`)

✅ **Type imports using 'type' keyword**
```typescript
import type { Router } from 'express';
```

✅ **Comprehensive route documentation**
```typescript
/**
 * GET /api/v1/example/:id
 * Get example data by ID
 * Path parameters:
 * - id: string (required)
 */
```

## Usage

This module is mounted at `/api/v1/example` in the main application.

### RESTful Endpoints

- `GET /api/v1/example/health` - Health check
- `GET /api/v1/example` - List all (with optional filters)
- `GET /api/v1/example/:id` - Get by ID
- `POST /api/v1/example` - Create new
- `PUT /api/v1/example/:id` - Update existing
- `DELETE /api/v1/example/:id` - Delete by ID

### Example Requests

```bash
# Health check
curl http://localhost:8080/api/v1/example/health

# List all
curl http://localhost:8080/api/v1/example

# Filter by status
curl http://localhost:8080/api/v1/example?status=active&limit=10

# Search
curl http://localhost:8080/api/v1/example?search=example

# Get by ID
curl http://localhost:8080/api/v1/example/1

# Create new
curl -X POST http://localhost:8080/api/v1/example \
  -H "Content-Type: application/json" \
  -d '{"name":"New Item","status":"active"}'

# Update
curl -X PUT http://localhost:8080/api/v1/example/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Item"}'

# Delete
curl -X DELETE http://localhost:8080/api/v1/example/1
```

## Migration Checklist

When migrating a module to TypeScript, follow this comprehensive checklist:

### Type Safety & Strictness
- [x] Enable strict mode in tsconfig.json
- [x] Avoid using 'any' type
- [x] Use explicit type annotations for function parameters and return types
- [x] Use union types and type guards instead of type assertions
- [x] Define interfaces for all object shapes

### Code Organization
- [x] Use consistent naming conventions (PascalCase, camelCase, UPPER_SNAKE_CASE)
- [x] Export only public APIs
- [x] Organize code into logical modules
- [x] Use barrel exports (index.ts) where appropriate

### Error Handling & Null Safety
- [x] Handle null and undefined with optional chaining (?.)
- [x] Use nullish coalescing (??) for defaults
- [x] Use discriminated unions for mutually exclusive states
- [x] Avoid non-null assertion operator (!)

### Best Practices
- [x] Use readonly properties for immutability
- [x] Use string literal unions instead of enums
- [x] Implement generic types for reusability
- [x] Use utility types (Partial, Pick, Omit, Record)

### Documentation
- [x] Add JSDoc comments for public APIs
- [x] Document complex types and business logic

### Implementation Steps
- [ ] Create `types.ts` with module-specific types
- [ ] Rename `.js` files to `.ts`
- [ ] Replace `require()` with `import` (use `type` imports where possible)
- [ ] Replace `module.exports` with `export`
- [ ] Add type annotations to function parameters
- [ ] Add return type annotations
- [ ] Add interfaces for data structures
- [ ] Update error handling with proper types
- [ ] Test compilation with `npm run build`
- [ ] Test type checking with `npm run type-check`
- [ ] Test functionality
- [ ] Update module documentation

## Configuration Requirements

This module requires the following TypeScript configuration:

### tsconfig.json (Strict Settings)
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

### ESLint Configuration
```json
{
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error"
  }
}
```

## Notes

- This is a **reference implementation** demonstrating all TypeScript best practices
- Mock data is used for demonstration - replace with Sequelize/MongoDB in production
- All patterns follow industry standards and modern TypeScript conventions
- See documentation links below for complete guides

## Related Documentation

- [TYPESCRIPT_BEST_PRACTICES.md](../../../TYPESCRIPT_BEST_PRACTICES.md) - Comprehensive best practices guide
- [TYPESCRIPT_MIGRATION.md](../../../TYPESCRIPT_MIGRATION.md) - Complete migration guide
- [backend/types/index.ts](../../types/index.ts) - Shared type definitions
- [backend/utils/typeGuards.ts](../../utils/typeGuards.ts) - Type guard utilities
- [backend/types/constants.ts](../../types/constants.ts) - Global constants
