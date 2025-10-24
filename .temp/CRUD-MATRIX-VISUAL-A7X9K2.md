# Black-Cross API - CRUD Operations Matrix

## Visual Summary - All 26 Modules

### Legend
- ✅ = Operation exists and fully implemented
- ❌ = Operation missing
- 🔧 = Specialized module (non-CRUD by design)
- 🟢 = Complete CRUD
- 🟡 = Incomplete CRUD
- 🔵 = Specialized

---

## 🟢 COMPLETE CRUD MODULES (18/26 - 70%)

| # | Module | Base Path | C | R | U | D | Additional Features |
|---|--------|-----------|---|---|---|---|---------------------|
| 1 | threat-intelligence | `/api/v1/threat-intelligence/threats` | ✅ | ✅ | ✅ | ✅ | Stream, categorize, enrich, correlate |
| 2 | threat-intelligence/taxonomies | `/api/v1/threat-intelligence/taxonomies` | ✅ | ✅ | ✅ | ✅ | Import/export |
| 3 | incident-response | `/api/v1/incident-response/incidents` | ✅ | ✅ | ✅ | ✅ | Workflow, timeline, evidence |
| 4 | vulnerability-management | `/api/v1/vulnerability-management` | ✅ | ✅ | ✅ | ✅ | Scanning, status updates |
| 5 | ioc-management | `/api/v1/ioc-management` | ✅ | ✅ | ✅ | ✅ | Bulk import, export, check |
| 6 | threat-actors | `/api/v1/threat-actors` | ✅ | ✅ | ✅ | ✅ | Campaigns, TTPs |
| 7 | siem | `/api/v1/siem` | ✅ | ✅ | ✅ | ✅ | Log correlation, alerts |
| 8 | automation/playbooks | `/api/v1/automation/playbooks` | ✅ | ✅ | ✅ | ✅ | Execute, clone, test |
| 9 | automation/integrations | `/api/v1/automation/integrations` | ✅ | ✅ | ✅ | ✅ | Test integrations |
| 10 | malware-analysis | `/api/v1/malware-analysis` | ✅ | ✅ | ✅ | ✅ | Sandbox analysis |
| 11 | dark-web | `/api/v1/dark-web` | ✅ | ✅ | ✅ | ✅ | Monitoring, detection |
| 12 | compliance | `/api/v1/compliance` | ✅ | ✅ | ✅ | ✅ | Frameworks, gap analysis |
| 13 | collaboration | `/api/v1/collaboration` | ✅ | ✅ | ✅ | ✅ | Team workspace |
| 14 | reporting | `/api/v1/reporting` | ✅ | ✅ | ✅ | ✅ | Templates, scheduling |
| 15 | threat-feeds | `/api/v1/threat-feeds` | ✅ | ✅ | ✅ | ✅ | Refresh, toggle, stats |
| 16 | playbooks | `/api/v1/playbooks` | ✅ | ✅ | ✅ | ✅ | Execution management |
| 17 | case-management | `/api/v1/case-management/cases` | ✅ | ✅ | ✅ | ✅ | Tasks, comments, timeline |
| 18 | draft-workspace | `/api/v1/draft-workspace/drafts` | ✅ | ✅ | ✅ | ✅ | Revisions, submit, discard |

---

## 🟡 INCOMPLETE CRUD MODULES (2/26 - 8%)

| # | Module | Base Path | C | R | U | D | Missing Operations |
|---|--------|-----------|---|---|---|---|-------------------|
| 19 | **threat-hunting** | `/api/v1/threat-hunting/sessions` | ✅ | ✅ | ❌ | ❌ | **UPDATE /sessions/:id**<br>**DELETE /sessions/:id** |
| 20 | **risk-assessment** | `/api/v1/risk-assessment` | ✅ | ✅ | ✅ | ❌ | **DELETE /models/:id** |

---

## 🔵 SPECIALIZED MODULES (6/26 - 22%)

These modules are designed for specific functional operations, not CRUD:

| # | Module | Base Path | Pattern | Key Endpoints |
|---|--------|-----------|---------|---------------|
| 21 | auth | `/api/v1/auth` | 🔧 Authentication | POST /login<br>POST /logout<br>GET /me |
| 22 | dashboard | `/api/v1/dashboard` | 🔧 Read-only | GET /stats |
| 23 | ai | `/api/v1/ai` | 🔧 Functional | POST /fix-spelling<br>POST /summarize<br>POST /analyze-threat<br>POST /extract-iocs |
| 24 | code-review | `/api/v1/code-review` | 🔧 Execution | POST /execute<br>GET /agents<br>GET /health |
| 25 | stix | `/api/v1/stix` | 🔧 Import/Export | POST /export<br>POST /import<br>POST /convert<br>POST /parse-pattern |
| 26 | metrics | `/api/v1/metrics` | 🔧 Telemetry | POST /metrics<br>POST /metrics/query<br>GET /metrics/security |

---

## Detailed CRUD Breakdown

### CREATE Operations

**✅ Implemented: 24/26 modules (92%)**

Missing CREATE: None (all modules that require CREATE have it)

---

### READ Operations

**✅ Implemented: 26/26 modules (100%)**

All modules have READ operations (list and/or single)

---

### UPDATE Operations

**✅ Implemented: 19/20 modules requiring UPDATE (95%)**

**❌ Missing UPDATE (1 module)**:
- threat-hunting: Cannot update hunt session details (hypothesis, status, assignee, etc.)

---

### DELETE Operations

**✅ Implemented: 18/20 modules requiring DELETE (90%)**

**❌ Missing DELETE (2 modules)**:
- threat-hunting: Cannot delete completed/archived hunt sessions
- risk-assessment: Cannot delete custom risk scoring models

---

## HTTP Methods Distribution

### Standard CRUD Modules (18 modules)

```
POST   /resource         → Create resource         (18/18 ✅)
GET    /resource         → List resources          (18/18 ✅)
GET    /resource/:id     → Get single resource     (18/18 ✅)
PUT    /resource/:id     → Update resource         (18/18 ✅)
DELETE /resource/:id     → Delete resource         (18/18 ✅)
```

### Incomplete CRUD Modules (2 modules)

**threat-hunting**:
```
POST   /sessions         → Create session          (✅)
GET    /sessions         → List sessions           (✅)
GET    /sessions/:id     → Get session             (✅)
PUT    /sessions/:id     → Update session          (❌ MISSING)
DELETE /sessions/:id     → Delete session          (❌ MISSING)
```

**risk-assessment**:
```
POST   /models           → Create model            (✅)
PUT    /models/:id       → Update model            (✅)
DELETE /models/:id       → Delete model            (❌ MISSING)
```

---

## Validation Coverage

### ✅ Complete Validation (24/26 - 92%)

All CRUD modules use Joi validation schemas:
- Request body validation for CREATE and UPDATE
- Parameter validation for resource IDs
- Query parameter validation for list operations

**Pattern**:
```typescript
import { validate, commonSchemas, Joi } from '../../../middleware/validator';

router.post('/', validate({ body: createSchema }), controller.create);
router.put('/:id', validate({
  params: Joi.object({ id: commonSchemas.objectId.required() }),
  body: updateSchema,
}), controller.update);
```

---

## Authentication Coverage

### Pattern A: Custom Middleware (18 modules)
```typescript
router.post('/resource', validate({ body: schema }), controller.create);
// Auth handled by global middleware
```

### Pattern B: Capability-Based (3 modules)
```typescript
import { requireCapability } from '../../middleware/access-control';

router.post('/resource',
  requireCapability(CAPABILITIES.RESOURCE_CREATE),
  controller.create
);
```

**Modules using capability-based auth**:
- playbooks
- ai
- stix

**Recommendation**: Migrate all modules to capability-based for granular RBAC

---

## Rate Limiting Coverage

### ✅ Explicitly Configured: 1 module
- threat-intelligence (100 req/15min)

### ⚠ Using Default: 25 modules
- Rely on global rate limiting middleware

**Recommendation**: Apply explicit rate limiting to all modules:
- High-frequency reads: 1000 req/15min (dashboard, metrics)
- Standard reads: 100 req/15min
- Writes: 50 req/15min
- Sensitive ops: 10 req/15min

---

## Response Format Patterns

### Format 1: Success Wrapper (Most Common - 20 modules)
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... }
}
```

### Format 2: Direct Data (6 modules)
```json
{
  "id": "...",
  "name": "...",
  ...
}
```

**Recommendation**: Standardize all on Format 1 with:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationMeta;
  meta?: ResponseMeta;
}
```

---

## Status Code Usage

### Current Practice
- ✅ 200 OK - GET, PUT, PATCH
- ✅ 201 Created - POST (threat-intelligence only)
- ⚠ 200 OK - POST (most modules, should be 201)
- ⚠ 200 OK - DELETE (most modules, should be 204)
- ✅ 400 Bad Request - Validation errors
- ✅ 401 Unauthorized - Auth failures
- ✅ 404 Not Found - Resource not found
- ✅ 500 Internal Server Error - Server errors

### Recommended Practice
- POST create: **201 Created**
- GET: **200 OK**
- PUT/PATCH update: **200 OK**
- DELETE: **204 No Content**
- Validation error: **400 Bad Request**
- Auth error: **401 Unauthorized**
- Permission error: **403 Forbidden**
- Not found: **404 Not Found**
- Conflict: **409 Conflict**
- Rate limit: **429 Too Many Requests**
- Server error: **500 Internal Server Error**

---

## Implementation Effort Estimation

### Phase 1: Complete Missing CRUD (1-2 weeks)

| Task | Module | Effort | Priority |
|------|--------|--------|----------|
| Add UPDATE /sessions/:id | threat-hunting | 2 hours | HIGH |
| Add DELETE /sessions/:id | threat-hunting | 1 hour | HIGH |
| Add DELETE /models/:id | risk-assessment | 1 hour | MEDIUM |
| Add service layer methods | Both modules | 2 hours | HIGH |
| Add validators | Both modules | 1 hour | HIGH |
| Write tests | Both modules | 4 hours | HIGH |
| **Total** | | **11 hours** | |

### Phase 2: Standardization (4-6 weeks)

| Task | Effort | Priority |
|------|--------|----------|
| Response format unification | 2 weeks | HIGH |
| Status code consistency | 1 week | MEDIUM |
| Capability-based auth migration | 3 weeks | HIGH |
| Rate limiting standardization | 1 week | MEDIUM |
| **Total** | **7 weeks** | |

### Phase 3: Documentation (2-3 weeks)

| Task | Effort | Priority |
|------|--------|----------|
| OpenAPI/Swagger setup | 1 week | MEDIUM |
| Endpoint documentation | 2 weeks | MEDIUM |
| **Total** | **3 weeks** | |

---

## Quick Reference: Missing Operations

### threat-hunting Module

**File to modify**: `/home/user/black-cross/backend/modules/threat-hunting/routes/huntRoutes.ts`

**Add these routes**:
```typescript
// UPDATE hunt session
router.put('/sessions/:id', validate({
  params: Joi.object({ id: commonSchemas.objectId.required() }),
  body: huntSessionUpdateSchema,
}), huntController.updateSession);

// DELETE hunt session
router.delete('/sessions/:id', validate({
  params: Joi.object({ id: commonSchemas.objectId.required() })
}), huntController.deleteSession);
```

---

### risk-assessment Module

**File to modify**: `/home/user/black-cross/backend/modules/risk-assessment/routes/riskRoutes.ts`

**Add this route**:
```typescript
// DELETE risk model
router.delete('/models/:id', riskController.deleteModel);
```

**Important**: Add "in-use" validation to prevent deletion of active models:
```typescript
const inUse = await riskService.isModelInUse(id);
if (inUse) {
  return res.status(409).json({
    success: false,
    error: 'Cannot delete model that is currently in use'
  });
}
```

---

## Overall Statistics

### CRUD Completeness
- **Complete CRUD**: 18/20 modules = **90%**
- **Incomplete CRUD**: 2/20 modules = **10%**
- **Specialized modules**: 6/26 = **23%**

### Operation Coverage
- **CREATE**: 20/20 = **100%**
- **READ**: 20/20 = **100%**
- **UPDATE**: 19/20 = **95%**
- **DELETE**: 18/20 = **90%**

### Overall API Maturity
**8/10** - Production-ready with minor improvements needed

---

## Next Steps

1. ✅ Review this CRUD matrix
2. ⏭ Implement missing UPDATE/DELETE operations (threat-hunting, risk-assessment)
3. ⏭ Write comprehensive tests for new endpoints
4. ⏭ Standardize response formats across all modules
5. ⏭ Migrate to capability-based authentication
6. ⏭ Generate OpenAPI documentation
7. ⏭ Implement performance optimizations (caching, rate limiting)

---

**Matrix compiled**: 2025-10-24
**Analysis ID**: A7X9K2
**Status**: ✅ Complete
