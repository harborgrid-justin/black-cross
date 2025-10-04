# Example TypeScript Module

This is a **demonstration module** showing the TypeScript migration pattern for Black-Cross backend modules.

## Purpose

This module serves as a **template and reference** for migrating existing JavaScript modules to TypeScript.

## Structure

```
example-typescript/
├── index.ts          # Module entry point
├── routes.ts         # Route definitions
├── controller.ts     # Request handlers
├── service.ts        # Business logic
├── types.ts          # Type definitions
└── README.md         # This file
```

## Key Patterns

### 1. Type Definitions (`types.ts`)
- Define interfaces for data models
- Define interfaces for API requests/responses
- Use union types for status enums

### 2. Service Layer (`service.ts`)
- Type all function parameters
- Type all return values with `Promise<T>`
- Use Prisma-generated types when applicable

### 3. Controller Layer (`controller.ts`)
- Import Express types (`Request`, `Response`)
- Use proper error handling
- Type all responses consistently

### 4. Routes (`routes.ts`)
- Import `Router` from Express
- Use ES6 module syntax (`import`/`export`)
- Export default router

### 5. Module Entry (`index.ts`)
- Use ES6 module syntax
- Maintain health check endpoint
- Export default router

## Usage

This module is mounted at `/api/v1/example` in the main application.

### Endpoints

- `GET /api/v1/example/health` - Health check
- `GET /api/v1/example` - List all (with optional filters)
- `GET /api/v1/example/:id` - Get by ID
- `POST /api/v1/example` - Create new

### Example Requests

```bash
# Health check
curl http://localhost:8080/api/v1/example/health

# List all
curl http://localhost:8080/api/v1/example

# Filter by status
curl http://localhost:8080/api/v1/example?status=active

# Get by ID
curl http://localhost:8080/api/v1/example/1

# Create new
curl -X POST http://localhost:8080/api/v1/example \
  -H "Content-Type: application/json" \
  -d '{"name":"New Item","status":"active"}'
```

## Migration Checklist

When migrating a module to TypeScript, follow this checklist:

- [ ] Create `types.ts` with module-specific types
- [ ] Rename `.js` files to `.ts`
- [ ] Replace `require()` with `import`
- [ ] Replace `module.exports` with `export`
- [ ] Add type annotations to function parameters
- [ ] Add return type annotations
- [ ] Add interfaces for data structures
- [ ] Update error handling with proper types
- [ ] Test compilation with `npm run build`
- [ ] Test functionality
- [ ] Update module documentation

## Notes

- This is a **mock implementation** for demonstration purposes
- In production modules, replace mock data with actual Prisma/MongoDB queries
- Follow the patterns established in this module for consistency
- See `TYPESCRIPT_MIGRATION.md` for complete migration guide

## Related Documentation

- [TYPESCRIPT_MIGRATION.md](../../../TYPESCRIPT_MIGRATION.md) - Complete migration guide
- [backend/README.md](../../README.md) - Backend documentation
- [backend/types/index.ts](../../types/index.ts) - Shared type definitions
