# Black-Cross: Enterprise Cyber Threat Intelligence Platform

Black-Cross is a comprehensive threat intelligence platform with 15+ core security modules. This guide provides essential knowledge for AI agents working on the codebase.

## Architecture Overview

**Stack**: React 18 + TypeScript (frontend), Node.js + Express + TypeScript (backend), PostgreSQL + Redis + Elasticsearch  
**Pattern**: Service-oriented architecture with strict separation of concerns  
**Database ORM**: Sequelize (primary), with MongoDB support for specific modules

### Project Structure
```
black-cross/
├── frontend/          # React + Vite + Material-UI
├── backend/           # Node.js + Express + TypeScript
│   ├── models/        # Sequelize ORM models
│   ├── repositories/  # Data access layer
│   ├── services/      # Business logic layer
│   ├── modules/       # 20+ feature modules
│   ├── middleware/    # Auth, validation, error handling
│   └── config/        # Centralized configuration
└── docker-compose.yml # Full stack orchestration
```

## Essential Developer Workflows

### Quick Start Commands
```bash
# One-time setup
npm run setup && docker-compose up -d postgres

# Development (most common)
npm run dev              # Both frontend:3000 + backend:8080
npm run db:sync          # Sync Sequelize models (auto-creates tables)

# Testing
npm run test:backend     # Jest unit tests
npm run cypress          # E2E tests (25 comprehensive files, 2,260+ tests)
```

### Database Operations
- **Always use `npm run db:sync`** - Sequelize auto-creates/updates tables (no migrations)
- Models in `backend/models/` define schema, exported via `backend/models/index.ts`
- Configuration in `backend/config/sequelize.ts` with environment-based settings

## Module Architecture Pattern

Every module follows this strict 4-layer pattern with complete directory structure:

```
module-name/
├── index.ts              # Entry point with health checks
├── routes/               # API endpoint definitions
│   └── {name}Routes.ts
├── controllers/          # HTTP request handlers
│   └── {name}Controller.ts
├── services/             # Business logic layer
│   ├── {name}Service.ts
│   ├── enrichmentService.ts
│   └── correlationService.ts
├── models/               # Data models (if module-specific)
├── validators/           # Input validation schemas
│   └── {name}Validator.ts
├── types.ts              # TypeScript type definitions
├── utils/                # Module utilities
└── README.md             # Module documentation
```

### 1. Entry Point (`modules/{name}/index.ts`)
```typescript
// Health check + route mounting
router.get('/health', (req, res) => {
  res.json({ 
    module: 'name', 
    status: 'operational',
    version: '1.0.0',
    subFeatures: ['collection', 'analysis', 'enrichment'] 
  });
});
router.use('/', moduleRoutes);
```

### 2. Routes (`routes/{name}Routes.ts`)
```typescript
// RESTful endpoints with Joi validation
router.get('/', controller.list);
router.post('/', validate({ body: createSchema }), controller.create);
router.get('/:id', controller.getById);
router.put('/:id', validate({ body: updateSchema }), controller.update);
router.delete('/:id', controller.delete);
// Domain-specific routes
router.post('/:id/enrich', controller.enrich);
router.post('/correlate', controller.correlate);
```

### 3. Controllers (`controllers/{name}Controller.ts`)
```typescript
// HTTP request/response handling with domain context
async list(req, res) {
  try {
    const filters = this.parseFilters(req.query);
    const data = await service.list(filters);
    res.json({ success: true, data, total: data.length });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

async enrich(req, res) {
  try {
    const enriched = await enrichmentService.enrichThreat(req.params.id);
    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

### 4. Services (`services/{name}Service.ts`)
```typescript
// Business logic with threat intelligence context
class ThreatService {
  async create(data) {
    // Validate indicators
    const validatedIoCs = await this.validateIndicators(data.indicators);
    
    // Auto-categorize based on patterns
    const categories = await categorizationService.categorize(data);
    
    // Create with enrichment
    const threat = await repository.create({...data, categories});
    
    // Queue for correlation analysis
    await correlationService.queueCorrelation(threat.id);
    
    return threat;
  }
}
```

## Critical Conventions

### Authentication & Security
- **JWT-based auth** with token blacklist support (`middleware/auth.ts`)
- **Role-based access control**: Admin, Analyst, Viewer roles
- **All API routes protected** except `/auth/login` and health checks
- **CSRF protection** via `csurf` middleware

### API Standards
- **Base path**: `/api/v1/{module-name}`
- **Response format**: `{ success: boolean, data?: any, error?: string }`
- **Validation**: Joi schemas in `validators/` directories
- **Error handling**: Centralized in `middleware/errorHandler.ts`

### TypeScript Migration Pattern
- **Backend migrating to TypeScript** - use `.ts` for new files
- **Type-safe patterns** in `modules/example-typescript/` 
- **Import types**: `import type { Router } from 'express'`
- **Strict interfaces** for request/response objects

### Testing Patterns
- **Backend**: Jest with coverage thresholds (5% minimum, aiming for 80%)
- **E2E**: Cypress with 25 test files covering all modules
- **Test structure**: Describe blocks with numbered tests
- **Data fixtures**: Use `cypress/fixtures/` for consistent test data

## Key Integration Points

### Frontend-Backend Communication
- **API Client**: `frontend/src/services/api/` with consistent patterns
- **State Management**: Redux Toolkit with async thunks
- **Real-time**: Socket.IO for live updates
- **Error Boundaries**: React error boundaries with user-friendly messages

### External Dependencies
- **Database**: Auto-sync on startup, no manual migrations needed  
- **Search**: Elasticsearch integration optional (feature-flagged)
- **Message Queue**: RabbitMQ for background tasks
- **Caching**: Redis for session management and API caching

### Configuration Management
- **Environment**: `.env` files with validation in `config/index.ts`
- **Feature Flags**: Enable/disable modules without code changes
- **Logging**: Winston with structured logging and correlation IDs

## Threat Intelligence Domain Patterns

### Core Data Models & Relationships
```typescript
// IOC Types: ip, domain, url, hash, email, filename, registry, mutex
// Confidence Levels: 0-100 (50 default)
// Severity Levels: critical, high, medium, low, info
// Status Values: active, expired, false_positive, whitelisted, reviewing

interface Threat {
  indicators: IoC[];           // Associated IOCs
  categories: string[];        // MITRE ATT&CK, Kill Chain phases
  relationships: Relationship[]; // Related threats, campaigns
  enrichment: EnrichmentData;  // External source data
}

interface ThreatActor {
  ttps: string[];             // Tactics, Techniques, Procedures
  campaigns: string[];        // Associated campaigns
  sophistication: 'low' | 'medium' | 'high' | 'advanced';
  motivation: string[];       // Financial, espionage, etc.
}
```

### Intelligence Enrichment Pipeline
- **Auto-categorization**: Based on indicators and threat patterns
- **Correlation analysis**: Multi-factor threat relationship scoring
- **STIX/TAXII integration**: Standard threat intelligence exchange
- **MITRE ATT&CK mapping**: Technique and tactic attribution
- **Confidence scoring**: Source reliability and indicator validation

### Critical Domain Services
- **EnrichmentService**: External source integration, context addition
- **CorrelationService**: IOC overlap analysis, temporal correlation
- **CategorizationService**: Auto-tagging, taxonomy management
- **ValidationService**: IOC format validation, whitelist checking

## Development Gotchas

1. **Module Registration**: New modules must be added to `backend/index.ts` route registration
2. **IOC Validation**: Use domain-specific validators in `validators/{name}Validator.ts`
3. **Confidence Scoring**: Always validate 0-100 range, default to 50
4. **STIX Compliance**: Use `modules/stix/converter.ts` for standard format conversion  
5. **Correlation Queuing**: Enrich/correlate operations are async - use proper error handling
6. **File Structure**: Follow exact naming conventions - controllers end in `Controller.ts`
7. **Error Responses**: Always use `{ success: false, error: string }` format for consistency

## Debugging Essentials

- **Logs**: Check `logs/` directory for structured application logs
- **Database**: PostgreSQL connection via `backend/scripts/test-connection.ts`
- **API Testing**: Swagger UI at `/api/v1/docs` for interactive testing
- **Health Checks**: Each module exposes `/health` endpoint with subFeatures array
- **IOC Testing**: Use `backend/scripts/test-ioc-validation.ts` for indicator validation
- **Development Tools**: VSCode workspace with TypeScript strict mode enabled