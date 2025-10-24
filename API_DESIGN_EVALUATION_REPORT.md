# API Design and REST Conventions Evaluation Report

**Project:** Black-Cross Platform
**Date:** 2025-10-24
**Scope:** Backend API Design Review
**Total Endpoints Analyzed:** 276 route definitions across 25 modules

---

## Executive Summary

This report evaluates the REST API design and conventions across the Black-Cross platform backend. The analysis reveals **significant inconsistencies** in endpoint naming, response structures, status code usage, and lack of standardization across modules. While the codebase follows a solid modular architecture with API versioning (`/api/v1/`), **critical improvements** are needed to ensure API consistency, maintainability, and adherence to REST best practices.

**Overall Grade: C+**

### Critical Issues Found:
1. Inconsistent response structure formats (3 different patterns)
2. Improper HTTP status code usage
3. Mixed resource naming conventions (plural vs singular)
4. Lack of pagination standardization
5. No HATEOAS implementation
6. Incomplete API documentation
7. Non-standard error responses
8. Inconsistent query parameter handling

---

## 1. RESTful Endpoint Naming and Structure

### Issues Identified

#### 1.1 Inconsistent Resource Naming (Plural vs Singular)

**Current State:**
```typescript
// INCONSISTENT - Mix of plural and singular
GET /api/v1/incidents              // Plural (correct)
GET /api/v1/incidents/:id          // Plural collection, singular ID (correct)
POST /api/v1/threats               // Plural (correct)
POST /api/v1/playbooks             // Plural (correct)

// BUT some modules use root path:
POST /api/v1/ioc-management/       // No resource name
GET /api/v1/vulnerability-management/  // Module path only
POST /api/v1/collaboration/        // No clear resource
```

**Issue:** Routes are mounted at module paths but don't clearly specify resources. Some use clear resource names (`/incidents`, `/threats`), while others rely on the module prefix without explicit resource naming.

**Files Affected:**
- `/home/user/black-cross/backend/modules/ioc-management/routes/iocRoutes.ts`
- `/home/user/black-cross/backend/modules/vulnerability-management/routes/vulnerabilityRoutes.ts`
- `/home/user/black-cross/backend/modules/collaboration/routes/collaborationRoutes.ts`

**Recommendation:**

```typescript
// RECOMMENDED PATTERN - Always use explicit plural resource names
// File: backend/modules/ioc-management/routes/iocRoutes.ts

// BEFORE (at /api/v1/ioc-management)
router.post('/', iocController.create);        // /api/v1/ioc-management/
router.get('/', iocController.list);           // /api/v1/ioc-management/
router.get('/:id', iocController.getById);     // /api/v1/ioc-management/:id

// AFTER - Use explicit resource paths
router.post('/iocs', iocController.create);        // /api/v1/ioc-management/iocs
router.get('/iocs', iocController.list);           // /api/v1/ioc-management/iocs
router.get('/iocs/:id', iocController.getById);    // /api/v1/ioc-management/iocs/:id

// OR update index.ts to mount more specifically:
// File: backend/index.ts
app.use('/api/v1/iocs', iocManagement);  // Instead of /api/v1/ioc-management
```

#### 1.2 Verb-Based vs Noun-Based Routes

**Current State:**
```typescript
// INCONSISTENT - Mix of REST nouns and RPC-style verbs

// Verb-based (anti-pattern)
POST /api/v1/threat-intelligence/threats/collect      // Should be POST /threats
POST /api/v1/threat-intelligence/threats/categorize   // Should be PATCH /threats/:id
POST /api/v1/threat-intelligence/threats/archive      // Should be PATCH /threats/:id/status
POST /api/v1/threat-intelligence/threats/enrich       // Should be POST /threats/:id/enrichment
POST /api/v1/threat-intelligence/threats/correlate    // Should be GET /threats/:id/correlations
POST /api/v1/threat-intelligence/threats/analyze      // Should be POST /threats/:id/analysis

// Noun-based (correct)
GET /api/v1/incidents/:id/evidence                    // Good - resource-oriented
POST /api/v1/incidents/:id/events                     // Good
GET /api/v1/playbooks/:id/metrics                     // Good
```

**Files Affected:**
- `/home/user/black-cross/backend/modules/threat-intelligence/routes/threatRoutes.ts` (lines 113-147)
- `/home/user/black-cross/backend/modules/incident-response/routes/incidentRoutes.ts` (lines 16-20)

**Recommendation:**

```typescript
// File: backend/modules/threat-intelligence/routes/threatRoutes.ts

// BEFORE - Verb-based anti-patterns
router.post('/threats/collect', validate({ body: threatSchema }), threatController.collectThreat);
router.post('/threats/categorize', validate({ body: categorizationSchema }), threatController.categorizeThreat);
router.post('/threats/archive', validate({ body: archiveSchema }), threatController.archiveThreats);
router.post('/threats/enrich', validate({ body: enrichmentSchema }), threatController.enrichThreat);
router.post('/threats/correlate', validate({ body: correlationSchema }), threatController.correlateThreats);

// AFTER - Noun-based REST patterns
// Creating a threat is just POST /threats
router.post('/threats', validate({ body: threatSchema }), threatController.createThreat);

// Categorization is updating threat properties
router.patch('/threats/:id/categories',
  validate({ params: idSchema, body: categorizationSchema }),
  threatController.updateCategories
);

// Archiving is a status change
router.patch('/threats/:id/status',
  validate({ params: idSchema, body: archiveSchema }),
  threatController.updateStatus
);

// Enrichment is a sub-resource
router.post('/threats/:id/enrichment',
  validate({ params: idSchema, body: enrichmentSchema }),
  threatController.createEnrichment
);
router.get('/threats/:id/enrichment',
  validate({ params: idSchema }),
  threatController.getEnrichment
);

// Correlations are a sub-resource relationship
router.get('/threats/:id/correlations',
  validate({ params: idSchema }),
  threatController.getCorrelations
);

// Analysis is a computed sub-resource
router.post('/threats/:id/analysis',
  validate({ params: idSchema }),
  threatController.createAnalysis
);
router.get('/threats/:id/analysis',
  validate({ params: idSchema }),
  threatController.getAnalysis
);
```

#### 1.3 Inconsistent Nested Resource Patterns

**Current State:**
```typescript
// INCONSISTENT - Different nesting patterns for similar operations

// Pattern 1: Simple nesting
GET /api/v1/incidents/:id/evidence
POST /api/v1/incidents/:id/events

// Pattern 2: Nested with action suffix
POST /api/v1/incidents/:id/prioritize      // Should be PATCH /incidents/:id/priority
POST /api/v1/incidents/:id/execute-workflow
POST /api/v1/playbooks/:id/clone

// Pattern 3: Deep nesting
GET /api/v1/compliance/frameworks/:frameworkId/controls/:controlId
POST /api/v1/compliance/frameworks/:frameworkId/controls/:controlId/evidence
```

**Files Affected:**
- `/home/user/black-cross/backend/modules/incident-response/routes/incidentRoutes.ts`
- `/home/user/black-cross/backend/modules/compliance/routes/complianceRoutes.ts`
- `/home/user/black-cross/backend/modules/automation/routes/playbookRoutes.ts`

**Recommendation:**

```typescript
// RECOMMENDED PATTERNS

// 1. Use nouns for sub-resources, not action verbs
// BEFORE
POST /api/v1/incidents/:id/prioritize
POST /api/v1/incidents/:id/execute-workflow
POST /api/v1/playbooks/:id/clone

// AFTER
PATCH /api/v1/incidents/:id/priority
POST /api/v1/incidents/:id/workflow-executions
POST /api/v1/playbooks           // Clone via body parameter: { source_id: "..." }

// 2. Keep nesting to max 2 levels - use query params for filtering
// BEFORE
GET /api/v1/compliance/frameworks/:frameworkId/controls/:controlId/evidence/:evidenceId

// AFTER
GET /api/v1/compliance/evidence/:evidenceId?framework_id=:frameworkId&control_id=:controlId
// OR create a composite resource
GET /api/v1/compliance/control-evidence/:id
```

---

## 2. HTTP Method Usage

### Issues Identified

#### 2.1 Incorrect Method Selection

**Current State:**
```typescript
// INCORRECT - Using POST for operations that should be PATCH
POST /api/v1/incidents/:id/prioritize        // Should be PATCH
POST /api/v1/threats/categorize               // Should be PATCH
POST /api/v1/playbooks/:id/clone              // Could be POST with different endpoint
POST /api/v1/threat-feeds/:id/toggle          // Should use PATCH, but does!

// INCONSISTENT - Similar operations use different methods
PATCH /api/v1/vulnerability-management/:id/status    // Correct
POST /api/v1/incidents/:id/prioritize               // Should be PATCH
```

**Files Affected:**
- `/home/user/black-cross/backend/modules/incident-response/routes/incidentRoutes.ts` (line 16)
- `/home/user/black-cross/backend/modules/threat-intelligence/routes/threatRoutes.ts` (line 120)
- `/home/user/black-cross/backend/modules/threat-feeds/routes/feedRoutes.ts` (line 21)

**Recommendation:**

```typescript
// File: backend/modules/incident-response/routes/incidentRoutes.ts

// BEFORE
router.post('/incidents/:id/prioritize', incidentController.prioritizeIncident);
router.post('/incidents/:id/execute-workflow', incidentController.executeWorkflow);

// AFTER - Use PATCH for partial updates
router.patch('/incidents/:id/priority',
  validate({
    params: Joi.object({ id: commonSchemas.objectId.required() }),
    body: Joi.object({
      priority: Joi.string().valid('critical', 'high', 'medium', 'low').required(),
      reason: Joi.string().optional()
    })
  }),
  incidentController.updatePriority
);

// For executing workflows, use POST on sub-resource
router.post('/incidents/:id/workflow-executions',
  validate({
    params: Joi.object({ id: commonSchemas.objectId.required() }),
    body: Joi.object({
      workflow_id: Joi.string().required(),
      parameters: Joi.object().optional()
    })
  }),
  incidentController.executeWorkflow
);
```

#### 2.2 Missing OPTIONS Support

**Current State:**
No routes define OPTIONS handlers for CORS preflight requests or API discovery.

**Recommendation:**

```typescript
// File: backend/middleware/cors.ts (new file)
import { Router, Request, Response } from 'express';

export const corsOptionsHandler = (router: Router): void => {
  // Add OPTIONS handler for all routes
  router.options('*', (req: Request, res: Response) => {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Correlation-ID');
    res.status(204).send();
  });
};

// Apply to all module routers
// File: backend/modules/*/index.ts
import { corsOptionsHandler } from '../../middleware/cors';

const router = Router();
corsOptionsHandler(router);
// ... rest of routes
```

---

## 3. Status Code Appropriateness

### Issues Identified

#### 3.1 Incorrect Status Codes in Error Handling

**Current State:**
```typescript
// INCORRECT - Using wrong status codes in controllers

// File: backend/modules/incident-response/controllers/incidentController.ts
async getIncident(req, res) {
  try {
    const incident = await incidentService.getIncident(req.params.id);
    res.json(incident);  // Returns 200 even if null
  } catch (error) {
    res.status(404).json({ error: error.message });  // All errors get 404
  }
}

async createIncident(req, res) {
  try {
    const incident = await incidentService.createIncident(req.body);
    res.status(201).json(incident);  // Correct!
  } catch (error) {
    res.status(400).json({ error: error.message });  // All errors get 400
  }
}

// File: backend/modules/ioc-management/controllers/iocController.ts
async list(req, res) {
  try {
    const items = await iocService.list(req.query);
    res.json(items);  // Missing 200 explicitly, defaults ok
  } catch (error) {
    res.status(400).json({ error: error.message });  // Could be 500 for server errors
  }
}
```

**Files Affected:**
- `/home/user/black-cross/backend/modules/incident-response/controllers/incidentController.ts` (lines 14-42)
- `/home/user/black-cross/backend/modules/ioc-management/controllers/iocController.ts` (lines 4-47)
- `/home/user/black-cross/backend/modules/vulnerability-management/controllers/vulnerabilityController.ts` (lines 4-76)

**Recommendation:**

```typescript
// File: backend/modules/incident-response/controllers/incidentController.ts

// AFTER - Proper status code handling
class IncidentController {
  async getIncident(req: Request, res: Response): Promise<void> {
    try {
      const incident = await incidentService.getIncident(req.params.id);

      if (!incident) {
        res.status(404).json({
          success: false,
          error: 'Incident not found',
          code: 'INCIDENT_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: incident
      });
    } catch (error: unknown) {
      // Differentiate between client and server errors
      if (error instanceof ValidationError) {
        res.status(422).json({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.details
        });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: error.message,
          code: 'NOT_FOUND'
        });
      } else {
        // Server error
        logger.error('Unexpected error in getIncident', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  }

  async createIncident(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const validationResult = validateIncidentInput(req.body);
      if (!validationResult.valid) {
        res.status(422).json({  // 422 for validation errors
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationResult.errors
        });
        return;
      }

      const incident = await incidentService.createIncident(req.body);

      res.status(201).json({  // 201 for created
        success: true,
        data: incident,
        location: `/api/v1/incidents/${incident.id}`  // Include Location header info
      });
    } catch (error: unknown) {
      if (error instanceof ConflictError) {
        res.status(409).json({  // 409 for conflicts
          success: false,
          error: 'Incident already exists',
          code: 'CONFLICT'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }
    }
  }
}
```

#### 3.2 Missing Status Codes

**Issues:**
- No 422 (Unprocessable Entity) for validation errors
- No 409 (Conflict) for duplicate resources
- No 429 (Too Many Requests) responses from rate limiter
- No 503 (Service Unavailable) when dependencies are down

**Recommendation:**

```typescript
// File: backend/utils/http-errors.ts (new file)
export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, details?: any) {
    super(422, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends HttpError {
  constructor(resource: string, id?: string) {
    super(404, 'NOT_FOUND', `${resource}${id ? ` with id ${id}` : ''} not found`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = 'Authentication required') {
    super(401, 'UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}

// File: backend/middleware/errorHandler.ts (update)
import { HttpError } from '../utils/http-errors';

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      details: err.details,
      correlationId: req.correlationId
    });
  } else {
    logger.error('Unexpected error', { error: err, correlationId: req.correlationId });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      correlationId: req.correlationId
    });
  }
});
```

---

## 4. Request/Response Payload Consistency

### Issues Identified

#### 4.1 Inconsistent Response Wrapper Format

**Current State:**
```typescript
// THREE DIFFERENT PATTERNS EXIST:

// Pattern 1: TypeScript example module - Structured with success flag
{
  success: true,
  data: { ... },
  message?: string
}

// Pattern 2: Raw data (incident-response)
res.json(incident);  // Just returns the object directly

// Pattern 3: Mixed (threat-intelligence, auth)
{
  success: true,
  data: { ... },
  pagination?: { page, limit, total, pages }
}

// Error responses also vary:
// Pattern A
{ error: "message" }

// Pattern B
{ success: false, error: "message" }

// Pattern C (auth module)
{ success: false, error: "message", data: null }
```

**Files Affected:**
- `/home/user/black-cross/backend/modules/example-typescript/controller.ts` (standardized)
- `/home/user/black-cross/backend/modules/incident-response/controllers/incidentController.ts` (raw data)
- `/home/user/black-cross/backend/modules/threat-intelligence/controllers/threatController.ts` (mixed)
- `/home/user/black-cross/backend/modules/auth/index.ts` (custom structure)

**Recommendation:**

```typescript
// File: backend/types/api-response.ts (new file)
/**
 * Standard API Response Types
 * All API endpoints MUST use these response formats
 */

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    [key: string]: any;
  };
  links?: HateoasLinks;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
  correlationId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface HateoasLinks {
  self: string;
  first?: string;
  prev?: string;
  next?: string;
  last?: string;
  [rel: string]: string | undefined;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// File: backend/utils/response-builder.ts (new file)
import { Response } from 'express';
import type { ApiSuccessResponse, ApiErrorResponse, PaginationMeta, HateoasLinks } from '../types/api-response';

export class ResponseBuilder {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data: T,
    options?: {
      statusCode?: number;
      message?: string;
      pagination?: PaginationMeta;
      links?: HateoasLinks;
    }
  ): void {
    const response: ApiSuccessResponse<T> = {
      success: true,
      data,
    };

    if (options?.message) {
      response.message = options.message;
    }

    if (options?.pagination || options?.links) {
      response.meta = {};
      if (options.pagination) {
        response.meta.pagination = options.pagination;
      }
    }

    if (options?.links) {
      response.links = options.links;
    }

    res.status(options?.statusCode || 200).json(response);
  }

  /**
   * Send created response (201)
   */
  static created<T>(
    res: Response,
    data: T,
    location?: string,
    message?: string
  ): void {
    if (location) {
      res.setHeader('Location', location);
    }

    ResponseBuilder.success(res, data, {
      statusCode: 201,
      message: message || 'Resource created successfully',
    });
  }

  /**
   * Send no content response (204)
   */
  static noContent(res: Response): void {
    res.status(204).send();
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    statusCode: number,
    error: string,
    code: string,
    details?: any,
    correlationId?: string
  ): void {
    const response: ApiErrorResponse = {
      success: false,
      error,
      code,
    };

    if (details) {
      response.details = details;
    }

    if (correlationId) {
      response.correlationId = correlationId;
    }

    res.status(statusCode).json(response);
  }

  /**
   * Send paginated list response
   */
  static paginatedList<T>(
    res: Response,
    items: T[],
    pagination: PaginationMeta,
    baseUrl: string
  ): void {
    const links: HateoasLinks = {
      self: `${baseUrl}?page=${pagination.page}&limit=${pagination.limit}`,
    };

    if (pagination.hasNextPage) {
      links.next = `${baseUrl}?page=${pagination.page + 1}&limit=${pagination.limit}`;
    }

    if (pagination.hasPreviousPage) {
      links.prev = `${baseUrl}?page=${pagination.page - 1}&limit=${pagination.limit}`;
    }

    if (pagination.totalPages > 0) {
      links.first = `${baseUrl}?page=1&limit=${pagination.limit}`;
      links.last = `${baseUrl}?page=${pagination.totalPages}&limit=${pagination.limit}`;
    }

    ResponseBuilder.success(res, items, {
      pagination,
      links,
    });
  }
}

// USAGE EXAMPLE
// File: backend/modules/incident-response/controllers/incidentController.ts

import { ResponseBuilder } from '../../../utils/response-builder';
import { NotFoundError, ValidationError } from '../../../utils/http-errors';

class IncidentController {
  async createIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const incident = await incidentService.createIncident(req.body);

      ResponseBuilder.created(
        res,
        incident,
        `/api/v1/incidents/${incident.id}`,
        'Incident created successfully'
      );
    } catch (error) {
      next(error);  // Let error handler middleware deal with it
    }
  }

  async getIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const incident = await incidentService.getIncident(req.params.id);

      if (!incident) {
        throw new NotFoundError('Incident', req.params.id);
      }

      ResponseBuilder.success(res, incident);
    } catch (error) {
      next(error);
    }
  }

  async listIncidents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await incidentService.listIncidents(req.query, { page, limit });

      const pagination: PaginationMeta = {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasNextPage: page < Math.ceil(result.total / limit),
        hasPreviousPage: page > 1,
      };

      ResponseBuilder.paginatedList(
        res,
        result.data,
        pagination,
        '/api/v1/incidents'
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteIncident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await incidentService.deleteIncident(req.params.id);
      ResponseBuilder.noContent(res);
    } catch (error) {
      next(error);
    }
  }
}
```

#### 4.2 Inconsistent Pagination Response

**Current State:**
```typescript
// Different pagination formats across modules:

// Threat Intelligence (good structure)
{
  success: true,
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    pages: 5
  }
}

// Incident Response (mixed in with data)
{
  incidents: [...],
  total: 100,
  page: 1,
  limit: 50
}

// Some modules return raw arrays with no pagination metadata
[...]
```

**Recommendation:** Use the `ResponseBuilder.paginatedList()` method shown above for all paginated endpoints.

---

## 5. API Versioning Strategy

### Current State

**Strengths:**
- All routes use `/api/v1/` prefix
- Centralized route mounting in `backend/index.ts`

**Weaknesses:**
- No strategy for introducing v2
- No deprecation headers
- No version negotiation via headers
- Compliance module shows ad-hoc backward compatibility attempt

**Recommendation:**

```typescript
// File: backend/types/api-version.ts (new file)
export enum ApiVersion {
  V1 = 'v1',
  V2 = 'v2',
}

export interface DeprecationInfo {
  version: ApiVersion;
  deprecatedAt: string;
  sunsetAt?: string;
  replacedBy?: string;
  message: string;
}

// File: backend/middleware/api-version.ts (new file)
import { Request, Response, NextFunction } from 'express';
import { ApiVersion } from '../types/api-version';

/**
 * Middleware to handle API versioning
 * Supports both URL-based (/api/v1/) and header-based (Accept: application/vnd.blackcross.v1+json)
 */
export const apiVersionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Extract version from URL
  const urlVersion = req.path.match(/^\/api\/(v\d+)\//)?.[1];

  // Extract version from Accept header
  const acceptHeader = req.headers.accept || '';
  const headerVersion = acceptHeader.match(/application\/vnd\.blackcross\.(v\d+)\+json/)?.[1];

  // URL version takes precedence
  req.apiVersion = (urlVersion || headerVersion || ApiVersion.V1) as ApiVersion;

  // Set version in response header
  res.setHeader('X-API-Version', req.apiVersion);

  next();
};

/**
 * Decorator for deprecated endpoints
 */
export const deprecated = (info: DeprecationInfo) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Set deprecation headers
    res.setHeader('Deprecated', 'true');
    res.setHeader('Sunset', info.sunsetAt || 'TBD');

    if (info.replacedBy) {
      res.setHeader('Link', `<${info.replacedBy}>; rel="successor-version"`);
    }

    res.setHeader('X-Deprecation-Message', info.message);

    // Log deprecation usage
    logger.warn('Deprecated endpoint accessed', {
      path: req.path,
      version: info.version,
      replacedBy: info.replacedBy,
      ip: req.ip,
    });

    next();
  };
};

// USAGE EXAMPLE
// File: backend/modules/compliance/routes/complianceRoutes.ts

import { deprecated } from '../../../middleware/api-version';
import { ApiVersion } from '../../../types/api-version';

// Mark legacy routes as deprecated
router.post('/',
  deprecated({
    version: ApiVersion.V1,
    deprecatedAt: '2025-01-01',
    sunsetAt: '2025-12-31',
    replacedBy: '/api/v2/compliance/frameworks',
    message: 'Use /api/v2/compliance/frameworks instead'
  }),
  validate({ body: complianceSchema }),
  complianceController.create
);

// File: backend/index.ts - Support for v2
import incidentResponseV1 from './modules/incident-response';
import incidentResponseV2 from './modules/incident-response-v2';  // Future

// V1 routes (current)
app.use('/api/v1/incidents', incidentResponseV1);

// V2 routes (when ready)
// app.use('/api/v2/incidents', incidentResponseV2);
```

---

## 6. Query Parameter Handling

### Issues Identified

#### 6.1 Inconsistent Pagination Parameters

**Current State:**
```typescript
// Different parameter names and defaults across modules

// Threat Intelligence
const page = parseInt(req.query.page as string) || 1;
const limit = parseInt(req.query.limit as string) || 20;

// Incident Response
const page = parseInt(req.query.page, 10) || 1;
const limit = parseInt(req.query.limit, 10) || 50;

// Risk Assessment - no pagination visible

// Some use offset instead of page
const offset = parseInt(req.query.offset as string) || 0;
```

**Recommendation:**

```typescript
// File: backend/utils/query-parser.ts (new file)
import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
export const DEFAULT_ORDER = 'asc';

/**
 * Parse pagination parameters from request query
 */
export function parsePaginationParams(req: Request): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(req.query.limit as string) || DEFAULT_LIMIT)
  );
  const offset = (page - 1) * limit;

  const sort = req.query.sort as string | undefined;
  const order = (req.query.order as string)?.toLowerCase() === 'desc' ? 'desc' : 'asc';

  return {
    page,
    limit,
    offset,
    sort,
    order,
  };
}

/**
 * Parse filter parameters (remove pagination/system params)
 */
export function parseFilterParams(req: Request): FilterParams {
  const { page, limit, offset, sort, order, ...filters } = req.query;
  return filters;
}

/**
 * Build query string from params
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString();
}

// USAGE EXAMPLE
// File: backend/modules/incident-response/controllers/incidentController.ts

import { parsePaginationParams, parseFilterParams } from '../../../utils/query-parser';

async listIncidents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pagination = parsePaginationParams(req);
    const filters = parseFilterParams(req);

    const result = await incidentService.listIncidents(filters, pagination);

    const paginationMeta: PaginationMeta = {
      page: pagination.page,
      limit: pagination.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / pagination.limit),
      hasNextPage: pagination.page < Math.ceil(result.total / pagination.limit),
      hasPreviousPage: pagination.page > 1,
    };

    ResponseBuilder.paginatedList(
      res,
      result.data,
      paginationMeta,
      '/api/v1/incidents'
    );
  } catch (error) {
    next(error);
  }
}
```

#### 6.2 No Standard Filter Syntax

**Current State:**
```typescript
// Ad-hoc filtering with no standard
GET /api/v1/threats?severity=high&type=malware&tags=apt,ransomware

// Inconsistent array handling
// Some use comma-separated: tags=apt,ransomware
// No support for: tags[]=apt&tags[]=ransomware
// No support for operators: created_at[gte]=2024-01-01
```

**Recommendation:**

```typescript
// File: backend/utils/filter-builder.ts (new file)
/**
 * Standard filter syntax for API queries
 *
 * Supported formats:
 * - Simple: ?status=active
 * - Array: ?tags[]=malware&tags[]=apt OR ?tags=malware,apt
 * - Range: ?created_at[gte]=2024-01-01&created_at[lte]=2024-12-31
 * - Operators: ?severity[in]=high,critical
 */

export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'exists';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

export class FilterBuilder {
  /**
   * Parse query string into filter conditions
   */
  static parseFilters(query: Record<string, any>): FilterCondition[] {
    const conditions: FilterCondition[] = [];

    Object.entries(query).forEach(([key, value]) => {
      // Handle nested operator syntax: field[operator]=value
      const match = key.match(/^(\w+)\[(\w+)\]$/);

      if (match) {
        const [, field, operator] = match;
        conditions.push({
          field,
          operator: operator as FilterOperator,
          value: this.parseValue(value),
        });
      } else {
        // Simple equality
        conditions.push({
          field: key,
          operator: 'eq',
          value: this.parseValue(value),
        });
      }
    });

    return conditions;
  }

  /**
   * Parse value (handle arrays, comma-separated strings)
   */
  private static parseValue(value: any): any {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').map(v => v.trim());
    }

    // Try to parse as number
    const num = Number(value);
    if (!isNaN(num) && value !== '') {
      return num;
    }

    // Try to parse as boolean
    if (value === 'true') return true;
    if (value === 'false') return false;

    return value;
  }

  /**
   * Convert filter conditions to database query (Sequelize)
   */
  static toSequelizeWhere(conditions: FilterCondition[]): any {
    const where: any = {};

    conditions.forEach(({ field, operator, value }) => {
      switch (operator) {
        case 'eq':
          where[field] = value;
          break;
        case 'ne':
          where[field] = { [Op.ne]: value };
          break;
        case 'gt':
          where[field] = { [Op.gt]: value };
          break;
        case 'gte':
          where[field] = { [Op.gte]: value };
          break;
        case 'lt':
          where[field] = { [Op.lt]: value };
          break;
        case 'lte':
          where[field] = { [Op.lte]: value };
          break;
        case 'in':
          where[field] = { [Op.in]: Array.isArray(value) ? value : [value] };
          break;
        case 'nin':
          where[field] = { [Op.notIn]: Array.isArray(value) ? value : [value] };
          break;
        case 'like':
          where[field] = { [Op.like]: `%${value}%` };
          break;
        case 'exists':
          where[field] = value === true ? { [Op.ne]: null } : { [Op.eq]: null };
          break;
      }
    });

    return where;
  }
}

// USAGE EXAMPLE
// GET /api/v1/incidents?status=open&severity[in]=high,critical&created_at[gte]=2024-01-01

import { FilterBuilder } from '../../../utils/filter-builder';

async listIncidents(req: Request, res: Response): Promise<void> {
  const pagination = parsePaginationParams(req);
  const filters = parseFilterParams(req);

  const conditions = FilterBuilder.parseFilters(filters);
  const where = FilterBuilder.toSequelizeWhere(conditions);

  const result = await Incident.findAndCountAll({
    where,
    limit: pagination.limit,
    offset: pagination.offset,
    order: pagination.sort ? [[pagination.sort, pagination.order]] : [['createdAt', 'desc']],
  });

  // ... response
}
```

---

## 7. Pagination, Filtering, and Sorting

### Issues Identified

**Current State:**
- No cursor-based pagination (only offset-based)
- Inconsistent default limits (20, 50, 100, 1000)
- No max limit enforcement
- Sorting limited to single field
- No support for complex filters
- No filter validation

**Recommendation:**

Implement the utilities shown in sections 6.1 and 6.2 above, plus:

```typescript
// File: backend/middleware/pagination-validator.ts (new file)
import { Request, Response, NextFunction } from 'express';
import { MAX_LIMIT, DEFAULT_LIMIT } from '../utils/query-parser';

/**
 * Middleware to validate and enforce pagination limits
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
  const limit = parseInt(req.query.limit as string);

  if (limit && limit > MAX_LIMIT) {
    res.status(400).json({
      success: false,
      error: `Limit cannot exceed ${MAX_LIMIT}`,
      code: 'INVALID_LIMIT',
    });
    return;
  }

  if (limit && limit < 1) {
    res.status(400).json({
      success: false,
      error: 'Limit must be at least 1',
      code: 'INVALID_LIMIT',
    });
    return;
  }

  next();
};

// Apply to all routes
// File: backend/modules/*/routes/*.ts
import { validatePagination } from '../../../middleware/pagination-validator';

router.get('/incidents', validatePagination, incidentController.list);
```

For cursor-based pagination (recommended for large datasets):

```typescript
// File: backend/utils/cursor-pagination.ts (new file)
import { Request } from 'express';

export interface CursorPaginationParams {
  limit: number;
  cursor?: string;
  order?: 'asc' | 'desc';
}

export interface CursorPaginationResult<T> {
  data: T[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
}

/**
 * Encode cursor (base64 of timestamp:id)
 */
export function encodeCursor(timestamp: Date, id: string): string {
  return Buffer.from(`${timestamp.getTime()}:${id}`).toString('base64');
}

/**
 * Decode cursor
 */
export function decodeCursor(cursor: string): { timestamp: number; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const [timestamp, id] = decoded.split(':');
    return { timestamp: parseInt(timestamp), id };
  } catch {
    return null;
  }
}

// USAGE
// GET /api/v1/incidents?limit=20&cursor=eyJ0aW1lc3RhbXAiOjE3MDk...

async listIncidents(req: Request, res: Response): Promise<void> {
  const limit = parseInt(req.query.limit as string) || 20;
  const cursor = req.query.cursor as string | undefined;

  let where: any = {};

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      where = {
        [Op.or]: [
          { createdAt: { [Op.lt]: new Date(decoded.timestamp) } },
          {
            createdAt: new Date(decoded.timestamp),
            id: { [Op.gt]: decoded.id }
          }
        ]
      };
    }
  }

  const incidents = await Incident.findAll({
    where,
    limit: limit + 1,  // Fetch one extra to determine hasNextPage
    order: [['createdAt', 'desc'], ['id', 'asc']],
  });

  const hasNextPage = incidents.length > limit;
  const data = incidents.slice(0, limit);

  const startCursor = data.length > 0
    ? encodeCursor(data[0].createdAt, data[0].id)
    : undefined;
  const endCursor = data.length > 0
    ? encodeCursor(data[data.length - 1].createdAt, data[data.length - 1].id)
    : undefined;

  res.json({
    success: true,
    data,
    pageInfo: {
      hasNextPage,
      hasPreviousPage: !!cursor,
      startCursor,
      endCursor,
    }
  });
}
```

---

## 8. HATEOAS and Hypermedia Links

### Current State

**No HATEOAS implementation exists.** The API returns data without any hypermedia links.

**Recommendation:**

```typescript
// File: backend/utils/hateoas.ts (new file)
import { Request } from 'express';

export interface Link {
  href: string;
  method?: string;
  rel?: string;
}

export interface HateoasLinks {
  self: Link;
  [rel: string]: Link;
}

/**
 * HATEOAS link builder
 */
export class HateoasBuilder {
  private baseUrl: string;

  constructor(req: Request) {
    this.baseUrl = `${req.protocol}://${req.get('host')}`;
  }

  /**
   * Build links for a resource
   */
  buildResourceLinks(resourceType: string, id: string, availableActions: string[]): HateoasLinks {
    const links: HateoasLinks = {
      self: {
        href: `${this.baseUrl}/api/v1/${resourceType}/${id}`,
        method: 'GET',
      },
    };

    // Add available actions based on permissions/state
    if (availableActions.includes('update')) {
      links.update = {
        href: `${this.baseUrl}/api/v1/${resourceType}/${id}`,
        method: 'PUT',
      };
    }

    if (availableActions.includes('delete')) {
      links.delete = {
        href: `${this.baseUrl}/api/v1/${resourceType}/${id}`,
        method: 'DELETE',
      };
    }

    if (availableActions.includes('patch')) {
      links.patch = {
        href: `${this.baseUrl}/api/v1/${resourceType}/${id}`,
        method: 'PATCH',
      };
    }

    return links;
  }

  /**
   * Build pagination links
   */
  buildPaginationLinks(
    basePath: string,
    page: number,
    totalPages: number,
    queryParams: Record<string, any> = {}
  ): Partial<HateoasLinks> {
    const buildUrl = (p: number): string => {
      const params = new URLSearchParams({ ...queryParams, page: String(p) });
      return `${this.baseUrl}${basePath}?${params.toString()}`;
    };

    const links: Partial<HateoasLinks> = {
      self: { href: buildUrl(page) },
      first: { href: buildUrl(1) },
      last: { href: buildUrl(totalPages) },
    };

    if (page > 1) {
      links.prev = { href: buildUrl(page - 1) };
    }

    if (page < totalPages) {
      links.next = { href: buildUrl(page + 1) };
    }

    return links;
  }

  /**
   * Build related resource links
   */
  buildRelatedLinks(resourceType: string, id: string, relations: string[]): Partial<HateoasLinks> {
    const links: Partial<HateoasLinks> = {};

    relations.forEach(relation => {
      links[relation] = {
        href: `${this.baseUrl}/api/v1/${resourceType}/${id}/${relation}`,
        method: 'GET',
        rel: 'related',
      };
    });

    return links;
  }
}

// USAGE EXAMPLE
// File: backend/modules/incident-response/controllers/incidentController.ts

import { HateoasBuilder } from '../../../utils/hateoas';

async getIncident(req: Request, res: Response): Promise<void> {
  try {
    const incident = await incidentService.getIncident(req.params.id);

    if (!incident) {
      throw new NotFoundError('Incident', req.params.id);
    }

    // Determine available actions based on state and permissions
    const availableActions = ['update', 'delete'];
    if (incident.status !== 'closed') {
      availableActions.push('patch');
    }

    const hateoas = new HateoasBuilder(req);
    const links = {
      ...hateoas.buildResourceLinks('incidents', incident.id, availableActions),
      ...hateoas.buildRelatedLinks('incidents', incident.id, [
        'evidence',
        'timeline',
        'communications',
      ]),
    };

    res.json({
      success: true,
      data: incident,
      _links: links,  // HAL format
    });
  } catch (error) {
    next(error);
  }
}

// Example response:
{
  "success": true,
  "data": {
    "id": "123",
    "title": "Security breach detected",
    "status": "open",
    "severity": "high",
    // ... other fields
  },
  "_links": {
    "self": {
      "href": "http://localhost:8080/api/v1/incidents/123",
      "method": "GET"
    },
    "update": {
      "href": "http://localhost:8080/api/v1/incidents/123",
      "method": "PUT"
    },
    "delete": {
      "href": "http://localhost:8080/api/v1/incidents/123",
      "method": "DELETE"
    },
    "patch": {
      "href": "http://localhost:8080/api/v1/incidents/123",
      "method": "PATCH"
    },
    "evidence": {
      "href": "http://localhost:8080/api/v1/incidents/123/evidence",
      "method": "GET",
      "rel": "related"
    },
    "timeline": {
      "href": "http://localhost:8080/api/v1/incidents/123/timeline",
      "method": "GET",
      "rel": "related"
    },
    "communications": {
      "href": "http://localhost:8080/api/v1/incidents/123/communications",
      "method": "GET",
      "rel": "related"
    }
  }
}
```

---

## 9. API Documentation Completeness

### Current State

**Strengths:**
- Swagger/OpenAPI configuration exists (`backend/config/swagger.ts`)
- Standard schemas defined for errors, pagination
- Security schemes configured (Bearer JWT)

**Weaknesses:**
- Only threat-intelligence module has inline Swagger docs
- Most controllers lack JSDoc comments
- No request/response examples in most routes
- Swagger annotations missing from 90%+ of endpoints

**Files with Documentation:**
- `/home/user/black-cross/backend/modules/threat-intelligence/routes/threatRoutes.ts` (lines 29-68)

**Files Missing Documentation:**
- All other 24 module route files
- All controller files except example-typescript

**Recommendation:**

```typescript
// TEMPLATE for documenting endpoints
// File: backend/modules/incident-response/routes/incidentRoutes.ts

/**
 * @swagger
 * /api/v1/incidents:
 *   post:
 *     summary: Create a new incident
 *     description: Create a new security incident with optional auto-prioritization and workflow triggering
 *     tags: [Incident Response]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - severity
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 description: Incident title
 *                 example: "Suspicious login attempts detected"
 *               severity:
 *                 type: string
 *                 enum: [critical, high, medium, low]
 *                 description: Incident severity level
 *                 example: "high"
 *               description:
 *                 type: string
 *                 description: Detailed incident description
 *                 example: "Multiple failed login attempts from IP 192.168.1.100"
 *               auto_prioritize:
 *                 type: boolean
 *                 description: Automatically calculate priority score
 *                 default: false
 *               auto_trigger_workflows:
 *                 type: boolean
 *                 description: Automatically trigger response workflows
 *                 default: false
 *     responses:
 *       201:
 *         description: Incident created successfully
 *         headers:
 *           Location:
 *             description: URL of created incident
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Incident'
 *                 message:
 *                   type: string
 *                   example: "Incident created successfully"
 *             example:
 *               success: true
 *               data:
 *                 id: "inc_123456"
 *                 title: "Suspicious login attempts detected"
 *                 severity: "high"
 *                 status: "open"
 *                 created_at: "2025-10-24T14:30:00Z"
 *               message: "Incident created successfully"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/incidents', incidentController.createIncident);

/**
 * @swagger
 * /api/v1/incidents:
 *   get:
 *     summary: List all incidents
 *     description: Retrieve a paginated list of incidents with optional filtering
 *     tags: [Incident Response]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortParam'
 *       - $ref: '#/components/parameters/OrderParam'
 *       - name: status
 *         in: query
 *         description: Filter by incident status
 *         schema:
 *           type: string
 *           enum: [open, investigating, contained, resolved, closed]
 *       - name: severity
 *         in: query
 *         description: Filter by severity
 *         schema:
 *           type: string
 *           enum: [critical, high, medium, low]
 *       - name: created_at[gte]
 *         in: query
 *         description: Filter incidents created after this date
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: created_at[lte]
 *         in: query
 *         description: Filter incidents created before this date
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: List of incidents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Incident'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                 _links:
 *                   type: object
 *                   description: HATEOAS navigation links
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/incidents', incidentController.listIncidents);

// Also define schemas
/**
 * @swagger
 * components:
 *   schemas:
 *     Incident:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique incident identifier
 *           example: "inc_123456"
 *         title:
 *           type: string
 *           description: Incident title
 *         severity:
 *           type: string
 *           enum: [critical, high, medium, low]
 *         status:
 *           type: string
 *           enum: [open, investigating, contained, resolved, closed]
 *         description:
 *           type: string
 *         priority_score:
 *           type: number
 *           description: Calculated priority score (0-100)
 *         assigned_to:
 *           type: string
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */
```

**Action Items:**
1. Add Swagger annotations to all 276 endpoints
2. Define schemas for all resource types
3. Document all query parameters
4. Include example requests/responses
5. Document error codes and meanings

---

## 10. Backward Compatibility

### Current State

**Observations:**
- Compliance module attempts backward compatibility with "legacy CRUD routes"
- No formal versioning strategy
- No deprecation warnings
- Changes could break existing clients

**Files Affected:**
- `/home/user/black-cross/backend/modules/compliance/routes/complianceRoutes.ts` (lines 38-46)

**Recommendation:**

```typescript
// File: backend/utils/changelog.ts (new file)
/**
 * API Changelog
 * Track breaking and non-breaking changes
 */

export interface ChangelogEntry {
  version: string;
  date: string;
  type: 'breaking' | 'feature' | 'fix' | 'deprecation';
  module: string;
  description: string;
  migration?: string;
}

export const API_CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v1.1.0',
    date: '2025-11-01',
    type: 'deprecation',
    module: 'compliance',
    description: 'Legacy CRUD routes deprecated in favor of framework-specific routes',
    migration: 'Use /api/v1/compliance/frameworks instead of /api/v1/compliance',
  },
  {
    version: 'v1.1.0',
    date: '2025-11-01',
    type: 'breaking',
    module: 'threat-intelligence',
    description: 'Changed /threats/collect to POST /threats',
    migration: 'Update endpoint from /threats/collect to /threats',
  },
  // ...
];

// File: backend/routes/changelog.ts (new file)
import express from 'express';
import { API_CHANGELOG } from '../utils/changelog';

const router = express.Router();

/**
 * @swagger
 * /api/v1/changelog:
 *   get:
 *     summary: API Changelog
 *     description: Get API version changelog with breaking changes and deprecations
 *     tags: [Meta]
 *     parameters:
 *       - name: version
 *         in: query
 *         description: Filter by version
 *         schema:
 *           type: string
 *       - name: type
 *         in: query
 *         description: Filter by change type
 *         schema:
 *           type: string
 *           enum: [breaking, feature, fix, deprecation]
 *     responses:
 *       200:
 *         description: Changelog entries
 */
router.get('/changelog', (req, res) => {
  let entries = API_CHANGELOG;

  if (req.query.version) {
    entries = entries.filter(e => e.version === req.query.version);
  }

  if (req.query.type) {
    entries = entries.filter(e => e.type === req.query.type);
  }

  res.json({
    success: true,
    data: entries,
  });
});

export default router;

// Mount in backend/index.ts
import changelog from './routes/changelog';
app.use('/api/v1', changelog);
```

**Backward Compatibility Checklist:**
- [ ] Never remove fields from responses (mark as deprecated instead)
- [ ] Never change field types
- [ ] Never change endpoint URLs without deprecation period
- [ ] Always add new optional fields (never required)
- [ ] Use API versioning for breaking changes
- [ ] Provide migration guides for deprecated endpoints
- [ ] Monitor deprecated endpoint usage
- [ ] Give minimum 6 months notice before removing deprecated endpoints

---

## Summary of Recommendations

### Priority 1 (Critical - Implement Immediately)

1. **Standardize Response Format**
   - Implement `ResponseBuilder` utility
   - Apply to all controllers
   - Files: Create `/home/user/black-cross/backend/utils/response-builder.ts`

2. **Fix HTTP Status Codes**
   - Create custom error classes
   - Update all controllers to use proper status codes
   - Files: Create `/home/user/black-cross/backend/utils/http-errors.ts`

3. **Standardize Route Naming**
   - Use plural resource names
   - Remove verb-based routes
   - Files: All route files in `/home/user/black-cross/backend/modules/*/routes/`

### Priority 2 (High - Implement Within 2 Weeks)

4. **Implement Query Parameter Utilities**
   - Create pagination parser
   - Create filter builder
   - Files: Create `/home/user/black-cross/backend/utils/query-parser.ts` and `filter-builder.ts`

5. **Add HATEOAS Links**
   - Implement link builder
   - Add to all resource responses
   - Files: Create `/home/user/black-cross/backend/utils/hateoas.ts`

6. **Document All Endpoints**
   - Add Swagger annotations to all routes
   - Define all schemas
   - Files: All route files

### Priority 3 (Medium - Implement Within 1 Month)

7. **API Versioning Strategy**
   - Implement deprecation middleware
   - Add version negotiation
   - Create changelog endpoint
   - Files: Create `/home/user/black-cross/backend/middleware/api-version.ts`

8. **Improve Pagination**
   - Add cursor-based pagination
   - Enforce max limits
   - Files: Create `/home/user/black-cross/backend/utils/cursor-pagination.ts`

### Priority 4 (Low - Implement Within 2 Months)

9. **API Discovery**
   - Add OPTIONS handlers
   - Implement API root endpoint with links
   - Files: Update all route files

10. **Monitoring & Analytics**
    - Track deprecated endpoint usage
    - Monitor API performance
    - Files: Create `/home/user/black-cross/backend/middleware/api-analytics.ts`

---

## Conclusion

The Black-Cross API has a solid foundation with modular architecture and API versioning, but requires significant standardization work to meet REST best practices. The most critical issues are:

1. **Inconsistent response formats** across modules
2. **Improper HTTP status code usage**
3. **Non-RESTful route naming** (verb-based vs noun-based)
4. **Lack of API documentation** for 90% of endpoints
5. **No HATEOAS implementation**

Implementing the recommendations in this report will result in:
- **Better developer experience** with consistent, predictable APIs
- **Easier client integration** with HATEOAS and proper documentation
- **Improved maintainability** with standardized utilities
- **Future-proof architecture** with versioning strategy
- **Professional API** meeting industry REST standards

**Estimated Implementation Time:** 4-6 weeks for all priorities 1-3

---

**Report Generated:** 2025-10-24
**Reviewer:** Claude Code Agent
**Next Review:** After Priority 1-2 implementations
