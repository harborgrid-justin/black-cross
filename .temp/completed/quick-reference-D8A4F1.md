# Quick Reference: Database CRUD Status

**Analysis ID**: D8A4F1 | **Date**: 2025-10-24

---

## At a Glance

### Database Models

**PostgreSQL (Sequelize)**: 8 models
- User, Incident, Vulnerability, Asset, AuditLog, IOC, ThreatActor, PlaybookExecution

**MongoDB (Mongoose)**: 13 module-specific models
- Threat, Vulnerability, IoC, ThreatActor, SiemEvent, HuntSession, Malware, DarkWeb, ThreatFeed, ComplianceFramework, Collaboration, Report, Workflow

---

## CRUD Coverage by Module

### ✅ Complete CRUD (13 modules)
| Module | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| threat-intelligence | ✓ | ✓ | ✓ | ✓ |
| incident-response | ✓ | ✓ | ✓ | ✓ |
| vulnerability-management | ✓ | ✓ | ✓ | ✓ |
| ioc-management | ✓ | ✓ | ✓ | ✓ |
| threat-actors | ✓ | ✓ | ✓ | ✓ |
| siem | ✓ | ✓ | ✓ | ✓ |
| malware-analysis | ✓ | ✓ | ✓ | ✓ |
| reporting | ✓ | ✓ | ✓ | ✓ |
| dark-web | ✓ | ✓ | ✓ | ✓ |
| threat-feeds | ✓ | ✓ | ✓ | ✓ |
| collaboration | ✓ | ✓ | ✓ | ✓ |
| compliance | ✓ | ✓ | ✓ | ✓ |
| automation | ✓ | ✓ | ✓ | ✓ |

### ⚠️ Partial CRUD (3 modules)
- **threat-hunting**: Missing UPDATE and DELETE
- **risk-assessment**: Missing DELETE
- **example-typescript**: Mock implementation only

### ❌ No Direct CRUD (10 modules)
- dashboard, auth, playbooks, stix, code-review, metrics, notifications, ai, case-management, draft-workspace

---

## Critical Gaps

### 1. Soft Delete Implementation
**Status**: Only 2/8 models support soft delete
- ✅ User (isActive)
- ✅ IOC (isActive)
- ❌ Incident
- ❌ Vulnerability
- ❌ Asset
- ❌ ThreatActor
- ❌ AuditLog (should be immutable)
- ❌ PlaybookExecution

**Impact**: Risk of accidental data loss, broken referential integrity

### 2. Archive Operations
**Status**: Only 1/13 modules has archive
- ✅ threat-intelligence
- ❌ All other modules

**Impact**: No standardized way to handle historical data

### 3. Audit Trail
**Status**: Basic logging only, no change history
- ✅ AuditLog model exists
- ❌ No field-level change tracking
- ❌ No old/new value comparison
- ❌ Not integrated with all models

**Impact**: Limited compliance capabilities, difficult to track changes

---

## Top 5 Priority Actions

### 1. Add Soft Delete (HIGH)
**Effort**: 2-3 hours per model
**Files to modify**:
- `/home/user/black-cross/backend/models/Incident.ts`
- `/home/user/black-cross/backend/models/Vulnerability.ts`
- `/home/user/black-cross/backend/models/Asset.ts`
- `/home/user/black-cross/backend/models/ThreatActor.ts`

**Changes**:
```typescript
@Default(true)
@AllowNull(false)
@Column({ type: DataType.BOOLEAN, field: 'is_active' })
isActive!: boolean;

@Column({ type: DataType.DATE, field: 'deleted_at' })
deletedAt?: Date;
```

### 2. Complete Missing CRUD (HIGH)
**Effort**: 4-6 hours

**threat-hunting** (`backend/modules/threat-hunting/`):
- Add `router.put('/sessions/:id', ...)` in `routes/huntRoutes.ts`
- Add `router.delete('/sessions/:id', ...)` in `routes/huntRoutes.ts`
- Implement `updateSession()` and `deleteSession()` in `services/huntingService.ts`

**risk-assessment** (`backend/modules/risk-assessment/`):
- Add `router.delete('/models/:id', ...)` in `routes/riskRoutes.ts`
- Implement `deleteModel()` in `services/riskService.ts`

### 3. Add Critical Indexes (HIGH)
**Effort**: 30 minutes

**SQL to run**:
```sql
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_last_login ON users(last_login);
CREATE INDEX idx_incidents_category ON incidents(category);
CREATE INDEX idx_incidents_detected_at ON incidents(detected_at);
CREATE INDEX idx_assets_environment ON assets(environment);
CREATE INDEX idx_threat_actors_country ON threat_actors(country);
```

### 4. Standardize Archive Pattern (MEDIUM)
**Effort**: 1 week

**Create**:
- `/home/user/black-cross/backend/services/archiveService.ts` (generic archive service)
- Add archive routes to all time-series modules
- Configure retention policies per module

### 5. Implement Change Tracking (MEDIUM)
**Effort**: 1.5 weeks

**Create**:
- `/home/user/black-cross/backend/models/EntityChangeLog.ts`
- `/home/user/black-cross/backend/middleware/changeTracking.ts`
- Add routes: `GET /changes/:entityType/:entityId`

---

## Model Enhancement Roadmap

### Phase 1: Core Fixes (This Week)
- [ ] Add soft delete to 4 models
- [ ] Complete CRUD for 2 modules
- [ ] Add 6 critical indexes

### Phase 2: Standardization (2-4 Weeks)
- [ ] Standardize archive operations
- [ ] Implement change tracking system
- [ ] Add database CHECK constraints

### Phase 3: New Models (1-2 Months)
- [ ] Organization (multi-tenancy)
- [ ] Case (cross-module cases)
- [ ] Evidence (chain of custody)
- [ ] Tag (centralized tagging)

### Phase 4: Architecture (3-6 Months)
- [ ] Multi-tenancy with row-level security
- [ ] Redis caching layer
- [ ] Read replica configuration
- [ ] Time-series optimization

---

## Key Metrics

| Metric | Current | Target |
|--------|---------|--------|
| CRUD Completeness | 50% | 100% |
| Soft Delete Coverage | 25% | 100% |
| Archive Standardization | 8% | 100% |
| Change Tracking | 0% | 100% |
| Index Coverage | 75% | 90% |
| Query Performance | Good | Excellent |

---

## File Locations

### Analysis Documents
- **Main Analysis**: `/home/user/black-cross/.temp/database-crud-analysis-D8A4F1.md`
- **Recommendations**: `/home/user/black-cross/.temp/database-recommendations-D8A4F1.md`
- **Task Status**: `/home/user/black-cross/.temp/task-status-D8A4F1.json`

### Code to Review
- **Models**: `/home/user/black-cross/backend/models/*.ts`
- **Services**: `/home/user/black-cross/backend/modules/*/services/*.ts`
- **Routes**: `/home/user/black-cross/backend/modules/*/routes/*.ts`
- **Validators**: `/home/user/black-cross/backend/modules/*/validators/*.ts`

---

## Contact Points

### Models Needing Attention
1. `/home/user/black-cross/backend/models/Incident.ts` - Add soft delete
2. `/home/user/black-cross/backend/models/Vulnerability.ts` - Add soft delete
3. `/home/user/black-cross/backend/models/Asset.ts` - Add soft delete
4. `/home/user/black-cross/backend/models/ThreatActor.ts` - Add soft delete

### Modules Needing CRUD Completion
1. `/home/user/black-cross/backend/modules/threat-hunting/` - Add UPDATE/DELETE
2. `/home/user/black-cross/backend/modules/risk-assessment/` - Add DELETE

### Validation to Enhance
1. Add CHECK constraints to database schema
2. Add custom Sequelize validators to models
3. Enhance Joi schemas with more specific rules

---

## Next Steps

1. **Review Analysis**: Read `/home/user/black-cross/.temp/database-crud-analysis-D8A4F1.md`
2. **Review Recommendations**: Read `/home/user/black-cross/.temp/database-recommendations-D8A4F1.md`
3. **Prioritize**: Choose which recommendations to implement first
4. **Implement**: Follow code examples in recommendations document
5. **Test**: Write tests for all new functionality
6. **Monitor**: Track query performance after changes

---

**Questions?** All details are in the comprehensive analysis documents.
