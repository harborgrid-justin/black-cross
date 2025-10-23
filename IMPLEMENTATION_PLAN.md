# OpenCTI Code Integration - Detailed Implementation Plan

## Executive Summary

This document provides a comprehensive, step-by-step technical plan for copying, adapting, and integrating OpenCTI code into the Black-Cross platform. The implementation follows a phased approach, starting with the highest-priority features and ensuring full testing at each stage.

**Implementation Timeline:** 26 weeks (6 months)  
**Resources Required:** 2-3 senior engineers  
**Testing Strategy:** Unit tests, integration tests, E2E tests at each phase  

**Current Status (Updated):**
- ✅ Phase 1 COMPLETE (Weeks 1-6)
- 🔄 Phase 2 IN PROGRESS (Starting Week 7)
- ⏳ Phase 3 PENDING
- ⏳ Phase 4 PENDING

**Features Completed:** 3 of 20
1. ✅ Advanced Filtering System
2. ✅ Enterprise Access Control  
3. ✅ Background Task System  

---

## Phase 1: Foundation & Infrastructure (Weeks 1-6)

### 1.1 Advanced Filtering System

#### Source Files to Copy
```
From: opencti-platform/opencti-graphql/src/utils/filtering/
To: backend/utils/filtering/

Files:
- filtering-utils.ts (25,589 bytes)
- filtering-constants.ts (10,341 bytes)
- boolean-logic-engine.ts (12,218 bytes)
- filtering-resolution.ts (10,758 bytes)
```

#### Adaptation Strategy
1. **Remove GraphQL dependencies** - Replace with REST API validators
2. **Replace STIX-specific logic** - Make generic for all entity types
3. **Update imports** - Adjust to Black-Cross module structure
4. **Add Sequelize integration** - Connect to our ORM layer

#### Implementation Steps
```typescript
// Step 1: Create base filter types
// File: backend/utils/filtering/filter-types.ts

export interface FilterGroup {
  mode: 'and' | 'or' | 'not';
  filters: Filter[];
  filterGroups: FilterGroup[];
}

export interface Filter {
  key: string;
  operator: FilterOperator;
  values: string[];
  mode?: 'and' | 'or';
}

export type FilterOperator = 
  | 'eq' | 'not_eq'
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with'
  | 'in' | 'not_in'
  | 'nil' | 'not_nil';

// Step 2: Implement boolean logic engine
// File: backend/utils/filtering/boolean-logic-engine.ts

export class BooleanLogicEngine {
  evaluate<T>(filterGroup: FilterGroup, entity: T): boolean {
    return this.evaluateGroup(filterGroup, entity);
  }

  private evaluateGroup<T>(group: FilterGroup, entity: T): boolean {
    const filterResults = group.filters.map(f => this.evaluateFilter(f, entity));
    const groupResults = group.filterGroups.map(g => this.evaluateGroup(g, entity));
    const allResults = [...filterResults, ...groupResults];

    switch (group.mode) {
      case 'and':
        return allResults.every(Boolean);
      case 'or':
        return allResults.some(Boolean);
      case 'not':
        return !allResults.every(Boolean);
      default:
        return true;
    }
  }

  private evaluateFilter<T>(filter: Filter, entity: T): boolean {
    const value = this.getNestedValue(entity, filter.key);
    
    switch (filter.operator) {
      case 'eq':
        return filter.values.some(v => value === v);
      case 'not_eq':
        return !filter.values.some(v => value === v);
      case 'contains':
        return filter.values.some(v => String(value).includes(v));
      case 'in':
        return filter.values.includes(String(value));
      // ... implement all operators
      default:
        return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((curr, key) => curr?.[key], obj);
  }
}

// Step 3: Convert filters to Sequelize queries
// File: backend/utils/filtering/sequelize-adapter.ts

import { Op } from 'sequelize';

export class SequelizeFilterAdapter {
  convertToWhere(filterGroup: FilterGroup): any {
    return this.convertGroup(filterGroup);
  }

  private convertGroup(group: FilterGroup): any {
    const conditions = [
      ...group.filters.map(f => this.convertFilter(f)),
      ...group.filterGroups.map(g => this.convertGroup(g))
    ];

    switch (group.mode) {
      case 'and':
        return { [Op.and]: conditions };
      case 'or':
        return { [Op.or]: conditions };
      case 'not':
        return { [Op.not]: { [Op.and]: conditions } };
      default:
        return {};
    }
  }

  private convertFilter(filter: Filter): any {
    const operatorMap: Record<FilterOperator, symbol> = {
      eq: Op.eq,
      not_eq: Op.ne,
      gt: Op.gt,
      gte: Op.gte,
      lt: Op.lt,
      lte: Op.lte,
      contains: Op.like,
      not_contains: Op.notLike,
      starts_with: Op.startsWith,
      ends_with: Op.endsWith,
      in: Op.in,
      not_in: Op.notIn,
      nil: Op.is,
      not_nil: Op.not
    };

    const op = operatorMap[filter.operator];
    let value = filter.values;

    if (filter.operator === 'contains' || filter.operator === 'not_contains') {
      value = filter.values.map(v => `%${v}%`);
    }

    return {
      [filter.key]: {
        [op]: filter.values.length === 1 ? value[0] : value
      }
    };
  }
}
```

#### Testing Plan
```typescript
// File: backend/utils/filtering/__tests__/boolean-logic-engine.test.ts

describe('BooleanLogicEngine', () => {
  const engine = new BooleanLogicEngine();

  it('should evaluate AND filters correctly', () => {
    const filterGroup: FilterGroup = {
      mode: 'and',
      filters: [
        { key: 'severity', operator: 'eq', values: ['high'] },
        { key: 'status', operator: 'eq', values: ['open'] }
      ],
      filterGroups: []
    };

    const entity = { severity: 'high', status: 'open' };
    expect(engine.evaluate(filterGroup, entity)).toBe(true);

    const entity2 = { severity: 'high', status: 'closed' };
    expect(engine.evaluate(filterGroup, entity2)).toBe(false);
  });

  it('should evaluate OR filters correctly', () => {
    const filterGroup: FilterGroup = {
      mode: 'or',
      filters: [
        { key: 'severity', operator: 'eq', values: ['high'] },
        { key: 'severity', operator: 'eq', values: ['critical'] }
      ],
      filterGroups: []
    };

    const entity = { severity: 'high' };
    expect(engine.evaluate(filterGroup, entity)).toBe(true);
  });

  it('should evaluate nested filter groups', () => {
    const filterGroup: FilterGroup = {
      mode: 'and',
      filters: [
        { key: 'status', operator: 'eq', values: ['open'] }
      ],
      filterGroups: [
        {
          mode: 'or',
          filters: [
            { key: 'severity', operator: 'eq', values: ['high'] },
            { key: 'severity', operator: 'eq', values: ['critical'] }
          ],
          filterGroups: []
        }
      ]
    };

    const entity = { status: 'open', severity: 'high' };
    expect(engine.evaluate(filterGroup, entity)).toBe(true);
  });
});
```

---

### 1.2 Enterprise Access Control

#### Source Files to Copy
```
From: opencti-platform/opencti-graphql/src/utils/access.ts
To: backend/utils/access.ts

File size: 34,520 bytes
Lines: ~800
```

#### Adaptation Strategy
1. **Simplify for initial implementation** - Start with core RBAC
2. **Integrate with existing auth** - Replace OpenCTI auth with our JWT system
3. **Add organization support** - Extend user model for multi-tenancy
4. **Create migration path** - Gradual rollout of new permissions

#### Implementation Steps

```typescript
// Step 1: Extend User model
// File: backend/models/User.ts

import { Table, Column, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';

@Table({ tableName: 'users' })
export class User extends Model {
  // Existing fields...
  
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: []
  })
  capabilities!: string[];

  @Column({
    type: DataType.UUID
  })
  organization_id?: string;

  @BelongsToMany(() => Organization, () => UserOrganization)
  organizations!: Organization[];
}

// Step 2: Create Capability constants
// File: backend/utils/access/capabilities.ts

export const CAPABILITIES = {
  // Knowledge capabilities
  KNOWLEDGE_READ: 'KNOWLEDGE_READ',
  KNOWLEDGE_CREATE: 'KNOWLEDGE_CREATE',
  KNOWLEDGE_UPDATE: 'KNOWLEDGE_UPDATE',
  KNOWLEDGE_DELETE: 'KNOWLEDGE_DELETE',
  
  // Settings capabilities
  SETTINGS_READ: 'SETTINGS_READ',
  SETTINGS_UPDATE: 'SETTINGS_UPDATE',
  SETTINGS_SET_ACCESSES: 'SETTINGS_SET_ACCESSES',
  
  // User management
  USER_MANAGE: 'USER_MANAGE',
  GROUP_MANAGE: 'GROUP_MANAGE',
  
  // Admin capabilities
  BYPASS_ENTERPRISE: 'BYPASS_ENTERPRISE',
  VIRTUAL_ORGANIZATION_ADMIN: 'VIRTUAL_ORGANIZATION_ADMIN'
} as const;

export type Capability = typeof CAPABILITIES[keyof typeof CAPABILITIES];

// Step 3: Implement access control functions
// File: backend/utils/access/index.ts

import type { User } from '../../models/User';
import { CAPABILITIES } from './capabilities';

export const isUserHasCapability = (
  user: User,
  capability: Capability
): boolean => {
  if (!user || !user.capabilities) {
    return false;
  }
  
  // Admin bypass
  if (user.capabilities.includes(CAPABILITIES.BYPASS_ENTERPRISE)) {
    return true;
  }
  
  return user.capabilities.includes(capability);
};

export const requireCapability = (capability: Capability) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!isUserHasCapability(req.user, capability)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: capability 
      });
    }
    
    next();
  };
};

// Member access rights for resources
export enum MemberAccessRight {
  ADMIN = 'admin',
  EDIT = 'edit',
  VIEW = 'view',
  NONE = 'none'
}

export interface AuthorizedMember {
  id: string;
  access_right: MemberAccessRight;
}

export const getUserAccessRight = (
  user: User,
  entity: { authorized_members?: AuthorizedMember[] }
): MemberAccessRight => {
  if (!entity.authorized_members) {
    return MemberAccessRight.NONE;
  }
  
  const member = entity.authorized_members.find(m => m.id === user.id);
  if (!member) {
    return MemberAccessRight.NONE;
  }
  
  return member.access_right as MemberAccessRight;
};

export const canAccessEntity = (
  user: User,
  entity: any,
  requiredLevel: MemberAccessRight = MemberAccessRight.VIEW
): boolean => {
  // Admin bypass
  if (isUserHasCapability(user, CAPABILITIES.BYPASS_ENTERPRISE)) {
    return true;
  }
  
  const userAccess = getUserAccessRight(user, entity);
  
  const accessLevels = {
    [MemberAccessRight.NONE]: 0,
    [MemberAccessRight.VIEW]: 1,
    [MemberAccessRight.EDIT]: 2,
    [MemberAccessRight.ADMIN]: 3
  };
  
  return accessLevels[userAccess] >= accessLevels[requiredLevel];
};

// Step 4: Create middleware
// File: backend/middleware/access-control.ts

export const requireEntityAccess = (
  entityGetter: (req: Request) => Promise<any>,
  requiredLevel: MemberAccessRight = MemberAccessRight.VIEW
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entity = await entityGetter(req);
      
      if (!entity) {
        return res.status(404).json({ error: 'Entity not found' });
      }
      
      if (!canAccessEntity(req.user!, entity, requiredLevel)) {
        return res.status(403).json({ 
          error: 'Insufficient access rights',
          required: requiredLevel 
        });
      }
      
      req.entity = entity;
      next();
    } catch (error) {
      next(error);
    }
  };
};
```

#### Database Migration
```sql
-- File: backend/migrations/001-add-access-control.sql

-- Add capabilities to users table
ALTER TABLE users
ADD COLUMN capabilities TEXT[] DEFAULT '{}',
ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_organizations junction table
CREATE TABLE IF NOT EXISTS user_organizations (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  PRIMARY KEY (user_id, organization_id)
);

-- Add authorized_members to key tables
ALTER TABLE incidents
ADD COLUMN authorized_members JSONB DEFAULT '[]';

ALTER TABLE vulnerabilities
ADD COLUMN authorized_members JSONB DEFAULT '[]';

ALTER TABLE threats
ADD COLUMN authorized_members JSONB DEFAULT '[]';

-- Create index for faster access control checks
CREATE INDEX idx_incidents_authorized_members ON incidents USING GIN (authorized_members);
CREATE INDEX idx_users_capabilities ON users USING GIN (capabilities);
```

#### Testing Plan
```typescript
// File: backend/utils/access/__tests__/access-control.test.ts

describe('Access Control', () => {
  describe('isUserHasCapability', () => {
    it('should return true for user with capability', () => {
      const user = {
        capabilities: ['KNOWLEDGE_READ', 'KNOWLEDGE_CREATE']
      } as User;
      
      expect(isUserHasCapability(user, CAPABILITIES.KNOWLEDGE_READ)).toBe(true);
    });

    it('should return false for user without capability', () => {
      const user = {
        capabilities: ['KNOWLEDGE_READ']
      } as User;
      
      expect(isUserHasCapability(user, CAPABILITIES.KNOWLEDGE_DELETE)).toBe(false);
    });

    it('should return true for admin with BYPASS_ENTERPRISE', () => {
      const user = {
        capabilities: ['BYPASS_ENTERPRISE']
      } as User;
      
      expect(isUserHasCapability(user, CAPABILITIES.KNOWLEDGE_DELETE)).toBe(true);
    });
  });

  describe('canAccessEntity', () => {
    it('should allow access with sufficient rights', () => {
      const user = { id: 'user1', capabilities: [] } as User;
      const entity = {
        authorized_members: [
          { id: 'user1', access_right: MemberAccessRight.EDIT }
        ]
      };
      
      expect(canAccessEntity(user, entity, MemberAccessRight.VIEW)).toBe(true);
      expect(canAccessEntity(user, entity, MemberAccessRight.EDIT)).toBe(true);
      expect(canAccessEntity(user, entity, MemberAccessRight.ADMIN)).toBe(false);
    });
  });
});
```

---

### 1.3 Background Task System

#### Source Files to Copy
```
From: opencti-platform/opencti-graphql/src/domain/backgroundTask-common.js
To: backend/utils/background-tasks/

File size: 19,964 bytes
Convert: JavaScript → TypeScript
```

#### Implementation Steps

```typescript
// Step 1: Create task types
// File: backend/utils/background-tasks/task-types.ts

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface BackgroundTask {
  id: string;
  type: string;
  status: TaskStatus;
  progress: number;
  started_at?: Date;
  completed_at?: Date;
  error?: string;
  user_id: string;
  metadata: Record<string, any>;
}

export interface TaskInput {
  type: string;
  user_id: string;
  metadata?: Record<string, any>;
}

export interface TaskExecutor {
  execute(task: BackgroundTask): Promise<any>;
  cancel(task: BackgroundTask): Promise<void>;
}

// Step 2: Create task manager
// File: backend/utils/background-tasks/task-manager.ts

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export class BackgroundTaskManager extends EventEmitter {
  private tasks: Map<string, BackgroundTask> = new Map();
  private executors: Map<string, TaskExecutor> = new Map();
  private runningTasks: Set<string> = new Set();
  private maxConcurrent: number = 5;

  registerExecutor(type: string, executor: TaskExecutor): void {
    this.executors.set(type, executor);
  }

  async createTask(input: TaskInput): Promise<BackgroundTask> {
    const task: BackgroundTask = {
      id: uuidv4(),
      type: input.type,
      status: TaskStatus.PENDING,
      progress: 0,
      user_id: input.user_id,
      metadata: input.metadata || {}
    };

    this.tasks.set(task.id, task);
    
    // Persist to database
    await this.persistTask(task);
    
    // Emit event
    this.emit('task:created', task);
    
    // Try to execute
    this.tryExecuteNext();
    
    return task;
  }

  async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (this.runningTasks.size >= this.maxConcurrent) {
      return; // Wait for slot
    }

    const executor = this.executors.get(task.type);
    if (!executor) {
      throw new Error(`No executor registered for task type: ${task.type}`);
    }

    this.runningTasks.add(taskId);
    task.status = TaskStatus.RUNNING;
    task.started_at = new Date();
    await this.persistTask(task);
    this.emit('task:started', task);

    try {
      const result = await executor.execute(task);
      
      task.status = TaskStatus.COMPLETED;
      task.completed_at = new Date();
      task.progress = 100;
      task.metadata.result = result;
      
      this.emit('task:completed', task);
    } catch (error) {
      task.status = TaskStatus.FAILED;
      task.completed_at = new Date();
      task.error = error.message;
      
      this.emit('task:failed', task, error);
    } finally {
      await this.persistTask(task);
      this.runningTasks.delete(taskId);
      this.tryExecuteNext();
    }
  }

  async cancelTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (task.status === TaskStatus.RUNNING) {
      const executor = this.executors.get(task.type);
      if (executor) {
        await executor.cancel(task);
      }
    }

    task.status = TaskStatus.CANCELLED;
    task.completed_at = new Date();
    await this.persistTask(task);
    this.emit('task:cancelled', task);
    
    this.runningTasks.delete(taskId);
    this.tryExecuteNext();
  }

  getTask(taskId: string): BackgroundTask | undefined {
    return this.tasks.get(taskId);
  }

  private tryExecuteNext(): void {
    if (this.runningTasks.size >= this.maxConcurrent) {
      return;
    }

    const pendingTask = Array.from(this.tasks.values())
      .find(t => t.status === TaskStatus.PENDING);

    if (pendingTask) {
      this.executeTask(pendingTask.id).catch(console.error);
    }
  }

  private async persistTask(task: BackgroundTask): Promise<void> {
    // Save to database
    await BackgroundTaskModel.upsert({
      id: task.id,
      type: task.type,
      status: task.status,
      progress: task.progress,
      started_at: task.started_at,
      completed_at: task.completed_at,
      error: task.error,
      user_id: task.user_id,
      metadata: task.metadata
    });
  }
}

// Singleton instance
export const taskManager = new BackgroundTaskManager();

// Step 3: Create example executor
// File: backend/utils/background-tasks/executors/export-executor.ts

export class ExportExecutor implements TaskExecutor {
  async execute(task: BackgroundTask): Promise<any> {
    const { entity_type, filters, format } = task.metadata;
    
    // Simulate progress updates
    for (let i = 0; i <= 100; i += 10) {
      task.progress = i;
      await new Promise(resolve => setTimeout(resolve, 100));
      taskManager.emit('task:progress', task);
    }
    
    // Perform actual export
    const data = await this.exportData(entity_type, filters, format);
    
    return { file_path: data.path, size: data.size };
  }

  async cancel(task: BackgroundTask): Promise<void> {
    // Clean up any resources
    console.log(`Cancelling export task ${task.id}`);
  }

  private async exportData(entityType: string, filters: any, format: string) {
    // Implementation
    return { path: '/exports/data.csv', size: 1024 };
  }
}

// Register executor
taskManager.registerExecutor('export', new ExportExecutor());
```

#### API Routes
```typescript
// File: backend/routes/background-tasks.ts

import express from 'express';
import { taskManager } from '../utils/background-tasks/task-manager';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/tasks', authenticate, async (req, res) => {
  try {
    const task = await taskManager.createTask({
      type: req.body.type,
      user_id: req.user!.id,
      metadata: req.body.metadata
    });
    
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/tasks/:id', authenticate, async (req, res) => {
  const task = taskManager.getTask(req.params.id);
  
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }
  
  if (task.user_id !== req.user!.id) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }
  
  res.json({ success: true, data: task });
});

router.delete('/tasks/:id', authenticate, async (req, res) => {
  try {
    await taskManager.cancelTask(req.params.id);
    res.json({ success: true, message: 'Task cancelled' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
```

---

## Phase 2: Intelligence Features (Weeks 7-14)

### 2.1 AI Integration

#### Source Files to Copy
```
From: opencti-platform/opencti-graphql/src/modules/ai/
To: backend/modules/ai/

Files:
- ai-domain.ts (22,188 bytes)
- ai-nlq-utils.ts (7,100 bytes)
- ai-nlq-schema.ts (6,524 bytes)
- ai-resolver.ts (2,416 bytes)
```

#### Implementation Steps

[Content continues with detailed implementation for AI, STIX, Playbooks, etc...]

---

## Testing Strategy

### Unit Tests
- Coverage target: 80%+
- Run after each feature implementation
- Mock external dependencies

### Integration Tests
- Test API endpoints
- Test database interactions
- Test cross-module dependencies

### E2E Tests
- Use existing Cypress infrastructure
- Add tests for new features
- Ensure backward compatibility

---

## Rollout Strategy

### Week 1-2: Infrastructure Setup
- Set up development environment
- Create feature flags
- Prepare database migrations

### Week 3-6: Phase 1 Implementation
- Implement and test filtering
- Implement and test access control
- Implement and test background tasks

### Week 7-14: Phase 2 Implementation
- Implement AI integration
- Implement STIX support
- Implement playbook automation

### Week 15-20: Phase 3 Implementation
- Notifications
- Case management
- Metrics

### Week 21-26: Phase 4 & Polish
- Caching layer
- GraphQL (optional)
- Bug fixes and optimization

---

## Risk Mitigation

1. **Feature Flags** - Enable/disable features without deployment
2. **Gradual Rollout** - Beta users first
3. **Monitoring** - Track errors and performance
4. **Rollback Plan** - Quick revert if needed
5. **Documentation** - Complete docs for each feature

---

## Success Criteria

### Technical Metrics
- [ ] All tests passing (80%+ coverage)
- [ ] No security vulnerabilities
- [ ] API response time < 200ms (p95)
- [ ] Zero data loss during migration

### Business Metrics
- [ ] Feature adoption > 70%
- [ ] User satisfaction score > 4.5/5
- [ ] Bug reports < 5 per feature
- [ ] Performance improvement > 30%

---

*Implementation begins next...*
