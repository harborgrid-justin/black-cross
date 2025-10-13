# Production-Grade Services (Sequelize Pattern)

This directory contains production-grade service implementations that use the **Sequelize repository pattern** for PostgreSQL database operations.

## Overview

These services demonstrate the **correct architecture** for CRUD operations in Black-Cross:

```
Controller → Service → Repository → Sequelize Model → PostgreSQL
```

## Key Features

✅ **Type-Safe**: Full TypeScript support with explicit types  
✅ **Separation of Concerns**: Business logic separate from data access  
✅ **Testable**: Easy to mock repositories for unit testing  
✅ **Reusable**: Common operations in base repository  
✅ **Consistent**: All services follow same pattern  
✅ **Production-Ready**: Error handling, validation, and logging built-in  

## Architecture Layers

### 1. Models (`/backend/models/`)
Sequelize models with TypeScript decorators defining database schema:
```typescript
@Table({ tableName: 'vulnerabilities' })
export default class Vulnerability extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;
  // ...
}
```

### 2. Repositories (`/backend/repositories/`)
Data access layer extending `BaseRepository<T>`:
```typescript
class VulnerabilityRepository extends BaseRepository<Vulnerability> {
  protected model = VulnerabilityModel;
  
  async findBySeverity(severity: string): Promise<Vulnerability[]> {
    return await this.model.findAll({ where: { severity } });
  }
}
```

### 3. Services (`/backend/services/` - **THIS DIRECTORY**)
Business logic layer using repositories:
```typescript
export class VulnerabilityService {
  async create(data: CreateData): Promise<Vulnerability> {
    return await vulnerabilityRepository.create(data);
  }
  
  async patch(id: string): Promise<Vulnerability> {
    return await vulnerabilityRepository.updateStatus(id, 'patched');
  }
}
```

### 4. Controllers (in modules)
HTTP request handlers using services:
```typescript
async createVulnerability(req: Request, res: Response) {
  try {
    const vulnerability = await vulnerabilityService.create(req.body);
    res.status(201).json({ success: true, data: vulnerability });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}
```

## Available Services

### VulnerabilityService
Manages CVE tracking and vulnerability lifecycle:
- `create(data)` - Create new vulnerability
- `getById(id)` - Get vulnerability by ID
- `getByCveId(cveId)` - Find by CVE identifier
- `list(filters)` - Paginated list with filtering
- `listBySeverity(severity)` - Filter by severity level
- `listCritical()` - Get critical vulnerabilities
- `updateStatus(id, status)` - Update vulnerability status
- `patch(id)` - Mark as patched
- `getStatistics()` - Dashboard statistics

### AssetService
IT asset inventory and management:
- `create(data)` - Register new asset
- `getByIpAddress(ip)` - Find by IP address
- `getByHostname(hostname)` - Find by hostname
- `listByCriticality(level)` - Filter by criticality
- `listCritical()` - Get critical assets
- `getStatistics()` - Asset statistics by type/criticality

### IOCService
Indicators of Compromise tracking:
- `create(data)` - Create new IOC
- `getByValue(value)` - Find IOC by value (hash, IP, domain)
- `listByType(type)` - Filter by IOC type
- `listActive()` - Get active indicators
- `listHighConfidence(threshold)` - High-confidence IOCs
- `activate(id)` / `deactivate(id)` - Toggle IOC status
- `updateLastSeen(id)` - Update sighting timestamp

### ThreatActorService
Threat actor intelligence:
- `create(data)` - Add threat actor profile
- `getByName(name)` - Find by actor name
- `listByAlias(alias)` - Search by alias
- `listByCountry(country)` - Filter by attribution
- `listRecentlyActive(days)` - Recently observed actors
- `updateLastSeen(id)` - Update activity timestamp
- `getStatistics()` - Actor statistics

### AuditLogService
Security audit trail:
- `create(data)` - Create audit log entry
- `logAction(userId, action, resource)` - Convenience method
- `listByUserId(userId)` - User activity history
- `listByAction(action)` - Filter by action type
- `listRecent(hours)` - Recent activities
- `findSuspiciousActivities(threshold)` - Anomaly detection
- `getStatistics(hours)` - Audit metrics

### PlaybookExecutionService
Automation playbook tracking:
- `create(data)` - Log playbook execution
- `start(playbookId, triggeredBy)` - Start execution
- `updateStatus(id, status)` - Update execution status
- `completeSuccess(id, result)` - Mark as successful
- `completeFailed(id, error)` - Mark as failed
- `listRunning()` - Get running executions
- `getStatistics()` - Execution metrics
- `getPlaybookStatistics(playbookId)` - Per-playbook stats

## Usage Example

```typescript
import { vulnerabilityService } from '../services';

// In a controller
async function handleCreateVulnerability(req: Request, res: Response) {
  try {
    // Service handles business logic and validation
    const vulnerability = await vulnerabilityService.create({
      title: req.body.title,
      severity: req.body.severity,
      affectedSystems: req.body.affectedSystems,
      discoveredAt: new Date(),
    });
    
    res.status(201).json({
      success: true,
      data: vulnerability,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Paginated listing with filters
async function handleListVulnerabilities(req: Request, res: Response) {
  const { page, pageSize, severity, search } = req.query;
  
  const result = await vulnerabilityService.list({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
    severity,
    search,
  });
  
  res.json({
    success: true,
    ...result, // { data, total, page, pageSize, totalPages, hasNext, hasPrev }
  });
}
```

## Migration Guide

For existing modules using MongoDB (Mongoose):

### Before (MongoDB/Mongoose)
```typescript
// ❌ OLD PATTERN - MongoDB/Mongoose
import Vulnerability from '../models/Vulnerability'; // Mongoose model

class VulnerabilityService {
  async create(data: any) {
    const item = new Vulnerability(data);
    await item.save(); // Mongoose method
    return item;
  }
  
  async getById(id: string) {
    const item = await Vulnerability.findOne({ id }); // Mongoose query
    if (!item) throw new Error('Not found');
    return item;
  }
}
```

### After (PostgreSQL/Sequelize)
```typescript
// ✅ NEW PATTERN - PostgreSQL/Sequelize
import { vulnerabilityRepository } from '../repositories';
import type { Vulnerability } from '../repositories';

export class VulnerabilityService {
  async create(data: CreateData): Promise<Vulnerability> {
    return await vulnerabilityRepository.create(data);
  }
  
  async getById(id: string): Promise<Vulnerability> {
    return await vulnerabilityRepository.findByIdOrThrow(id);
  }
}
```

## Benefits of This Pattern

1. **Type Safety**: Full TypeScript support throughout the stack
2. **Testability**: Services can be tested with mocked repositories
3. **Consistency**: All CRUD operations follow same pattern
4. **Reusability**: Common queries in base repository
5. **Maintainability**: Clear separation of concerns
6. **Performance**: Optimized queries with Sequelize
7. **Transactions**: Built-in transaction support
8. **Relations**: Easy to define and query model relationships

## Next Steps

To migrate an existing module:

1. **Use the Sequelize model** from `/backend/models/` (if it exists)
2. **Import the repository** from `/backend/repositories/`
3. **Replace Mongoose calls** with repository methods:
   - `.save()` → `repository.create()` or `repository.update()`
   - `.findOne({ id })` → `repository.findById(id)`
   - `.find(filters)` → `repository.findMany(filters)`
   - `.deleteOne()` → `repository.delete(id)`
4. **Update types** to use Sequelize model types
5. **Test thoroughly** to ensure functionality preserved

## Best Practices

✅ Always use repositories, never access models directly from services  
✅ Use explicit TypeScript types for all parameters and returns  
✅ Handle errors with try-catch in controllers, let services throw  
✅ Use pagination for list operations  
✅ Implement business logic in services, not repositories  
✅ Use transactions for multi-step operations  
✅ Log important operations for audit trail  

## Support

For questions about this pattern, see:
- `/backend/repositories/README.md` - Repository documentation
- `/backend/utils/BaseRepository.ts` - Base repository implementation
- `/backend/models/README.md` - Model documentation
- `/backend/modules/example-typescript/` - TypeScript module example
