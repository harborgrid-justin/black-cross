/**
 * SIEM Module
 * 
 * Security Information & Event Management
 * Main entry point for the SIEM module with all API endpoints
 */

const express = require('express');
const router = express.Router();
const services = require('./services');
const validators = require('./validators');

// ==================== Module Health Check ====================

/**
 * Health check
 * GET /api/v1/siem/health
 */
router.get('/health', (req, res) => {
  res.json({
    module: 'siem',
    status: 'operational',
    version: '1.0.0',
    features: [
      'log-collection',
      'event-correlation',
      'detection-rules',
      'alert-management',
      'dashboards',
      'forensic-analysis',
      'compliance-reporting'
    ],
    timestamp: new Date().toISOString()
  });
});

// ==================== Log Collection Endpoints ====================

/**
 * Ingest log event
 * POST /api/v1/siem/logs/ingest
 */
router.post('/logs/ingest', async (req, res) => {
  try {
    const { error, value } = validators.logIngestionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const event = await services.logCollectionService.ingestLog(value);
    
    // Evaluate against detection rules
    await services.ruleEngineService.evaluateEvent(event);
    
    // Check for correlations
    await services.eventCorrelationService.correlateEvent(event);

    res.status(201).json({
      success: true,
      data: event.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Batch ingest logs
 * POST /api/v1/siem/logs/ingest/batch
 */
router.post('/logs/ingest/batch', async (req, res) => {
  try {
    const { logs } = req.body;
    if (!Array.isArray(logs)) {
      return res.status(400).json({ error: 'Logs must be an array' });
    }

    const results = await services.logCollectionService.ingestBatch(logs);

    res.status(201).json({
      success: true,
      data: results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get ingestion statistics
 * GET /api/v1/siem/logs/statistics
 */
router.get('/logs/statistics', async (req, res) => {
  try {
    const stats = await services.logCollectionService.getStatistics(req.query.time_range);

    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get log sources
 * GET /api/v1/siem/logs/sources
 */
router.get('/logs/sources', async (req, res) => {
  try {
    const { logSourceRepository } = require('./repositories');
    const sources = await logSourceRepository.findAll(req.query);

    res.json({
      success: true,
      data: sources.map(s => s.toJSON())
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Create log source
 * POST /api/v1/siem/logs/sources
 */
router.post('/logs/sources', async (req, res) => {
  try {
    const { error, value } = validators.logSourceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { logSourceRepository } = require('./repositories');
    const source = await logSourceRepository.create(value);

    res.status(201).json({
      success: true,
      data: source.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Event Correlation Endpoints ====================

/**
 * Correlate events
 * POST /api/v1/siem/correlate
 */
router.post('/correlate', async (req, res) => {
  try {
    const { event_id } = req.body;
    if (!event_id) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const { securityEventRepository } = require('./repositories');
    const event = await securityEventRepository.findById(event_id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const correlations = await services.eventCorrelationService.correlateEvent(event);

    res.json({
      success: true,
      data: correlations
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get correlation statistics
 * GET /api/v1/siem/correlation-rules/statistics
 */
router.get('/correlation-rules/statistics', async (req, res) => {
  try {
    const stats = await services.eventCorrelationService.getStatistics();

    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get correlation rules
 * GET /api/v1/siem/correlation-rules
 */
router.get('/correlation-rules', async (req, res) => {
  try {
    const rules = await services.eventCorrelationService.getRules(req.query);

    res.json({
      success: true,
      data: rules.map(r => r.toJSON())
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Create correlation rule
 * POST /api/v1/siem/correlation-rules
 */
router.post('/correlation-rules', async (req, res) => {
  try {
    const { error, value } = validators.correlationRuleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const rule = await services.eventCorrelationService.createRule(value);

    res.status(201).json({
      success: true,
      data: rule.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Detection Rules Endpoints ====================

/**
 * Get rule statistics
 * GET /api/v1/siem/rules/statistics
 */
router.get('/rules/statistics', async (req, res) => {
  try {
    const stats = await services.ruleEngineService.getStatistics();

    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Test detection rule
 * POST /api/v1/siem/rules/test
 */
router.post('/rules/test', async (req, res) => {
  try {
    const { rule, event } = req.body;
    if (!rule || !event) {
      return res.status(400).json({ error: 'Rule and event are required' });
    }

    const result = await services.ruleEngineService.testRule(rule, event);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get detection rules
 * GET /api/v1/siem/rules
 */
router.get('/rules', async (req, res) => {
  try {
    const rules = await services.ruleEngineService.getRules(req.query);

    res.json({
      success: true,
      data: rules.map(r => r.toJSON())
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get detection rule by ID
 * GET /api/v1/siem/rules/:id
 */
router.get('/rules/:id', async (req, res) => {
  try {
    const rule = await services.ruleEngineService.getRule(req.params.id);
    
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    res.json({
      success: true,
      data: rule.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Create detection rule
 * POST /api/v1/siem/rules
 */
router.post('/rules', async (req, res) => {
  try {
    const { error, value } = validators.detectionRuleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const rule = await services.ruleEngineService.createRule(value);

    res.status(201).json({
      success: true,
      data: rule.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update detection rule
 * PUT /api/v1/siem/rules/:id
 */
router.put('/rules/:id', async (req, res) => {
  try {
    const { error, value } = validators.detectionRuleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.body.user_id || 'system';
    const rule = await services.ruleEngineService.updateRule(req.params.id, value, userId);

    res.json({
      success: true,
      data: rule.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Alert Management Endpoints ====================

/**
 * Get alert statistics
 * GET /api/v1/siem/alerts/statistics
 */
router.get('/alerts/statistics', async (req, res) => {
  try {
    const stats = await services.alertManagementService.getStatistics();

    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get alerts
 * GET /api/v1/siem/alerts
 */
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await services.alertManagementService.getAlerts(req.query);

    res.json({
      success: true,
      ...alerts,
      data: alerts.data.map(a => a.toJSON())
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get alert by ID
 * GET /api/v1/siem/alerts/:id
 */
router.get('/alerts/:id', async (req, res) => {
  try {
    const alert = await services.alertManagementService.getAlert(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({
      success: true,
      data: alert.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update alert
 * PATCH /api/v1/siem/alerts/:id
 */
router.patch('/alerts/:id', async (req, res) => {
  try {
    const { error, value } = validators.alertUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userId = req.body.user_id || 'system';
    let alert;

    if (value.status) {
      alert = await services.alertManagementService.updateAlertStatus(
        req.params.id,
        value.status,
        userId,
        value.notes
      );
    } else if (value.assigned_to) {
      alert = await services.alertManagementService.assignAlert(req.params.id, value.assigned_to);
    } else {
      return res.status(400).json({ error: 'No valid update field provided' });
    }

    res.json({
      success: true,
      data: alert.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Acknowledge alert
 * POST /api/v1/siem/alerts/:id/acknowledge
 */
router.post('/alerts/:id/acknowledge', async (req, res) => {
  try {
    const userId = req.body.user_id || 'system';
    const alert = await services.alertManagementService.acknowledgeAlert(req.params.id, userId);

    res.json({
      success: true,
      data: alert.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Suppress alert
 * POST /api/v1/siem/alerts/:id/suppress
 */
router.post('/alerts/:id/suppress', async (req, res) => {
  try {
    const { reason } = req.body;
    const alert = await services.alertManagementService.suppressAlert(req.params.id, reason);

    res.json({
      success: true,
      data: alert.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Dashboard Endpoints ====================

/**
 * Get dashboards
 * GET /api/v1/siem/dashboards
 */
router.get('/dashboards', async (req, res) => {
  try {
    const dashboards = await services.dashboardService.getDashboards(req.query);

    res.json({
      success: true,
      data: dashboards.map(d => d.toJSON())
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get dashboard by ID
 * GET /api/v1/siem/dashboards/:id
 */
router.get('/dashboards/:id', async (req, res) => {
  try {
    const dashboard = await services.dashboardService.getDashboard(req.params.id);
    
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    res.json({
      success: true,
      data: dashboard.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get dashboard data
 * GET /api/v1/siem/dashboards/:id/data
 */
router.get('/dashboards/:id/data', async (req, res) => {
  try {
    const data = await services.dashboardService.getDashboardData(req.params.id);

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Create dashboard
 * POST /api/v1/siem/dashboards
 */
router.post('/dashboards', async (req, res) => {
  try {
    const { error, value } = validators.dashboardSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const dashboard = await services.dashboardService.createDashboard(value);

    res.status(201).json({
      success: true,
      data: dashboard.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get dashboard templates
 * GET /api/v1/siem/dashboards/templates
 */
router.get('/dashboards/templates/list', async (req, res) => {
  try {
    const templates = services.dashboardService.getTemplates();

    res.json({
      success: true,
      data: templates
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Forensic Analysis Endpoints ====================

/**
 * Create forensic session
 * POST /api/v1/siem/forensics/sessions
 */
router.post('/forensics/sessions', async (req, res) => {
  try {
    const { error, value } = validators.forensicSessionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const session = await services.forensicAnalysisService.createSession(value);

    res.status(201).json({
      success: true,
      data: session.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get forensic session
 * GET /api/v1/siem/forensics/session/:id
 */
router.get('/forensics/session/:id', async (req, res) => {
  try {
    const session = await services.forensicAnalysisService.getSession(req.params.id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      success: true,
      data: session.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Search events in forensic session
 * POST /api/v1/siem/forensics/search
 */
router.post('/forensics/search', async (req, res) => {
  try {
    const { session_id, query } = req.body;
    
    if (!session_id || !query) {
      return res.status(400).json({ error: 'Session ID and query are required' });
    }

    const results = await services.forensicAnalysisService.searchEvents(session_id, query);

    res.json({
      success: true,
      data: results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Add finding to session
 * POST /api/v1/siem/forensics/session/:id/findings
 */
router.post('/forensics/session/:id/findings', async (req, res) => {
  try {
    const session = await services.forensicAnalysisService.addFinding(req.params.id, req.body);

    res.json({
      success: true,
      data: session.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Complete forensic session
 * POST /api/v1/siem/forensics/session/:id/complete
 */
router.post('/forensics/session/:id/complete', async (req, res) => {
  try {
    const session = await services.forensicAnalysisService.completeSession(req.params.id);

    res.json({
      success: true,
      data: session.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Compliance Reporting Endpoints ====================

/**
 * Get compliance reports
 * GET /api/v1/siem/compliance/reports
 */
router.get('/compliance/reports', async (req, res) => {
  try {
    const reports = await services.complianceReportingService.getReports(req.query);

    res.json({
      success: true,
      data: reports.map(r => r.toJSON())
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get compliance report by ID
 * GET /api/v1/siem/compliance/reports/:id
 */
router.get('/compliance/reports/:id', async (req, res) => {
  try {
    const report = await services.complianceReportingService.getReport(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      success: true,
      data: report.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Generate compliance report
 * POST /api/v1/siem/compliance/generate
 */
router.post('/compliance/generate', async (req, res) => {
  try {
    const { error, value } = validators.complianceReportSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const report = await services.complianceReportingService.generateReport(
      value.framework,
      value.period_start,
      value.period_end,
      value.generated_by
    );

    res.status(201).json({
      success: true,
      data: report.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get compliance dashboard
 * GET /api/v1/siem/compliance/dashboard
 */
router.get('/compliance/dashboard', async (req, res) => {
  try {
    const data = await services.complianceReportingService.getDashboardData();

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
