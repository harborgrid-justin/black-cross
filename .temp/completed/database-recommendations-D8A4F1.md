# Database Architecture Recommendations - Black-Cross

**Analysis ID**: D8A4F1
**Date**: 2025-10-24
**Agent**: Database Architect

---

## 1. Immediate Actions (This Week)

### 1.1 Add Soft Delete Support to Core Models

**Priority**: HIGH
**Effort**: 2-3 hours per model
**Impact**: Prevents accidental data loss, maintains referential integrity

**Models Requiring Soft Delete**:
1. Incident
2. Vulnerability
3. Asset
4. ThreatActor
5. AuditLog (make immutable - prevent deletion entirely)

**Implementation Pattern**:

```typescript
// Add to model
@Default(true)
@AllowNull(false)
@Column({
  type: DataType.BOOLEAN,
  field: 'is_active',
})
isActive!: boolean;

@Column({
  type: DataType.DATE,
  field: 'deleted_at',
})
deletedAt?: Date;
```

**Service Layer Changes**:
```typescript
// Soft delete method
async softDelete(id: string): Promise<boolean> {
  const entity = await Model.findByPk(id);
  if (!entity) return false;

  await entity.update({
    isActive: false,
    deletedAt: new Date(),
  });
  return true;
}

// Update list queries to exclude deleted
async list(filters: any): Promise<Model[]> {
  return Model.findAll({
    where: {
      isActive: true,
      ...filters
    }
  });
}
```

**Migration Script**:
```sql
-- Add columns (run for each table)
ALTER TABLE incidents ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE incidents ADD COLUMN deleted_at TIMESTAMP;

ALTER TABLE vulnerabilities ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE vulnerabilities ADD COLUMN deleted_at TIMESTAMP;

ALTER TABLE assets ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE assets ADD COLUMN deleted_at TIMESTAMP;

ALTER TABLE threat_actors ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE threat_actors ADD COLUMN deleted_at TIMESTAMP;

-- Make AuditLog immutable (prevent deletions)
REVOKE DELETE ON TABLE audit_logs FROM blackcross_app_user;
```

**Testing Requirements**:
- Verify soft deleted records are excluded from list queries
- Test that relationships still resolve (e.g., User → Incidents)
- Ensure restore functionality works (set isActive=true, deletedAt=null)
- Add E2E tests for delete operations

---

### 1.2 Complete Missing CRUD Operations

**Priority**: HIGH
**Effort**: 4-6 hours total

#### Threat Hunting Module

**Missing**: UPDATE and DELETE for hunt sessions

**Implementation**:

```typescript
// backend/modules/threat-hunting/routes/huntRoutes.ts
router.put('/sessions/:id', validate({
  params: commonSchemas.objectId,
  body: huntSessionUpdateSchema,
}), huntController.updateSession);

router.delete('/sessions/:id', validate({
  params: commonSchemas.objectId
}), huntController.deleteSession);

// backend/modules/threat-hunting/controllers/huntController.ts
async updateSession(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const session = await huntingService.updateSession(id, updates);
    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

async deleteSession(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await huntingService.deleteSession(id);

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// backend/modules/threat-hunting/services/huntingService.ts
async updateSession(id: string, updates: Partial<HuntSession>): Promise<HuntSession | null> {
  const session = await HuntSession.findById(id);
  if (!session) return null;

  Object.assign(session, updates);
  await session.save();
  return session;
}

async deleteSession(id: string): Promise<boolean> {
  const result = await HuntSession.findByIdAndDelete(id);
  return result !== null;
}

// backend/modules/threat-hunting/validators/huntValidator.ts
export const huntSessionUpdateSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  status: Joi.string().valid('active', 'completed', 'suspended').optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});
```

#### Risk Assessment Module

**Missing**: DELETE operations for risk models

**Implementation**:

```typescript
// backend/modules/risk-assessment/routes/riskRoutes.ts
router.delete('/models/:id', riskController.deleteModel);

// backend/modules/risk-assessment/controllers/riskController.ts
async deleteModel(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await riskService.deleteModel(id);

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Model not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
```

---

### 1.3 Add Critical Missing Indexes

**Priority**: HIGH
**Effort**: 30 minutes
**Impact**: Significant query performance improvement

**SQL Script**:

```sql
-- User indexes for common queries
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_last_login ON users(last_login) WHERE is_active = TRUE;
CREATE INDEX idx_users_role ON users(role) WHERE is_active = TRUE;

-- Incident indexes for reporting
CREATE INDEX idx_incidents_category ON incidents(category);
CREATE INDEX idx_incidents_detected_at ON incidents(detected_at);
CREATE INDEX idx_incidents_resolved_at ON incidents(resolved_at) WHERE resolved_at IS NOT NULL;
CREATE INDEX idx_incidents_priority_status ON incidents(priority, status);

-- Asset indexes for filtering
CREATE INDEX idx_assets_environment ON assets(environment);
CREATE INDEX idx_assets_owner ON assets(owner);
CREATE INDEX idx_assets_tags ON assets USING GIN(tags);

-- ThreatActor indexes
CREATE INDEX idx_threat_actors_country ON threat_actors(country);
CREATE INDEX idx_threat_actors_first_seen ON threat_actors(first_seen);
CREATE INDEX idx_threat_actors_tags ON threat_actors USING GIN(tags);

-- Vulnerability indexes
CREATE INDEX idx_vulnerabilities_cvss_score ON vulnerabilities(cvss_score) WHERE cvss_score IS NOT NULL;
CREATE INDEX idx_vulnerabilities_published_at ON vulnerabilities(published_at);
CREATE INDEX idx_vulnerabilities_patched_at ON vulnerabilities(patched_at) WHERE patched_at IS NOT NULL;

-- IOC indexes for threat hunting
CREATE INDEX idx_iocs_source ON iocs(source);
CREATE INDEX idx_iocs_first_seen ON iocs(first_seen);
CREATE INDEX idx_iocs_last_seen ON iocs(last_seen);
CREATE INDEX idx_iocs_tags ON iocs USING GIN(tags);

-- Composite indexes for common queries
CREATE INDEX idx_incidents_assigned_status ON incidents(assigned_to_id, status);
CREATE INDEX idx_vulnerabilities_severity_status ON vulnerabilities(severity, status);
```

**Sequelize Model Updates**:

```typescript
// Update model decorators to match
@Table({
  tableName: 'incidents',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['severity'] },
    { fields: ['assigned_to_id'] },
    { fields: ['category'] },  // NEW
    { fields: ['detected_at'] },  // NEW
    { fields: ['priority', 'status'] },  // NEW (composite)
  ],
})
```

---

## 2. Short-Term Enhancements (2-4 Weeks)

### 2.1 Standardize Archive Operations

**Priority**: MEDIUM
**Effort**: 1 week

**Current State**: Only threat-intelligence has archive functionality

**Design Pattern**:

```typescript
// Generic archive service (backend/services/archiveService.ts)
export interface ArchiveConfig {
  collection: string;
  retentionDays: number;
  archiveStatus?: string;
}

export class ArchiveService {
  async archiveOldRecords(config: ArchiveConfig): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays);

    // For Sequelize models
    const result = await Model.update(
      { status: config.archiveStatus || 'archived' },
      {
        where: {
          createdAt: { [Op.lt]: cutoffDate },
          status: { [Op.notIn]: ['archived', 'deleted'] }
        }
      }
    );

    return result[0]; // Number of updated records
  }

  async getArchivedRecords(filters: any): Promise<any[]> {
    return Model.findAll({
      where: {
        status: 'archived',
        ...filters
      }
    });
  }

  async restoreFromArchive(id: string): Promise<boolean> {
    const entity = await Model.findByPk(id);
    if (!entity || entity.status !== 'archived') return false;

    await entity.update({ status: 'open' }); // Or previous status
    return true;
  }
}
```

**Implementation for Each Module**:

```typescript
// backend/modules/incident-response/routes/incidentRoutes.ts
router.post('/incidents/archive', incidentController.archiveIncidents);
router.get('/incidents/archived', incidentController.getArchivedIncidents);
router.post('/incidents/:id/restore', incidentController.restoreIncident);

// Archive configuration per module
const ARCHIVE_CONFIGS = {
  incidents: { retentionDays: 90, archiveStatus: 'archived' },
  vulnerabilities: { retentionDays: 180, archiveStatus: 'archived' },
  threats: { retentionDays: 365, archiveStatus: 'archived' },
  iocs: { retentionDays: 180, archiveStatus: 'archived' },
};
```

**Automated Archival Job** (cron):

```typescript
// backend/jobs/archivalJob.ts
import cron from 'node-cron';

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running automated archival job...');

  for (const [module, config] of Object.entries(ARCHIVE_CONFIGS)) {
    const count = await archiveService.archiveOldRecords(config);
    console.log(`Archived ${count} ${module} records`);
  }
});
```

---

### 2.2 Implement Change Tracking System

**Priority**: MEDIUM
**Effort**: 1.5 weeks

**Design**: Create a generic change log system to track all entity modifications

**New Model**:

```typescript
// backend/models/EntityChangeLog.ts
import {
  Table, Column, Model, DataType, PrimaryKey, Default,
  AllowNull, ForeignKey, BelongsTo, Index,
} from 'sequelize-typescript';
import User from './User';

@Table({
  tableName: 'entity_change_logs',
  underscored: true,
  timestamps: false,
})
export default class EntityChangeLog extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Index
  @Column(DataType.STRING)
  entityType!: string; // 'incident', 'vulnerability', etc.

  @AllowNull(false)
  @Index
  @Column(DataType.STRING)
  entityId!: string;

  @AllowNull(false)
  @Index
  @Column(DataType.STRING)
  action!: string; // 'create', 'update', 'delete', 'restore'

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User, 'userId')
  user?: User;

  @Column(DataType.JSONB)
  oldValues?: any; // Previous state

  @Column(DataType.JSONB)
  newValues?: any; // New state

  @Column(DataType.JSONB)
  changes?: any; // Diff of changes

  @Column(DataType.STRING)
  ipAddress?: string;

  @Column(DataType.STRING)
  userAgent?: string;

  @Default(DataType.NOW)
  @AllowNull(false)
  @Index
  @Column(DataType.DATE)
  timestamp!: Date;
}
```

**Sequelize Hook Middleware**:

```typescript
// backend/middleware/changeTracking.ts
import EntityChangeLog from '../models/EntityChangeLog';

export function enableChangeTracking(model: any, entityType: string) {
  // Track updates
  model.addHook('beforeUpdate', async (instance: any, options: any) => {
    const oldValues = instance._previousDataValues;
    const newValues = instance.dataValues;

    const changes: any = {};
    for (const key in newValues) {
      if (oldValues[key] !== newValues[key]) {
        changes[key] = { old: oldValues[key], new: newValues[key] };
      }
    }

    await EntityChangeLog.create({
      entityType,
      entityId: instance.id,
      action: 'update',
      userId: options.userId || 'system', // Pass from controller
      oldValues,
      newValues,
      changes,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    });
  });

  // Track creates
  model.addHook('afterCreate', async (instance: any, options: any) => {
    await EntityChangeLog.create({
      entityType,
      entityId: instance.id,
      action: 'create',
      userId: options.userId || 'system',
      newValues: instance.dataValues,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    });
  });

  // Track deletes
  model.addHook('beforeDestroy', async (instance: any, options: any) => {
    await EntityChangeLog.create({
      entityType,
      entityId: instance.id,
      action: 'delete',
      userId: options.userId || 'system',
      oldValues: instance.dataValues,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    });
  });
}

// Enable for all models
import { Incident, Vulnerability, Asset } from '../models';

enableChangeTracking(Incident, 'incident');
enableChangeTracking(Vulnerability, 'vulnerability');
enableChangeTracking(Asset, 'asset');
```

**Controller Pattern**:

```typescript
// Pass user context to Sequelize operations
await incident.update(updates, {
  userId: req.user.id,
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
});
```

**API Endpoints**:

```typescript
// Get change history for any entity
router.get('/changes/:entityType/:entityId', async (req, res) => {
  const { entityType, entityId } = req.params;

  const changes = await EntityChangeLog.findAll({
    where: { entityType, entityId },
    include: [{ model: User, attributes: ['id', 'username', 'email'] }],
    order: [['timestamp', 'DESC']],
  });

  res.json({ success: true, data: changes });
});
```

---

### 2.3 Create Missing Core Models

**Priority**: MEDIUM
**Effort**: 2 weeks

#### Organization Model (Multi-Tenancy)

```typescript
// backend/models/Organization.ts
@Table({
  tableName: 'organizations',
  underscored: true,
  timestamps: true,
})
export default class Organization extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string;

  @Unique
  @Column(DataType.STRING)
  domain?: string; // e.g., 'acme.com'

  @Column(DataType.JSONB)
  settings?: {
    retentionDays?: number;
    maxUsers?: number;
    features?: string[];
  };

  @Default(true)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;

  @HasMany(() => User, 'organizationId')
  users?: User[];

  @HasMany(() => Incident, 'organizationId')
  incidents?: Incident[];
}
```

#### Case Model (Cross-Module Cases)

```typescript
// backend/models/Case.ts
@Table({
  tableName: 'cases',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['assigned_to_id'] },
  ],
})
export default class Case extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Default('open')
  @AllowNull(false)
  @Column(DataType.STRING)
  status!: string; // open, investigating, resolved, closed

  @Default(3)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  priority!: number;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  assignedToId?: string;

  @BelongsTo(() => User, 'assignedToId')
  assignedTo?: User;

  @ForeignKey(() => Organization)
  @Column(DataType.UUID)
  organizationId?: string;

  @BelongsTo(() => Organization, 'organizationId')
  organization?: Organization;

  @Column(DataType.ARRAY(DataType.STRING))
  tags!: string[];

  // Related entities (polymorphic associations)
  @Column(DataType.JSONB)
  relatedIncidents?: string[]; // Array of incident IDs

  @Column(DataType.JSONB)
  relatedVulnerabilities?: string[];

  @Column(DataType.JSONB)
  relatedIOCs?: string[];

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
```

#### Evidence Model

```typescript
// backend/models/Evidence.ts
@Table({
  tableName: 'evidence',
  underscored: true,
  timestamps: true,
})
export default class Evidence extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  type!: string; // file, screenshot, log, network_capture

  @AllowNull(false)
  @Column(DataType.STRING)
  filename!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  filePath!: string;

  @Column(DataType.STRING)
  mimeType?: string;

  @Column(DataType.BIGINT)
  fileSize?: number;

  @Column(DataType.STRING)
  hash!: string; // SHA256 for integrity

  @Column(DataType.TEXT)
  description?: string;

  // Polymorphic association
  @AllowNull(false)
  @Column(DataType.STRING)
  entityType!: string; // 'incident', 'case', 'vulnerability'

  @AllowNull(false)
  @Column(DataType.STRING)
  entityId!: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  uploadedById!: string;

  @BelongsTo(() => User, 'uploadedById')
  uploadedBy?: User;

  @Column(DataType.JSONB)
  metadata?: any; // Exif data, capture time, etc.

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;
}
```

---

## 3. Medium-Term Architecture (1-3 Months)

### 3.1 Implement Multi-Tenancy

**Components**:
1. Organization model (see above)
2. Update all models with organizationId foreign key
3. Query scoping middleware
4. Row-level security (RLS) in PostgreSQL

**Query Scoping**:

```typescript
// backend/middleware/tenancy.ts
export function scopeToOrganization(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user || !user.organizationId) {
    return res.status(403).json({ error: 'No organization context' });
  }

  // Add organization scope to all queries
  req.organizationId = user.organizationId;
  next();
}

// Apply to all models
Incident.addScope('defaultScope', {
  where: { organizationId: req.organizationId }
});
```

### 3.2 Redis Caching Layer

**Use Cases**:
- Cache frequently accessed threat intelligence
- Session storage
- Rate limiting state
- Query result caching

**Implementation**:

```typescript
// backend/config/redis.ts
import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

// Cache decorator
export function cacheable(ttl: number = 300) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const result = await originalMethod.apply(this, args);
      await redis.setex(cacheKey, ttl, JSON.stringify(result));

      return result;
    };

    return descriptor;
  };
}

// Usage
@cacheable(600) // Cache for 10 minutes
async getThreats(filters: any): Promise<Threat[]> {
  return Threat.find(filters);
}
```

### 3.3 Read Replica Configuration

**PostgreSQL Setup**:

```typescript
// backend/config/database.ts
const sequelize = new Sequelize({
  replication: {
    read: [
      { host: 'read-replica-1.example.com', username: 'reader', password: 'xxx' },
      { host: 'read-replica-2.example.com', username: 'reader', password: 'xxx' },
    ],
    write: { host: 'primary.example.com', username: 'writer', password: 'xxx' }
  },
  pool: {
    max: 10,
    min: 2,
    idle: 10000
  }
});
```

**Usage**:

```typescript
// Read queries automatically use replicas
const users = await User.findAll(); // Routed to read replica

// Write queries use primary
await User.create({ ... }); // Routed to primary
```

---

## 4. Data Validation Recommendations

### 4.1 Add Database-Level CHECK Constraints

```sql
-- Ensure severity values are valid
ALTER TABLE incidents ADD CONSTRAINT chk_incident_severity
  CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info'));

ALTER TABLE vulnerabilities ADD CONSTRAINT chk_vulnerability_severity
  CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info'));

ALTER TABLE iocs ADD CONSTRAINT chk_ioc_severity
  CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info'));

-- Ensure priority is valid range
ALTER TABLE incidents ADD CONSTRAINT chk_incident_priority
  CHECK (priority >= 1 AND priority <= 5);

-- Ensure CVSS score is valid
ALTER TABLE vulnerabilities ADD CONSTRAINT chk_cvss_score
  CHECK (cvss_score >= 0.0 AND cvss_score <= 10.0);

-- Ensure confidence is percentage
ALTER TABLE iocs ADD CONSTRAINT chk_confidence
  CHECK (confidence >= 0 AND confidence <= 100);

-- Ensure email format (PostgreSQL)
ALTER TABLE users ADD CONSTRAINT chk_email_format
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
```

### 4.2 Custom Sequelize Validators

```typescript
// backend/models/Vulnerability.ts
@Column({
  type: DataType.FLOAT,
  field: 'cvss_score',
  validate: {
    min: 0.0,
    max: 10.0,
    isDecimal: true,
  }
})
cvssScore?: number;

@Column({
  type: DataType.STRING,
  validate: {
    isIn: [['critical', 'high', 'medium', 'low', 'info']],
  }
})
severity!: string;

// Custom validator
@Column({
  type: DataType.STRING,
  validate: {
    isValidCVE(value: string) {
      if (value && !/^CVE-\d{4}-\d{4,}$/.test(value)) {
        throw new Error('Invalid CVE ID format');
      }
    }
  }
})
cveId?: string;
```

---

## 5. Performance Optimization Guidelines

### 5.1 Query Optimization Checklist

- [ ] Use `SELECT` with specific fields instead of `SELECT *`
- [ ] Add indexes for all foreign keys
- [ ] Use composite indexes for multi-column WHERE clauses
- [ ] Implement pagination for all list endpoints
- [ ] Use eager loading (`include`) to prevent N+1 queries
- [ ] Add query timeouts to prevent long-running queries
- [ ] Use database-level aggregations instead of application-level
- [ ] Implement query result caching for expensive operations

### 5.2 Connection Pool Tuning

```typescript
// backend/config/database.ts
const sequelize = new Sequelize(DATABASE_URL, {
  pool: {
    max: 20,           // Maximum connections
    min: 5,            // Minimum connections
    idle: 10000,       // Idle timeout (ms)
    acquire: 30000,    // Connection acquire timeout
    evict: 1000,       // Eviction interval
  },
  logging: false,      // Disable in production
  dialectOptions: {
    statement_timeout: 30000, // 30 second query timeout
  }
});
```

### 5.3 Batch Operations

```typescript
// Bulk create for better performance
const incidents = await Incident.bulkCreate([
  { title: 'Incident 1', ... },
  { title: 'Incident 2', ... },
], {
  validate: true,
  ignoreDuplicates: true,
});

// Bulk update
await Incident.update(
  { status: 'archived' },
  { where: { createdAt: { [Op.lt]: cutoffDate } } }
);
```

---

## 6. Migration Scripts

### 6.1 Soft Delete Migration

```typescript
// backend/migrations/20251024000001-add-soft-delete.ts
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const tables = ['incidents', 'vulnerabilities', 'assets', 'threat_actors'];

  for (const table of tables) {
    await queryInterface.addColumn(table, 'is_active', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn(table, 'deleted_at', {
      type: DataTypes.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex(table, ['is_active']);
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const tables = ['incidents', 'vulnerabilities', 'assets', 'threat_actors'];

  for (const table of tables) {
    await queryInterface.removeColumn(table, 'is_active');
    await queryInterface.removeColumn(table, 'deleted_at');
  }
}
```

### 6.2 Organization Multi-Tenancy Migration

```typescript
// backend/migrations/20251024000002-add-organizations.ts
import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Create organizations table
  await queryInterface.createTable('organizations', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    domain: {
      type: DataTypes.STRING,
      unique: true,
    },
    settings: {
      type: DataTypes.JSONB,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  // Add organization_id to all tenant-scoped tables
  const tables = ['users', 'incidents', 'vulnerabilities', 'assets', 'iocs', 'threat_actors'];

  for (const table of tables) {
    await queryInterface.addColumn(table, 'organization_id', {
      type: DataTypes.UUID,
      allowNull: true, // Nullable during migration
      references: {
        model: 'organizations',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex(table, ['organization_id']);
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const tables = ['users', 'incidents', 'vulnerabilities', 'assets', 'iocs', 'threat_actors'];

  for (const table of tables) {
    await queryInterface.removeColumn(table, 'organization_id');
  }

  await queryInterface.dropTable('organizations');
}
```

---

## 7. Testing Requirements

### 7.1 Database Test Coverage

**Required Tests**:
1. Model validation tests
2. Relationship tests (foreign keys)
3. Soft delete tests
4. Archive operation tests
5. CRUD operation tests for all modules
6. Multi-tenancy data isolation tests
7. Performance tests (query execution time)
8. Migration rollback tests

**Example Test**:

```typescript
// backend/tests/models/incident.test.ts
import { Incident, User } from '../../models';

describe('Incident Model', () => {
  describe('Soft Delete', () => {
    it('should soft delete incident', async () => {
      const incident = await Incident.create({
        title: 'Test Incident',
        severity: 'high',
        status: 'open',
        detectedAt: new Date(),
      });

      await incident.update({ isActive: false, deletedAt: new Date() });

      const found = await Incident.findOne({
        where: { id: incident.id, isActive: true }
      });

      expect(found).toBeNull();
    });

    it('should restore soft deleted incident', async () => {
      const incident = await Incident.create({
        title: 'Test Incident',
        isActive: false,
        deletedAt: new Date(),
      });

      await incident.update({ isActive: true, deletedAt: null });

      const found = await Incident.findOne({
        where: { id: incident.id, isActive: true }
      });

      expect(found).not.toBeNull();
    });
  });
});
```

---

## 8. Summary of Priorities

### High Priority (This Week)
1. Add soft delete to 4 core models
2. Complete CRUD for threat-hunting and risk-assessment
3. Add critical missing indexes

### Medium Priority (2-4 Weeks)
1. Standardize archive operations across modules
2. Implement change tracking system
3. Create Organization, Case, Evidence models

### Low Priority (1-3 Months)
1. Implement multi-tenancy with row-level security
2. Add Redis caching layer
3. Configure read replicas for reporting

### Ongoing
1. Add database-level CHECK constraints
2. Implement comprehensive test coverage
3. Monitor and optimize query performance
