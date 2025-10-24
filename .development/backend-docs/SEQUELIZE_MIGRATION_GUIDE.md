# Sequelize Migration Guide

## Overview

This guide helps migrate existing module services from **MongoDB (Mongoose)** to **PostgreSQL (Sequelize)** pattern.

## The Problem

Current state:
- ✅ Main Sequelize models exist in `/backend/models/` for PostgreSQL
- ❌ Module services in `/backend/modules/*/services/` use MongoDB/Mongoose
- ❌ Mismatch causes services to fail with PostgreSQL database

## The Solution

Use the new production-grade pattern:
```
Controller → Service → Repository → Sequelize Model → PostgreSQL
```

## Quick Migration Steps

### 1. Identify Available Resources

Check if a Sequelize model exists in `/backend/models/`:
- ✅ **Vulnerability** - Use `VulnerabilityService`
- ✅ **Asset** - Use `AssetService`
- ✅ **IOC** - Use `IOCService`
- ✅ **ThreatActor** - Use `ThreatActorService`
- ✅ **AuditLog** - Use `AuditLogService`
- ✅ **PlaybookExecution** - Use `PlaybookExecutionService`
- ✅ **User** - Use `UserRepository` directly
- ✅ **Incident** - Use `IncidentRepository` directly

### 2. Update Module Service

#### Before (MongoDB/Mongoose)
```typescript
// backend/modules/vulnerability-management/services/vulnerabilityService.ts
import Vulnerability from '../models/Vulnerability'; // ❌ Mongoose model
import logger from '../utils/logger';

class VulnerabilityService {
  async create(data: any) {
    const item = new Vulnerability(data);
    await item.save(); // ❌ Mongoose method
    logger.info(`Item created: ${item.id}`);
    return item;
  }

  async getById(id: string) {
    const item = await Vulnerability.findOne({ id }); // ❌ Mongoose query
    if (!item) throw new Error('Vulnerability not found');
    return item;
  }

  async list(filters: Record<string, any> = {}) {
    return Vulnerability.find(filters).sort('-created_at'); // ❌ Mongoose query
  }

  async update(id: string, updates: any) {
    const item = await this.getById(id);
    Object.assign(item, updates);
    await item.save(); // ❌ Mongoose method
    return item;
  }

  async delete(id: string) {
    const item = await this.getById(id);
    await item.deleteOne(); // ❌ Mongoose method
    return { deleted: true, id };
  }
}

export default new VulnerabilityService();
```

#### After (PostgreSQL/Sequelize) - Option 1: Use Central Service
```typescript
// backend/modules/vulnerability-management/services/vulnerabilityService.ts
// ✅ Simply re-export the central service
export { vulnerabilityService as default } from '../../../services';
export * from '../../../services/VulnerabilityService';
```

#### After (PostgreSQL/Sequelize) - Option 2: Wrap Central Service
```typescript
// backend/modules/vulnerability-management/services/vulnerabilityService.ts
import { vulnerabilityService } from '../../../services'; // ✅ Use central service
import logger from '../utils/logger';

class VulnerabilityService {
  async create(data: any) {
    const item = await vulnerabilityService.create(data); // ✅ Sequelize via repository
    logger.info(`Vulnerability created: ${item.id}`);
    return item;
  }

  async getById(id: string) {
    return await vulnerabilityService.getById(id); // ✅ Throws if not found
  }

  async list(filters: Record<string, any> = {}) {
    const result = await vulnerabilityService.list(filters); // ✅ Paginated
    return result.data; // Return just data array for backward compatibility
  }

  async update(id: string, updates: any) {
    return await vulnerabilityService.update(id, updates); // ✅ Sequelize update
  }

  async delete(id: string) {
    await vulnerabilityService.delete(id); // ✅ Sequelize delete
    return { deleted: true, id };
  }
}

export default new VulnerabilityService();
```

#### After (PostgreSQL/Sequelize) - Option 3: Use Repository Directly
```typescript
// backend/modules/vulnerability-management/services/vulnerabilityService.ts
import { vulnerabilityRepository } from '../../../repositories'; // ✅ Use repository
import type { Vulnerability } from '../../../repositories';
import logger from '../utils/logger';

class VulnerabilityService {
  async create(data: any): Promise<Vulnerability> {
    const item = await vulnerabilityRepository.create(data); // ✅ Sequelize create
    logger.info(`Vulnerability created: ${item.id}`);
    return item;
  }

  async getById(id: string): Promise<Vulnerability> {
    return await vulnerabilityRepository.findByIdOrThrow(id); // ✅ Auto-throws
  }

  async list(filters: Record<string, any> = {}): Promise<Vulnerability[]> {
    return await vulnerabilityRepository.findMany(filters); // ✅ Find all matching
  }

  async update(id: string, updates: any): Promise<Vulnerability> {
    return await vulnerabilityRepository.update(id, updates); // ✅ Update
  }

  async delete(id: string) {
    await vulnerabilityRepository.delete(id); // ✅ Delete
    return { deleted: true, id };
  }
}

export default new VulnerabilityService();
```

## Method Mapping

### Mongoose → Sequelize Repository

| Mongoose Method | Sequelize Repository Method |
|----------------|------------------------------|
| `new Model(data)` + `.save()` | `repository.create(data)` |
| `Model.findOne({ id })` | `repository.findById(id)` or `repository.findByIdOrThrow(id)` |
| `Model.find(filters)` | `repository.findMany(filters)` or `repository.list(filters)` |
| `Model.findByIdAndUpdate()` | `repository.update(id, data)` |
| `item.save()` | `item.update(data)` (on instance) or `repository.update(id, data)` |
| `item.deleteOne()` | `repository.delete(id)` |
| `Model.count(filters)` | `repository.count(filters)` |
| `Model.find().sort('-created_at')` | `repository.list({ sortBy: 'createdAt', sortOrder: 'desc' })` |

### Query Filters

| Mongoose | Sequelize (via Repository) |
|----------|---------------------------|
| `{ status: 'open' }` | `{ status: 'open' }` (same) |
| `{ severity: { $in: ['high', 'critical'] } }` | Use custom repo method or `{ severity: { [Op.in]: ['high', 'critical'] } }` |
| `.sort('-created_at')` | `list({ sortBy: 'createdAt', sortOrder: 'desc' })` |
| `.limit(10)` | `list({ pageSize: 10 })` |

## Controller Updates

If controllers directly use MongoDB models, update them to use services:

### Before
```typescript
import Vulnerability from '../models/Vulnerability';

async create(req: Request, res: Response) {
  try {
    const vuln = new Vulnerability(req.body);
    await vuln.save();
    res.status(201).json(vuln);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
```

### After
```typescript
import { vulnerabilityService } from '../../../services';

async create(req: Request, res: Response) {
  try {
    const vuln = await vulnerabilityService.create(req.body);
    res.status(201).json({ success: true, data: vuln });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}
```

## Migration Checklist

For each module service:

- [ ] Identify if Sequelize model exists in `/backend/models/`
- [ ] Check if service/repository exists in `/backend/services/` or `/backend/repositories/`
- [ ] Update imports from Mongoose models to Sequelize services/repositories
- [ ] Replace `.save()` with `repository.create()` or `.update()`
- [ ] Replace `.findOne()` with `repository.findById()`
- [ ] Replace `.find()` with `repository.findMany()` or `repository.list()`
- [ ] Replace `.deleteOne()` with `repository.delete()`
- [ ] Update types from `any` to specific Sequelize model types
- [ ] Test all CRUD operations
- [ ] Update related controllers if needed

## Module-by-Module Status

### High Priority (Sequelize Models Available)

1. **vulnerability-management** ✅
   - Model: `/backend/models/Vulnerability.ts`
   - Service: `/backend/services/VulnerabilityService.ts`
   - Repository: `/backend/repositories/VulnerabilityRepository.ts`

2. **ioc-management** ✅
   - Model: `/backend/models/IOC.ts`
   - Service: `/backend/services/IOCService.ts`
   - Repository: `/backend/repositories/IOCRepository.ts`

3. **threat-actors** ✅
   - Model: `/backend/models/ThreatActor.ts`
   - Service: `/backend/services/ThreatActorService.ts`
   - Repository: `/backend/repositories/ThreatActorRepository.ts`

4. **automation** (PlaybookExecution only) ✅
   - Model: `/backend/models/PlaybookExecution.ts`
   - Service: `/backend/services/PlaybookExecutionService.ts`
   - Repository: `/backend/repositories/PlaybookExecutionRepository.ts`

### Medium Priority (Need Custom Implementation)

5. **siem** - No Sequelize model yet
6. **compliance** - No Sequelize model yet
7. **reporting** - No Sequelize model yet
8. **threat-hunting** - No Sequelize model yet
9. **threat-feeds** - No Sequelize model yet
10. **incident-response** - Partially done (Incident model exists)
11. **risk-assessment** - No Sequelize model yet
12. **collaboration** - No Sequelize model yet
13. **malware-analysis** - No Sequelize model yet
14. **dark-web** - No Sequelize model yet

## Creating New Models

If a Sequelize model doesn't exist, follow this pattern:

```typescript
// backend/models/Report.ts
import {
  Table, Column, Model, DataType, PrimaryKey, Default, AllowNull,
  CreatedAt, UpdatedAt, Index,
} from 'sequelize-typescript';

@Table({
  tableName: 'reports',
  underscored: true,
  timestamps: true,
})
export default class Report extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.TEXT)
  content?: string;

  @CreatedAt
  @Column({ type: DataType.DATE, field: 'created_at' })
  createdAt!: Date;

  @UpdatedAt
  @Column({ type: DataType.DATE, field: 'updated_at' })
  updatedAt!: Date;
}
```

Then create repository and service following existing patterns.

## Testing

After migration, test each endpoint:

```bash
# Create
curl -X POST http://localhost:8080/api/v1/vulnerabilities \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","severity":"high","affectedSystems":[],"discoveredAt":"2024-01-01"}'

# Read
curl http://localhost:8080/api/v1/vulnerabilities/:id

# List
curl http://localhost:8080/api/v1/vulnerabilities?page=1&pageSize=10

# Update
curl -X PUT http://localhost:8080/api/v1/vulnerabilities/:id \
  -H "Content-Type: application/json" \
  -d '{"status":"patched"}'

# Delete
curl -X DELETE http://localhost:8080/api/v1/vulnerabilities/:id
```

## Common Issues

### Issue 1: "Model.findOne is not a function"
**Cause**: Using Mongoose methods on Sequelize model  
**Fix**: Use repository methods instead

### Issue 2: "Cannot read property 'save' of undefined"
**Cause**: Trying to call `.save()` on Sequelize model  
**Fix**: Use `repository.create()` or `repository.update()`

### Issue 3: Type errors with `any`
**Cause**: Not using TypeScript types  
**Fix**: Import types from repositories: `import type { Vulnerability } from '../repositories'`

### Issue 4: Pagination not working
**Cause**: Using `.find()` instead of `.list()`  
**Fix**: Use `repository.list({ page, pageSize })` for pagination

## Best Practices

1. ✅ **Always use services/repositories** - Never access models directly from controllers
2. ✅ **Use explicit types** - Import model types for type safety
3. ✅ **Handle errors properly** - Let services throw, catch in controllers
4. ✅ **Use pagination** - For list operations, use `.list()` with filters
5. ✅ **Validate input** - Before passing to service/repository
6. ✅ **Log important operations** - For debugging and audit trail
7. ✅ **Use transactions** - For multi-step operations

## Resources

- `/backend/services/README.md` - Service documentation
- `/backend/repositories/` - Repository implementations
- `/backend/models/README.md` - Model documentation
- `/backend/utils/BaseRepository.ts` - Base repository pattern
- `/backend/modules/example-typescript/` - TypeScript example module

## Support

For questions or issues:
1. Check existing implementations in `/backend/services/`
2. Review BaseRepository methods in `/backend/utils/BaseRepository.ts`
3. Refer to Sequelize documentation: https://sequelize.org/docs/v6/
