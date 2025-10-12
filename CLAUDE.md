# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Black-Cross is an enterprise-grade cyber threat intelligence platform built with:
- **Frontend**: React 18 + TypeScript + Vite + Material-UI
- **Backend**: Node.js + Express + TypeScript (gradual migration from JavaScript)
- **Database**: PostgreSQL (via Sequelize ORM) + MongoDB (optional) + Redis + Elasticsearch
- **Testing**: Cypress (E2E), Jest (backend unit tests)

The platform provides 15 core security features including threat intelligence, incident response, vulnerability management, SIEM, and more.

## Essential Commands

### Development Workflow
```bash
# Quick start (PostgreSQL required, other services optional)
npm run setup                    # One-time setup with environment files
docker-compose up -d postgres    # Start PostgreSQL
npm run db:sync                 # Sync database models with Sequelize
npm run dev                     # Start both frontend (3000) and backend (8080)

# Alternative: Start services individually
npm run dev:backend             # Backend only on port 8080
npm run dev:frontend            # Frontend only on port 3000

# Full Docker environment (all services)
docker-compose up -d            # Start all services (PostgreSQL, MongoDB, Redis, Elasticsearch, RabbitMQ)
```

### Database Operations
```bash
# Sequelize commands (run from root)
npm run db:sync                 # Sync database models with Sequelize

# Direct backend commands
cd backend
npm run db:sync                 # Same as above, from backend directory
npm run create-admin            # Create admin user
```

### Testing
```bash
# Backend tests
npm run test:backend            # Run Jest unit/integration tests
cd backend && npm test

# Frontend E2E tests (25 comprehensive test files)
npm run test:e2e                # Run all Cypress tests headless
npm run cypress                 # Open Cypress GUI
npm run cypress:headless        # Run Cypress headless
cd frontend && npm run test:e2e # Run from frontend directory
```

### Build and Lint
```bash
npm run build                   # Build both frontend and backend
npm run build:backend           # Backend TypeScript compilation
npm run build:frontend          # Frontend Vite build

npm run lint                    # Lint both projects
npm run lint:backend            # ESLint for backend
npm run lint:frontend           # ESLint for frontend
cd backend && npm run type-check # TypeScript type checking
```

### Production
```bash
# Build and start production
cd frontend && npm run build    # Build frontend
cd backend && npm start         # Start backend (uses compiled JS)
```

## Architecture

### Backend Module System

The backend uses a **modular architecture** with 15 feature modules in `backend/modules/`:

**TypeScript Modules** (new standard):
- `example-typescript/` - Reference implementation demonstrating TypeScript best practices
- `threat-intelligence/` - Migrated to TypeScript

**JavaScript Modules** (legacy, being migrated):
- `incident-response/`, `threat-hunting/`, `vulnerability-management/`
- `siem/`, `threat-actors/`, `ioc-management/`, `threat-feeds/`
- `risk-assessment/`, `collaboration/`, `reporting/`
- `malware-analysis/`, `dark-web/`, `compliance/`, `automation/`

**Module Structure Pattern** (see `example-typescript/`):
```
module-name/
├── index.ts          # Router with Express routes
├── controller.ts     # Request handlers with explicit types
├── service.ts        # Business logic layer
├── types.ts          # TypeScript type definitions
└── README.md         # Module documentation
```

### Key Backend Files

- `backend/index.ts` - Main entry point, registers all module routes at `/api/v1/*`
- `backend/config/database.ts` - Centralized database manager (MongoDB is optional)
- `backend/config/index.ts` - Configuration management
- `backend/middleware/` - Express middleware (TypeScript migrated)
  - `errorHandler.ts`, `requestLogger.ts`, `validator.ts`, `rateLimiter.ts`, `correlationId.ts`

### Database Architecture

**Sequelize Models** (`backend/models/`):
- PostgreSQL as primary relational database
- Core models: User, Incident, Vulnerability, Asset, AuditLog, IOC, ThreatActor, PlaybookExecution
- TypeScript classes with decorators using sequelize-typescript
- Model definitions in `backend/models/*.ts`

**MongoDB** (optional):
- Used for unstructured data, logs, and real-time events
- Managed via Mongoose in `backend/config/database.ts`
- Application continues without MongoDB if unavailable

### Frontend Architecture

**Location**: `frontend/src/`

**Structure**:
- `components/` - Reusable UI components
  - `layout/Layout.tsx` - Main application layout
  - `auth/` - Authentication components (Login, PrivateRoute)
- `pages/` - Feature-specific pages (one per security module)
  - Each module has dedicated page(s): `threat-intelligence/`, `incident-response/`, etc.
- `store/` - Redux Toolkit state management
- `api/` - Axios API client configuration

**Tech Stack**:
- React 18 with TypeScript
- Material-UI (@mui/material) for components
- Redux Toolkit for state
- React Router for navigation
- React Hook Form + Zod for form validation
- Vite for build tooling

### TypeScript Migration Strategy

The codebase is **gradually migrating from JavaScript to TypeScript**:

1. **New modules**: Write in TypeScript using `example-typescript/` as reference
2. **Type annotations**: Use explicit types for all function signatures and return values
3. **Type safety**: Leverage discriminated unions, type guards, and strict null checks
4. **Backward compatibility**: JavaScript modules work alongside TypeScript during transition
5. **TSConfig**: Shared `tsconfig.json` at root with strict mode enabled

**Migration Pattern**:
- Convert module files one at a time (routes → controller → service → types)
- Use `import type` for type-only imports
- Enable `strict: true` compiler options
- Follow Google TypeScript style guide

## Development Notes

### Environment Setup

**Required**: PostgreSQL database
**Optional**: MongoDB, Redis, Elasticsearch, RabbitMQ

Environment files:
- `backend/.env` - Backend configuration (copy from `.env.example`)
- `frontend/.env` - Frontend configuration

Database connection:
```
DATABASE_URL=postgresql://blackcross:blackcross_secure_password@localhost:5432/blackcross?schema=public
```

### API Endpoints

All backend routes are prefixed with `/api/v1/`:
- `/api/v1/example` - Example TypeScript module
- `/api/v1/threat-intelligence` - Threat data management
- `/api/v1/incidents` - Incident response
- `/api/v1/vulnerabilities` - Vulnerability tracking
- `/api/v1/iocs` - Indicators of Compromise
- `/api/v1/threat-actors` - Threat actor profiles
- (Additional endpoints for other 10 modules)

Health check: `GET /health`

### Testing Strategy

**Cypress E2E Tests** (`frontend/cypress/e2e/`):
- 25 comprehensive test files covering all features
- Run with `npm run cypress` (GUI) or `npm run test:e2e` (headless)
- Test files match module structure

**Jest Backend Tests**:
- Unit and integration tests
- Run with `npm run test:backend`

### Docker Services

When running `docker-compose up -d`:
- **postgres** - Port 5432 (required)
- **mongodb** - Port 27017 (optional)
- **redis** - Port 6379 (optional)
- **elasticsearch** - Ports 9200, 9300 (optional)
- **rabbitmq** - Ports 5672 (AMQP), 15672 (management UI) (optional)

### Code Quality Standards

- **TypeScript**: Strict mode with explicit type annotations
- **ESLint**: Airbnb base config for backend, React config for frontend
- **Formatting**: Consistent indentation and naming conventions
- **Error Handling**: All async functions use try-catch with typed error responses
- **Validation**: Use Joi (backend) or Zod (frontend) for input validation
- **Documentation**: JSDoc comments for all public functions

### Common Patterns

**Backend Controller Pattern**:
```typescript
export async function handlerName(req: Request, res: Response): Promise<void> {
  try {
    // 1. Parse and validate input
    // 2. Call service layer
    // 3. Return typed response
    res.json({ success: true, data });
  } catch (error: unknown) {
    // Handle error with type guard
    res.status(500).json({ success: false, error: message });
  }
}
```

**Service Layer Pattern**:
- Business logic separate from HTTP concerns
- Returns typed data or throws errors
- No direct request/response handling

**Type Safety**:
- Use type guards (`isError(error): error is Error`)
- Discriminated unions for response types
- No `any` types unless absolutely necessary
