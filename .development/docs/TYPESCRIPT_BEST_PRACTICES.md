# TypeScript Best Practices - Black-Cross

This document outlines the TypeScript best practices implemented in the Black-Cross project, following industry standards and modern TypeScript patterns.

## Type Safety & Strictness ✅

### 1. Strict Mode Configuration

Both backend and frontend have strict mode enabled with all strict flags:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### 2. Avoiding 'any' Type

- **Rule**: `@typescript-eslint/no-explicit-any: error`
- Use `unknown` for truly unknown types and narrow with type guards
- Define explicit interfaces for all object shapes
- Use generics for reusable type-safe functions

**Example:**
```typescript
// ❌ Bad
function processData(data: any): any {
  return data.value;
}

// ✅ Good
function processData<T extends { value: string }>(data: T): string {
  return data.value;
}
```

### 3. Explicit Type Annotations

All functions have explicit return type annotations:

```typescript
// Function with explicit return type
export async function getData(query: ExampleQuery): Promise<readonly ExampleData[]> {
  // implementation
}
```

### 4. Union Types and Type Guards

Use union types and type guards instead of type assertions:

```typescript
// Type guard example
export function isAuthRequest(req: Request): req is AuthRequest {
  return 'user' in req && req.user !== undefined;
}

// Usage with type narrowing
if (isAuthRequest(req)) {
  // TypeScript knows req.user exists here
  console.log(req.user.id);
}
```

### 5. Discriminated Unions

Use discriminated unions for mutually exclusive states:

```typescript
export type ApiResponse<T = unknown> =
  | {
      readonly success: true;
      readonly data: T;
      readonly message?: string;
    }
  | {
      readonly success: false;
      readonly error: string;
      readonly message?: string;
    };
```

## Code Organization & Modularity ✅

### 1. Naming Conventions

Enforced through ESLint `@typescript-eslint/naming-convention`:

- **PascalCase**: Types, Interfaces, Classes, Enums
  - `ExampleData`, `UserService`, `HealthStatus`
- **camelCase**: Variables, Functions, Parameters
  - `userData`, `processRequest`, `userId`
- **UPPER_SNAKE_CASE**: Global Constants
  - `API_BASE_URL`, `MAX_RETRY_COUNT`

### 2. Module Exports

- Export only public APIs
- Keep internal implementation details private
- Use named exports for better tree-shaking

```typescript
// ✅ Good - Named exports
export { ExampleService } from './service';
export type { ExampleData, ExampleQuery } from './types';

// ❌ Avoid - Default exports unless necessary
export default class Service { }
```

### 3. Barrel Exports

Use index.ts files for cleaner imports:

```typescript
// types/index.ts
export type { ApiResponse, PaginationParams, FilterParams } from './common';
export type { UserRole, AuthenticatedUser } from './auth';

// Usage
import type { ApiResponse, UserRole } from '@/types';
```

### 4. Path Aliases

Configured in tsconfig.json for cleaner imports:

```json
{
  "paths": {
    "@/types/*": ["types/*"],
    "@/modules/*": ["modules/*"],
    "@/utils/*": ["utils/*"]
  }
}
```

## Error Handling & Null Safety ✅

### 1. Optional Chaining & Nullish Coalescing

- **Rule**: `@typescript-eslint/prefer-optional-chain: error`
- **Rule**: `@typescript-eslint/prefer-nullish-coalescing: error`

```typescript
// ✅ Good - Optional chaining
const userName = user?.profile?.name ?? 'Anonymous';

// ✅ Good - Nullish coalescing for defaults
const limit = query.limit ?? 10;

// ❌ Bad - Manual null checks
const userName = user && user.profile && user.profile.name || 'Anonymous';
```

### 2. Discriminated Unions

Use for mutually exclusive states (see examples above).

### 3. Non-null Assertions

- **Rule**: `@typescript-eslint/no-non-null-assertion: error`
- Avoid `!` operator unless absolutely necessary
- Document why when used

```typescript
// ❌ Bad - Non-null assertion without justification
const value = obj.field!;

// ✅ Good - Use type guard or optional chaining
const value = obj.field ?? defaultValue;
```

## Best Practices ✅

### 1. Readonly Properties

Use `readonly` for immutability:

```typescript
export interface ExampleData {
  readonly id: string;
  readonly name: string;
  readonly createdAt: Date;
}
```

### 2. String Literal Unions Over Enums

Prefer string literal unions for better type narrowing:

```typescript
// ✅ Good - String literal union
export type UserRole = 'admin' | 'analyst' | 'viewer';

// ❌ Avoid - Enum (use only when necessary)
enum UserRole {
  Admin = 'admin',
  Analyst = 'analyst',
  Viewer = 'viewer'
}
```

### 3. Generic Types

Implement generics for reusable type-safe utilities:

```typescript
export interface PaginatedResponse<T> {
  readonly success: boolean;
  readonly data: readonly T[];
  readonly pagination: {
    readonly page: number;
    readonly total: number;
  };
}
```

### 4. Utility Types

Use built-in utility types to transform existing types:

```typescript
// Omit for excluding fields
export type CreateInput = Omit<Entity, 'id' | 'createdAt'>;

// Pick for selecting fields
export type UpdateInput = Partial<Pick<Entity, 'name' | 'status'>>;

// Readonly for immutability
export type ImmutableEntity = Readonly<Entity>;

// Record for key-value maps
export type StatusMap = Record<string, HealthStatus>;
```

## Documentation & Maintainability ✅

### 1. JSDoc Comments

Add JSDoc for all public APIs:

```typescript
/**
 * Get example data with optional filtering
 * @param query - Query parameters for filtering
 * @returns Promise resolving to array of filtered example data
 * @throws Error if query validation fails
 */
export async function getData(query: ExampleQuery): Promise<readonly ExampleData[]> {
  // implementation
}
```

### 2. Type Documentation

Document complex types and business logic:

```typescript
/**
 * API response using discriminated union for type safety
 * This allows TypeScript to narrow types based on the success field
 * 
 * @example
 * if (response.success) {
 *   console.log(response.data); // TypeScript knows data exists
 * } else {
 *   console.error(response.error); // TypeScript knows error exists
 * }
 */
export type ApiResponse<T> = ...
```

### 3. TypeScript Version

- Current version: **5.9.3**
- Keep updated to leverage latest features
- Review changelog for breaking changes

## Configuration & Tooling ✅

### 1. Path Aliases

Configured in both backend and frontend tsconfig.json:

```typescript
// Instead of
import { ApiResponse } from '../../../types';

// Use
import type { ApiResponse } from '@/types';
```

### 2. ESLint TypeScript Configuration

Comprehensive rules enabled:

- `@typescript-eslint/explicit-function-return-type: error`
- `@typescript-eslint/no-explicit-any: error`
- `@typescript-eslint/prefer-readonly: error`
- `@typescript-eslint/consistent-type-imports: error`

### 3. Additional TypeScript Checks

Enabled in tsconfig.json:

```json
{
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "noPropertyAccessFromIndexSignature": true
}
```

## Module Migration Pattern

See `backend/modules/example-typescript/` for complete reference implementation demonstrating all best practices:

1. **types.ts** - Type definitions with readonly, discriminated unions
2. **service.ts** - Business logic with explicit types and error handling
3. **controller.ts** - Express handlers with type-safe request/response
4. **routes.ts** - RESTful routes with JSDoc documentation
5. **index.ts** - Module entry point with barrel exports

## Code Quality Tools

### Type Checking

```bash
# Backend type checking
cd backend && npm run type-check

# Frontend type checking
cd frontend && npm run type-check
```

### Linting

```bash
# Backend linting
cd backend && npm run lint

# Frontend linting
cd frontend && npm run lint
```

### Build

```bash
# Backend build
cd backend && npm run build

# Frontend build
cd frontend && npm run build
```

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## Summary

✅ All strict TypeScript flags enabled
✅ ESLint rules enforcing best practices
✅ Path aliases configured for cleaner imports
✅ Comprehensive type safety with discriminated unions
✅ Readonly properties for immutability
✅ Type guards instead of type assertions
✅ JSDoc documentation for public APIs
✅ Example module demonstrating all patterns
✅ Naming conventions enforced
✅ No 'any' types in codebase
✅ Optional chaining and nullish coalescing
✅ Generic types for reusability
✅ Utility types for type transformations
