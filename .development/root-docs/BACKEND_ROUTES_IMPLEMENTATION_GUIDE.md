# Backend Routes Implementation Guide

This document provides the complete implementation pattern for adding missing backend routes to align with frontend service APIs.

## Implementation Pattern

For each module, follow this 3-step pattern:

### Step 1: Update Routes (`routes/*Routes.ts`)
Add route definitions that map to frontend service API calls.

### Step 2: Update Controller (`controllers/*Controller.ts`)
Add controller methods that handle the HTTP requests and responses.

### Step 3: Connect to Service (`services/*Service.ts`)
Call existing service layer methods (services already implement comprehensive functionality).

---

## Compliance Module (10 missing routes)

### Frontend Service Endpoints Required
```
GET    /compliance/frameworks
GET    /compliance/frameworks/:id
POST   /compliance/frameworks
PUT    /compliance/frameworks/:id
DELETE /compliance/frameworks/:id
GET    /compliance/frameworks/:frameworkId/controls
PUT    /compliance/frameworks/:frameworkId/controls/:controlId
POST   /compliance/frameworks/:frameworkId/analyze-gaps
GET    /compliance/frameworks/:frameworkId/gaps
GET    /compliance/audit-logs
POST   /compliance/frameworks/:frameworkId/reports
GET    /compliance/frameworks/:frameworkId/reports
GET    /compliance/reports
GET    /compliance/reports/:reportId/export
POST   /compliance/frameworks/:frameworkId/controls/:controlId/evidence
DELETE /compliance/frameworks/:frameworkId/controls/:controlId/evidence/:evidenceId
```

### Routes Implementation
```typescript
// backend/modules/compliance/routes/complianceRoutes.ts
import express from 'express';
const router = express.Router();
import complianceController from '../controllers/complianceController';
import { validate, commonSchemas, Joi } from '../../../middleware/validator';
import validatorSchemas from '../validators/complianceValidator';

const { complianceSchema, complianceUpdateSchema } = validatorSchemas;

// Framework routes
router.get('/frameworks', complianceController.getFrameworks);
router.get('/frameworks/:id', complianceController.getFramework);
router.post('/frameworks', validate({ body: complianceSchema }), complianceController.createFramework);
router.put('/frameworks/:id', validate({ body: complianceUpdateSchema }), complianceController.updateFramework);
router.delete('/frameworks/:id', complianceController.deleteFramework);

// Control routes
router.get('/frameworks/:frameworkId/controls', complianceController.getControls);
router.put('/frameworks/:frameworkId/controls/:controlId', complianceController.updateControl);

// Gap analysis routes
router.post('/frameworks/:frameworkId/analyze-gaps', complianceController.analyzeGaps);
router.get('/frameworks/:frameworkId/gaps', complianceController.getGaps);

// Audit log routes
router.get('/audit-logs', complianceController.getAuditLogs);

// Report routes
router.post('/frameworks/:frameworkId/reports', complianceController.generateReport);
router.get('/frameworks/:frameworkId/reports', complianceController.getFrameworkReports);
router.get('/reports', complianceController.getAllReports);
router.get('/reports/:reportId/export', complianceController.exportReport);

// Evidence routes
router.post('/frameworks/:frameworkId/controls/:controlId/evidence', complianceController.uploadEvidence);
router.delete('/frameworks/:frameworkId/controls/:controlId/evidence/:evidenceId', complianceController.deleteEvidence);

export default router;
```

### Controller Implementation
```typescript
// backend/modules/compliance/controllers/complianceController.ts
import complianceService from '../services/complianceService';

class ComplianceController {
  // Framework methods
  async getFrameworks(req, res) {
    try {
      const frameworks = await complianceService.listFrameworks(req.query);
      res.json({ success: true, data: frameworks });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getFramework(req, res) {
    try {
      const framework = await complianceService.getFramework(req.params.id);
      res.json({ success: true, data: framework });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async createFramework(req, res) {
    try {
      const framework = await complianceService.createFramework(req.body);
      res.status(201).json({ success: true, data: framework });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateFramework(req, res) {
    try {
      const framework = await complianceService.updateFramework(req.params.id, req.body);
      res.json({ success: true, data: framework });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteFramework(req, res) {
    try {
      await complianceService.deleteFramework(req.params.id);
      res.json({ success: true, message: 'Framework deleted' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Control methods
  async getControls(req, res) {
    try {
      const controls = await complianceService.getFrameworkControls(req.params.frameworkId, req.query);
      res.json({ success: true, data: controls });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateControl(req, res) {
    try {
      const control = await complianceService.updateControlImplementation(
        req.params.frameworkId,
        req.params.controlId,
        req.body
      );
      res.json({ success: true, data: control });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Gap analysis methods
  async analyzeGaps(req, res) {
    try {
      const gaps = await complianceService.analyzeComplianceGaps(req.params.frameworkId);
      res.json({ success: true, data: gaps });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getGaps(req, res) {
    try {
      const gaps = await complianceService.getComplianceGaps(req.params.frameworkId);
      res.json({ success: true, data: gaps });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  // Audit log methods
  async getAuditLogs(req, res) {
    try {
      const logs = await complianceService.getAuditTrail(req.query);
      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Report methods
  async generateReport(req, res) {
    try {
      const report = await complianceService.generateComplianceReport(req.params.frameworkId);
      res.json({ success: true, data: report });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getFrameworkReports(req, res) {
    try {
      const reports = await complianceService.getFrameworkReports(req.params.frameworkId);
      res.json({ success: true, data: reports });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getAllReports(req, res) {
    try {
      const reports = await complianceService.getAllReports(req.query);
      res.json({ success: true, data: reports });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async exportReport(req, res) {
    try {
      const { format } = req.query;
      const file = await complianceService.exportReport(req.params.reportId, format);
      res.setHeader('Content-Type', `application/${format}`);
      res.send(file);
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Evidence methods
  async uploadEvidence(req, res) {
    try {
      const { frameworkId, controlId } = req.params;
      const evidence = await complianceService.attachEvidence(
        frameworkId,
        controlId,
        req.file,
        req.body.description
      );
      res.json({ success: true, data: evidence });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteEvidence(req, res) {
    try {
      const { frameworkId, controlId, evidenceId } = req.params;
      await complianceService.removeEvidence(frameworkId, controlId, evidenceId);
      res.json({ success: true, message: 'Evidence deleted' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Legacy CRUD methods (keep for backward compatibility)
  async create(req, res) {
    try {
      const item = await complianceService.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const item = await complianceService.getById(req.params.id);
      res.json(item);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async list(req, res) {
    try {
      const items = await complianceService.list(req.query);
      res.json(items);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const item = await complianceService.update(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await complianceService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new ComplianceController();
```

---

## Summary of Remaining Modules

### Dark Web (12 missing routes)
**Endpoints needed:**
- Sources, alerts, mentions management
- Threat posts, credential leaks
- Paste monitoring, marketplace tracking

**Service methods available:** All comprehensive methods exist in `darkWebService.ts`

### Malware Analysis (15 missing routes)
**Endpoints needed:**
- Sample upload/download, analysis submission
- Static/dynamic/behavioral analysis results
- YARA rule generation and testing
- IoC extraction, sandbox management

**Service methods available:** All comprehensive methods exist in `malwareService.ts`

### Reporting (20 missing routes)
**Endpoints needed:**
- Report templates, generation, scheduling
- Dashboard queries, metrics
- Custom reports, data export
- Share and distribution

**Service methods available:** All comprehensive methods exist in `reportingService.ts`

### SIEM (23 missing routes)
**Endpoints needed:**
- Log ingestion, search, analysis
- Alert management, rules, correlation
- Threat detection, incident creation
- Dashboard, real-time monitoring

**Service methods available:** All comprehensive methods exist in `siemService.ts`

### Collaboration (24 missing routes)
**Endpoints needed:**
- Workspace, team, project management
- Task assignment, tracking, comments
- Wiki pages, chat channels, messages
- Activity feeds, notifications

**Service methods available:** All comprehensive methods exist in `collaborationService.ts`

### Threat Hunting (30 missing routes)
**Endpoints needed:**
- Hunt campaigns, hypotheses
- Data collection, queries
- IOC/behavioral pattern searches
- Threat analysis, playbook execution
- Intelligence gathering, reporting

**Service methods available:** All comprehensive methods exist in `huntingService.ts`

---

## Implementation Priority

1. ✅ **Completed**: threat-actors, threat-feeds, ioc-management, vulnerability-management
2. **Next**: compliance (demonstrated above)
3. **Then**: dark-web, malware-analysis
4. **Finally**: reporting, siem, collaboration, threat-hunting

## Key Points

- All backend services already have comprehensive methods implemented
- Pattern is consistent: routes → controller → service
- Controllers format responses as `{ success: boolean, data: any }` or `{ success: boolean, error: string }`
- Use existing validators from `validators/*Validator.ts`
- Maintain backward compatibility with legacy CRUD methods
- Follow TypeScript strict typing where modules are migrated

## Testing Approach

After implementing routes:
1. Start backend: `npm run dev:backend`
2. Test each endpoint with curl or Postman
3. Verify response structure matches frontend expectations
4. Check error handling for invalid inputs
5. Run existing Cypress E2E tests to validate integration
