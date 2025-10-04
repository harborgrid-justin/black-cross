# TypeScript Migration Guide

## Overview

The Black-Cross backend is being systematically migrated from JavaScript to TypeScript to improve:
- **Type Safety**: Catch errors at compile time
- **Developer Experience**: Better IDE support and autocomplete
- **Maintainability**: Self-documenting code with types
- **Scalability**: Easier refactoring and code evolution

## Current Status

### ✅ Completed
- TypeScript infrastructure setup (`tsconfig.json`)
- TypeScript dependencies installed
- ESLint configuration updated for TypeScript
- Build pipeline configured (`tsc`)
- Main entry point migrated (`index.ts`)
- Core type definitions created (`backend/types/`)

### 🔄 In Progress
- Module-by-module migration (149 JS files)
- Service layer type definitions
- Controller type definitions
- Model interfaces aligned with Prisma types

### 📋 Remaining
- Complete migration of all backend modules
- Comprehensive type coverage
- Remove legacy `.js` files after verification

## Architecture

### TypeScript Structure

```
backend/
├── index.ts                    # Main entry point (TypeScript)
├── types/                      # Shared type definitions
│   └── index.ts               # Core types
├── modules/
│   ├── [module-name]/
│   │   ├── models/            # Data models (to be migrated)
│   │   ├── services/          # Business logic (to be migrated)
│   │   ├── controllers/       # Request handlers (to be migrated)
│   │   ├── routes/            # Route definitions (to be migrated)
│   │   └── types.ts           # Module-specific types
├── dist/                       # Compiled JavaScript output
└── tsconfig.json              # TypeScript configuration
```

## Migration Strategy

### Phase 1: Infrastructure ✅
1. Set up TypeScript configuration
2. Install dependencies and tooling
3. Configure build pipeline
4. Update npm scripts

### Phase 2: Core Migration (Current)
1. Migrate main entry point (`index.ts`)
2. Create shared type definitions
3. Establish migration patterns
4. Document best practices

### Phase 3: Module Migration (Next)
1. Migrate one module as template
2. Create module-specific types
3. Update imports and exports
4. Test thoroughly
5. Repeat for remaining modules

### Phase 4: Cleanup & Optimization
1. Remove legacy `.js` files
2. Strict type checking
3. Performance optimization
4. Documentation updates

## TypeScript Configuration

### tsconfig.json

Key compiler options:
- **Target**: ES2020 for modern JavaScript features
- **Module**: CommonJS for Node.js compatibility
- **Strict**: Enabled for maximum type safety
- **Output**: `dist/` directory for compiled files
- **Source Maps**: Enabled for debugging

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./",
    "sourceMap": true
  }
}
```

## Migration Patterns

### 1. Express Handlers

**Before (JavaScript):**
```javascript
const express = require('express');

app.get('/api/data', (req, res) => {
  res.json({ data: 'example' });
});
```

**After (TypeScript):**
```typescript
import express, { Request, Response } from 'express';

app.get('/api/data', (_req: Request, res: Response) => {
  res.json({ data: 'example' });
});
```

### 2. Service Classes

**Before (JavaScript):**
```javascript
class ThreatService {
  async getThreats() {
    return await db.threats.find();
  }
}
```

**After (TypeScript):**
```typescript
import { Threat } from '@prisma/client';

interface ThreatQuery {
  status?: string;
  severity?: string;
}

class ThreatService {
  async getThreats(query: ThreatQuery): Promise<Threat[]> {
    return await prisma.threat.findMany({
      where: query,
    });
  }
}
```

### 3. API Responses

**Before (JavaScript):**
```javascript
res.json({
  success: true,
  data: results
});
```

**After (TypeScript):**
```typescript
import { ApiResponse } from '../types';

const response: ApiResponse<Threat[]> = {
  success: true,
  data: results,
};
res.json(response);
```

### 4. Middleware

**Before (JavaScript):**
```javascript
const authMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
```

**After (TypeScript):**
```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};
```

## Best Practices

### 1. Use Strict Types
- Avoid `any` type
- Use `unknown` for unknown types
- Define interfaces for complex objects

### 2. Leverage Prisma Types
```typescript
import { User, Incident } from '@prisma/client';

// Use generated Prisma types
const user: User = await prisma.user.findUnique({ where: { id } });
```

### 3. Create Reusable Types
```typescript
// backend/types/index.ts
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### 4. Type Guards
```typescript
function isAuthRequest(req: Request): req is AuthRequest {
  return 'user' in req;
}

if (isAuthRequest(req)) {
  // TypeScript knows req.user exists here
  console.log(req.user.id);
}
```

### 5. Async/Await with Types
```typescript
async function fetchData(): Promise<Data[]> {
  try {
    const result = await prisma.data.findMany();
    return result;
  } catch (error) {
    logger.error('Error fetching data', error);
    throw error;
  }
}
```

## Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Start development server with TypeScript
npm run dev

# 4. In another terminal, run type checking
npm run type-check
```

### Before Committing

```bash
# 1. Type check
npm run type-check

# 2. Lint code
npm run lint

# 3. Run tests
npm test

# 4. Build to ensure compilation works
npm run build
```

## Module Migration Checklist

When migrating a module to TypeScript:

- [ ] Create `types.ts` for module-specific types
- [ ] Rename `.js` files to `.ts`
- [ ] Add type annotations to function parameters
- [ ] Add return type annotations
- [ ] Replace `require()` with `import`
- [ ] Update `module.exports` to `export`
- [ ] Add interface definitions for data structures
- [ ] Integrate Prisma types where applicable
- [ ] Update tests to use TypeScript
- [ ] Verify compilation with `npm run build`
- [ ] Test functionality thoroughly
- [ ] Update module documentation

## Example: Complete Module Migration

### Before: threat-actors/services/actorService.js

```javascript
const logger = require('../utils/logger');

class ActorService {
  async getActors() {
    try {
      const actors = await db.actors.find();
      return actors;
    } catch (error) {
      logger.error('Error fetching actors', error);
      throw error;
    }
  }
}

module.exports = ActorService;
```

### After: threat-actors/services/actorService.ts

```typescript
import { PrismaClient, ThreatActor } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface ActorQuery {
  country?: string;
  sophistication?: string;
}

export class ActorService {
  async getActors(query?: ActorQuery): Promise<ThreatActor[]> {
    try {
      const actors = await prisma.threatActor.findMany({
        where: query,
      });
      return actors;
    } catch (error) {
      logger.error('Error fetching actors', error);
      throw error;
    }
  }

  async getActorById(id: string): Promise<ThreatActor | null> {
    try {
      const actor = await prisma.threatActor.findUnique({
        where: { id },
      });
      return actor;
    } catch (error) {
      logger.error(`Error fetching actor ${id}`, error);
      throw error;
    }
  }
}
```

## Troubleshooting

### Type Errors

**Problem**: `Property 'user' does not exist on type 'Request'`

**Solution**: Use type assertion or create a custom interface
```typescript
import { Request } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}
```

### Module Resolution

**Problem**: `Cannot find module './module'`

**Solution**: Add file extension or configure module resolution
```typescript
// Option 1: Add extension
import module from './module.js';

// Option 2: Update tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

### Prisma Client Types

**Problem**: `Module '@prisma/client' has no exported member 'MyModel'`

**Solution**: Regenerate Prisma Client
```bash
npm run prisma:generate
```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Express with TypeScript](https://github.com/microsoft/TypeScript-Node-Starter)
- [Prisma TypeScript Guide](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/generating-prisma-client)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## Support

For questions or issues related to TypeScript migration:
1. Check this guide first
2. Review existing TypeScript code in the repository
3. Consult the team's Slack channel
4. Open an issue on GitHub with the `typescript-migration` label

---

**Last Updated**: 2024
**Migration Progress**: ~5% (Infrastructure + Core Entry Point)
**Target Completion**: Systematic migration of all modules
