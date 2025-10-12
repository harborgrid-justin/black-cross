# Sequelize Repositories

Production-grade data access layer for Black-Cross platform using Sequelize ORM with PostgreSQL.

## Overview

This directory contains **type-safe repository classes** that provide a clean abstraction over Sequelize models. Each repository extends `BaseRepository<TModel>` and implements model-specific query methods.

## Architecture

```
Repository Layer (Data Access)
      ↓
Sequelize ORM
      ↓
PostgreSQL Database
```

## Available Repositories

### Core Repositories

1. **UserRepository** - User management and authentication
2. **IncidentRepository** - Security incident tracking
3. **VulnerabilityRepository** - CVE and vulnerability management  ✅ NEW
4. **AssetRepository** - IT asset inventory  ✅ NEW
5. **IOCRepository** - Indicators of Compromise  ✅ NEW
6. **ThreatActorRepository** - Threat actor intelligence  ✅ NEW
7. **AuditLogRepository** - Security audit trail  ✅ NEW
8. **PlaybookExecutionRepository** - Automation tracking  ✅ NEW

## BaseRepository Features

All repositories inherit these methods from `BaseRepository<TModel>`:

### Standard CRUD
```typescript
create(data: any): Promise<TModel>
findById(id: string): Promise<TModel | null>
findByIdOrThrow(id: string): Promise<TModel>
update(id: string, data: any): Promise<TModel>
delete(id: string): Promise<void>
```

### Query Operations
```typescript
findFirst(where: WhereOptions): Promise<TModel | null>
findMany(where: WhereOptions, options?: FindOptions): Promise<TModel[]>
list(filters: ListFilters): Promise<PaginatedResponse<TModel>>
count(where?: WhereOptions): Promise<number>
exists(id: string): Promise<boolean>
```

### Pagination
```typescript
interface ListFilters {
  page?: number;        // Page number (default: 1)
  pageSize?: number;    // Items per page (default: 20)
  sortBy?: string;      // Sort field (default: 'createdAt')
  sortOrder?: 'asc' | 'desc';  // Sort direction (default: 'desc')
  search?: string;      // Search query
  [key: string]: any;   // Additional filters
}

interface PaginatedResponse<T> {
  data: T[];           // Current page data
  total: number;       // Total items
  page: number;        // Current page
  pageSize: number;    // Items per page
  totalPages: number;  // Total pages
  hasNext: boolean;    // Has next page
  hasPrev: boolean;    // Has previous page
}
```

### Transactions
```typescript
transaction<T>(callback: (repo: this) => Promise<T>): Promise<T>
```

## Repository Details

### VulnerabilityRepository

**Purpose**: Manage CVE tracking and vulnerability lifecycle

**Key Methods**:
- `findByCveId(cveId: string)` - Find by CVE identifier
- `findBySeverity(severity: string)` - Filter by severity level
- `findByStatus(status: string)` - Filter by status
- `findOpen()` - Get open vulnerabilities
- `findCritical()` - Get critical vulnerabilities
- `findByAffectedSystem(systemId: string)` - By affected asset
- `updateStatus(id: string, status: string)` - Update status with auto-timestamps
- `getStatistics()` - Dashboard statistics

**Example**:
```typescript
import { vulnerabilityRepository } from '../repositories';

// Find critical vulnerabilities
const critical = await vulnerabilityRepository.findCritical();

// Update status to patched
await vulnerabilityRepository.updateStatus(id, 'patched');

// Get statistics
const stats = await vulnerabilityRepository.getStatistics();
// { total, open, patched, critical, high, medium, low }
```

### AssetRepository

**Purpose**: IT asset inventory and management

**Key Methods**:
- `findByType(type: string)` - Filter by asset type
- `findByCriticality(criticality: string)` - By criticality level
- `findCritical()` - High/critical assets
- `findByIpAddress(ip: string)` - Lookup by IP
- `findByHostname(hostname: string)` - Lookup by hostname
- `findByOwner(owner: string)` - By asset owner
- `findByLocation(location: string)` - By location
- `findByEnvironment(environment: string)` - By environment
- `findByTags(tags: string[])` - By tags
- `getStatistics()` - Asset statistics

**Example**:
```typescript
import { assetRepository } from '../repositories';

// Find by IP
const asset = await assetRepository.findByIpAddress('10.0.1.50');

// Get critical assets
const critical = await assetRepository.findCritical();

// Statistics
const stats = await assetRepository.getStatistics();
// { total, critical, high, medium, low, byType: {...} }
```

### IOCRepository

**Purpose**: Track Indicators of Compromise

**Key Methods**:
- `findByValue(value: string)` - Find IOC by value (hash, IP, domain)
- `findByType(type: string)` - Filter by IOC type
- `findBySeverity(severity: string)` - By severity
- `findActive()` - Active indicators only
- `findBySource(source: string)` - By threat feed source
- `findByTags(tags: string[])` - By classification tags
- `findRecent(days: number)` - Recently seen IOCs
- `findHighConfidence(threshold: number)` - High confidence IOCs
- `updateLastSeen(id: string)` - Update sighting timestamp
- `activate(id: string)` / `deactivate(id: string)` - Toggle status
- `getStatistics()` - IOC statistics

**Example**:
```typescript
import { iocRepository } from '../repositories';

// Check if IOC exists
const ioc = await iocRepository.findByValue('malicious-domain.com');

// Get recent high-confidence IOCs
const recent = await iocRepository.findRecent(7);
const highConf = await iocRepository.findHighConfidence(80);

// Deactivate stale IOC
await iocRepository.deactivate(id);
```

### ThreatActorRepository

**Purpose**: Threat actor intelligence and attribution

**Key Methods**:
- `findByName(name: string)` - Find by actor name
- `findByAlias(alias: string)` - Search by alias
- `findBySophistication(level: string)` - By sophistication level
- `findByMotivation(motivation: string)` - By motivation
- `findByCountry(country: string)` - By attribution
- `findRecentlyActive(days: number)` - Recent activity
- `findByTags(tags: string[])` - By classification
- `updateLastSeen(id: string)` - Update activity timestamp
- `getStatistics()` - Actor statistics

**Example**:
```typescript
import { threatActorRepository } from '../repositories';

// Find by name
const actor = await threatActorRepository.findByName('APT28');

// Recently active actors
const recent = await threatActorRepository.findRecentlyActive(30);

// Statistics by country
const stats = await threatActorRepository.getStatistics();
// { total, byCountry: {...}, bySophistication: {...}, recentlyActive }
```

### AuditLogRepository

**Purpose**: Security audit trail and compliance logging

**Key Methods**:
- `findByUserId(userId: string)` - User activity history
- `findByAction(action: string)` - Filter by action type
- `findByResource(resource: string)` - By resource type
- `findByResourceId(resourceId: string)` - By specific resource
- `findByIpAddress(ipAddress: string)` - By source IP
- `findRecent(hours: number)` - Recent activities
- `findByTimeRange(start: Date, end: Date)` - Time range query
- `findByUserAndAction(userId: string, action: string)` - Combined filter
- `findSuspiciousActivities(threshold: number, hours: number)` - Anomaly detection
- `getStatistics(hours: number)` - Audit metrics

**Example**:
```typescript
import { auditLogRepository } from '../repositories';

// Get user activity
const logs = await auditLogRepository.findByUserId(userId);

// Find suspicious activities (5+ failed attempts in 1 hour)
const suspicious = await auditLogRepository.findSuspiciousActivities(5, 1);
// { byUser: [...], byIp: [...] }

// Recent statistics
const stats = await auditLogRepository.getStatistics(24);
// { total, byAction: {...}, byResource: {...}, uniqueUsers, uniqueIps }
```

### PlaybookExecutionRepository

**Purpose**: Automation playbook execution tracking

**Key Methods**:
- `findByPlaybookId(playbookId: string)` - Execution history
- `findByStatus(status: string)` - By execution status
- `findRunning()` - Currently running executions
- `findFailed()` - Failed executions
- `findSuccessful()` - Successful executions
- `findByTriggeredBy(userId: string)` - By user
- `findRecent(hours: number)` - Recent executions
- `updateStatus(id, status, result?, error?)` - Update execution
- `completeSuccess(id: string, result?: any)` - Mark success
- `completeFailed(id: string, error: string)` - Mark failure
- `getStatistics()` - Execution metrics
- `getPlaybookStatistics(playbookId: string)` - Per-playbook stats

**Example**:
```typescript
import { playbookExecutionRepository } from '../repositories';

// Get running executions
const running = await playbookExecutionRepository.findRunning();

// Complete execution
await playbookExecutionRepository.completeSuccess(id, { actions: 5 });

// Get success rate
const stats = await playbookExecutionRepository.getStatistics();
// { total, pending, running, success, failed, averageDuration, successRate }
```

## Usage Patterns

### Simple CRUD
```typescript
import { vulnerabilityRepository } from '../repositories';

// Create
const vuln = await vulnerabilityRepository.create({
  title: 'Critical vulnerability',
  severity: 'critical',
  affectedSystems: ['sys-01'],
  discoveredAt: new Date(),
});

// Read
const found = await vulnerabilityRepository.findById(vuln.id);

// Update
const updated = await vulnerabilityRepository.update(vuln.id, {
  status: 'patched',
});

// Delete
await vulnerabilityRepository.delete(vuln.id);
```

### Pagination
```typescript
const result = await vulnerabilityRepository.list({
  page: 1,
  pageSize: 20,
  sortBy: 'cvssScore',
  sortOrder: 'desc',
  severity: 'critical',
  search: 'apache',
});

console.log(result.data);        // Current page items
console.log(result.total);       // Total matching items
console.log(result.totalPages);  // Total pages
console.log(result.hasNext);     // More pages available?
```

### Custom Queries
```typescript
// Repositories support custom where clauses
const critical = await vulnerabilityRepository.findMany({
  severity: 'critical',
  status: { [Op.in]: ['open', 'in_progress'] },
});

// With Sequelize operators
import { Op } from 'sequelize';

const recent = await auditLogRepository.findMany({
  timestamp: { [Op.gte]: new Date('2024-01-01') },
  action: { [Op.iLike]: '%delete%' },
});
```

### Transactions
```typescript
await vulnerabilityRepository.transaction(async (repo) => {
  const vuln = await repo.create(data);
  await auditLogRepository.create({
    userId,
    action: 'vulnerability.created',
    resourceId: vuln.id,
  });
  return vuln;
});
```

## Best Practices

### DO ✅
- Use repositories for all database operations
- Use `findByIdOrThrow()` when you expect a record to exist
- Use pagination for list operations
- Use transactions for multi-step operations
- Handle errors at the service/controller level
- Use TypeScript types from repository exports

### DON'T ❌
- Don't access Sequelize models directly from controllers
- Don't use `findById()` without null checking
- Don't fetch large datasets without pagination
- Don't mix Mongoose and Sequelize patterns
- Don't use `any` types, import proper types
- Don't put business logic in repositories

## Error Handling

Repositories throw standard JavaScript errors:

```typescript
try {
  const vuln = await vulnerabilityRepository.findByIdOrThrow(id);
  // Success
} catch (error) {
  if (error.message.includes('not found')) {
    // Handle not found
  } else {
    // Handle other errors
  }
}
```

## Type Safety

All repositories are fully typed:

```typescript
import type { Vulnerability } from '../repositories';

const vuln: Vulnerability = await vulnerabilityRepository.findByIdOrThrow(id);
const vulns: Vulnerability[] = await vulnerabilityRepository.findCritical();
```

## Performance Tips

1. **Use pagination** - Always paginate large result sets
2. **Use indexes** - Models have indexes on common query fields
3. **Avoid N+1** - Use `include` for relations when needed
4. **Use count wisely** - `count()` queries can be expensive
5. **Cache statistics** - Consider caching `getStatistics()` results

## Testing

Repositories are easy to test in isolation:

```typescript
// Mock repository for unit testing services
const mockRepo = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

// Integration testing with test database
describe('VulnerabilityRepository', () => {
  it('should create vulnerability', async () => {
    const vuln = await vulnerabilityRepository.create(testData);
    expect(vuln.id).toBeDefined();
  });
});
```

## Extending Repositories

To add custom methods:

```typescript
class VulnerabilityRepository extends BaseRepository<Vulnerability> {
  protected model = VulnerabilityModel;
  
  // Add custom method
  async findByCustomCriteria(criteria: any): Promise<Vulnerability[]> {
    return await this.model.findAll({
      where: { /* custom logic */ },
    });
  }
  
  // Override search logic
  protected override buildWhereClause(filters: any, search?: string): any {
    const where = super.buildWhereClause(filters, search);
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { cveId: { [Op.iLike]: `%${search}%` } },
      ];
    }
    
    return where;
  }
}
```

## Related Documentation

- **Models**: `/backend/models/README.md` - Sequelize model definitions
- **Services**: `/backend/services/README.md` - Business logic layer
- **Migration Guide**: `/backend/SEQUELIZE_MIGRATION_GUIDE.md` - How to migrate from MongoDB
- **Base Repository**: `/backend/utils/BaseRepository.ts` - Base class implementation
- **Summary**: `/backend/IMPLEMENTATION_SUMMARY.md` - Complete implementation overview

## Support

For questions or issues:
1. Check the Migration Guide for common patterns
2. Review existing repository implementations
3. Check BaseRepository for inherited methods
4. Refer to Sequelize docs: https://sequelize.org/docs/v6/

---

**Status**: ✅ Production Ready  
**Version**: 1.0  
**Last Updated**: October 2024
