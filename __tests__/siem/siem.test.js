/**
 * SIEM Module Tests
 * 
 * Comprehensive test suite for SIEM module
 */

const request = require('supertest');
const app = require('../../src/index');

describe('SIEM Module', () => {
  let logSourceId;
  let eventId;
  let ruleId;
  let alertId;
  let dashboardId;
  let sessionId;
  let reportId;

  // Clean up after tests
  afterAll(async () => {
    const {
      securityEventRepository,
      logSourceRepository,
      detectionRuleRepository,
      alertRepository,
      dashboardRepository,
      forensicSessionRepository,
      complianceReportRepository,
      correlationRuleRepository
    } = require('../../src/modules/siem/repositories');

    await securityEventRepository.clear();
    await logSourceRepository.clear();
    await detectionRuleRepository.clear();
    await alertRepository.clear();
    await dashboardRepository.clear();
    await forensicSessionRepository.clear();
    await complianceReportRepository.clear();
    await correlationRuleRepository.clear();
  });

  describe('Module Health', () => {
    test('should return module health status', async () => {
      const response = await request(app)
        .get('/api/v1/siem/health')
        .expect(200);

      expect(response.body.module).toBe('siem');
      expect(response.body.status).toBe('operational');
      expect(response.body.features).toContain('log-collection');
      expect(response.body.features).toContain('event-correlation');
      expect(response.body.features).toContain('detection-rules');
      expect(response.body.features).toContain('alert-management');
      expect(response.body.features).toContain('dashboards');
      expect(response.body.features).toContain('forensic-analysis');
      expect(response.body.features).toContain('compliance-reporting');
    });
  });

  describe('Log Collection & Normalization', () => {
    test('should create a log source', async () => {
      const response = await request(app)
        .post('/api/v1/siem/logs/sources')
        .send({
          name: 'test-firewall',
          source_type: 'syslog',
          protocol: 'udp',
          port: 514
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('test-firewall');
      logSourceId = response.body.data.id;
    });

    test('should ingest a log event', async () => {
      const response = await request(app)
        .post('/api/v1/siem/logs/ingest')
        .send({
          source: 'test-firewall',
          source_type: 'syslog',
          event_type: 'firewall_block',
          severity: 'high',
          source_ip: '192.168.1.100',
          destination_ip: '10.0.0.50',
          action: 'blocked',
          outcome: 'success'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.source).toBe('test-firewall');
      expect(response.body.data.severity).toBe('high');
      eventId = response.body.data.id;
    });

    test('should batch ingest logs', async () => {
      const response = await request(app)
        .post('/api/v1/siem/logs/ingest/batch')
        .send({
          logs: [
            {
              source: 'test-firewall',
              event_type: 'login_attempt',
              severity: 'info',
              source_ip: '192.168.1.101'
            },
            {
              source: 'test-firewall',
              event_type: 'login_attempt',
              severity: 'info',
              source_ip: '192.168.1.102'
            }
          ]
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toHaveLength(2);
      expect(response.body.data.failed).toHaveLength(0);
    });

    test('should get log sources', async () => {
      const response = await request(app)
        .get('/api/v1/siem/logs/sources')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should get ingestion statistics', async () => {
      const response = await request(app)
        .get('/api/v1/siem/logs/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_sources).toBeGreaterThan(0);
      expect(response.body.data.total_events).toBeGreaterThan(0);
    });
  });

  describe('Detection Rules Engine', () => {
    test('should create a detection rule', async () => {
      const response = await request(app)
        .post('/api/v1/siem/rules')
        .send({
          name: 'Failed Login Attempts',
          description: 'Detect multiple failed login attempts',
          enabled: true,
          severity: 'high',
          rule_type: 'threshold',
          conditions: [
            {
              field: 'event_type',
              operator: 'equals',
              value: 'login_attempt'
            },
            {
              field: 'outcome',
              operator: 'equals',
              value: 'failure'
            }
          ],
          threshold: 5,
          time_window: 300
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Failed Login Attempts');
      expect(response.body.data.enabled).toBe(true);
      ruleId = response.body.data.id;
    });

    test('should get detection rules', async () => {
      const response = await request(app)
        .get('/api/v1/siem/rules')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should get rule by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/siem/rules/${ruleId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(ruleId);
    });

    test('should test a rule', async () => {
      const response = await request(app)
        .post('/api/v1/siem/rules/test')
        .send({
          rule: {
            conditions: [
              {
                field: 'severity',
                operator: 'equals',
                value: 'critical'
              }
            ]
          },
          event: {
            severity: 'critical',
            event_type: 'security_breach'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.matches).toBe(true);
    });

    test('should get rule statistics', async () => {
      const response = await request(app)
        .get('/api/v1/siem/rules/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_rules).toBeGreaterThan(0);
    });
  });

  describe('Event Correlation', () => {
    test('should create correlation rule', async () => {
      const response = await request(app)
        .post('/api/v1/siem/correlation-rules')
        .send({
          name: 'Port Scan Detection',
          description: 'Detect port scanning activity',
          enabled: true,
          correlation_type: 'grouped',
          event_conditions: [
            {
              field: 'event_type',
              operator: 'equals',
              value: 'connection_attempt'
            },
            {
              field: 'destination_port',
              operator: 'greater_than',
              value: 0
            }
          ],
          time_window: 300,
          min_events: 10,
          grouping_fields: ['source_ip'],
          severity: 'high'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Port Scan Detection');
    });

    test('should get correlation rules', async () => {
      const response = await request(app)
        .get('/api/v1/siem/correlation-rules')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should get correlation statistics', async () => {
      const response = await request(app)
        .get('/api/v1/siem/correlation-rules/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_rules).toBeGreaterThan(0);
    });
  });

  describe('Alert Management', () => {
    test('should create an alert', async () => {
      const { alertRepository } = require('../../src/modules/siem/repositories');
      const alert = await alertRepository.create({
        title: 'Test Alert',
        description: 'Test alert for testing',
        severity: 'high',
        priority: 'high',
        status: 'open'
      });
      alertId = alert.id;

      expect(alert.title).toBe('Test Alert');
      expect(alert.status).toBe('open');
    });

    test('should get alerts', async () => {
      const response = await request(app)
        .get('/api/v1/siem/alerts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should get alert by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/siem/alerts/${alertId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(alertId);
    });

    test('should acknowledge alert', async () => {
      const response = await request(app)
        .post(`/api/v1/siem/alerts/${alertId}/acknowledge`)
        .send({ user_id: 'test-user' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('acknowledged');
    });

    test('should suppress alert', async () => {
      const response = await request(app)
        .post(`/api/v1/siem/alerts/${alertId}/suppress`)
        .send({ reason: 'False positive' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.suppressed).toBe(true);
    });

    test('should get alert statistics', async () => {
      const response = await request(app)
        .get('/api/v1/siem/alerts/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBeGreaterThan(0);
    });
  });

  describe('Security Event Dashboards', () => {
    test('should create dashboard', async () => {
      const response = await request(app)
        .post('/api/v1/siem/dashboards')
        .send({
          name: 'Security Overview',
          description: 'Main security dashboard',
          type: 'custom',
          widgets: [
            {
              type: 'event_count',
              title: 'Total Events'
            },
            {
              type: 'alert_count',
              title: 'Active Alerts'
            }
          ],
          refresh_interval: 60,
          time_range: '24h'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Security Overview');
      dashboardId = response.body.data.id;
    });

    test('should get dashboards', async () => {
      const response = await request(app)
        .get('/api/v1/siem/dashboards')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should get dashboard by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/siem/dashboards/${dashboardId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(dashboardId);
    });

    test('should get dashboard data', async () => {
      const response = await request(app)
        .get(`/api/v1/siem/dashboards/${dashboardId}/data`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.dashboard).toBeDefined();
      expect(response.body.data.widget_data).toBeDefined();
    });

    test('should get dashboard templates', async () => {
      const response = await request(app)
        .get('/api/v1/siem/dashboards/templates/list')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Forensic Analysis', () => {
    test('should create forensic session', async () => {
      const response = await request(app)
        .post('/api/v1/siem/forensics/sessions')
        .send({
          name: 'Security Investigation',
          description: 'Investigating suspicious activity',
          investigator: 'analyst-001'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Security Investigation');
      sessionId = response.body.data.id;
    });

    test('should get forensic session', async () => {
      const response = await request(app)
        .get(`/api/v1/siem/forensics/session/${sessionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(sessionId);
    });

    test('should search events in session', async () => {
      const response = await request(app)
        .post('/api/v1/siem/forensics/search')
        .send({
          session_id: sessionId,
          query: 'severity:high'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should add finding to session', async () => {
      const response = await request(app)
        .post(`/api/v1/siem/forensics/session/${sessionId}/findings`)
        .send({
          title: 'Suspicious Login',
          description: 'Multiple failed login attempts from unusual location',
          severity: 'high'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.findings).toHaveLength(1);
    });

    test('should complete forensic session', async () => {
      const response = await request(app)
        .post(`/api/v1/siem/forensics/session/${sessionId}/complete`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
    });
  });

  describe('Compliance Reporting', () => {
    test('should generate compliance report', async () => {
      const response = await request(app)
        .post('/api/v1/siem/compliance/generate')
        .send({
          framework: 'pci-dss',
          period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          period_end: new Date(),
          generated_by: 'compliance-officer'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.framework).toBe('pci-dss');
      expect(response.body.data.status).toBe('completed');
      reportId = response.body.data.id;
    });

    test('should get compliance reports', async () => {
      const response = await request(app)
        .get('/api/v1/siem/compliance/reports')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should get compliance report by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/siem/compliance/reports/${reportId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(reportId);
    });

    test('should get compliance dashboard', async () => {
      const response = await request(app)
        .get('/api/v1/siem/compliance/dashboard')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_reports).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    test('should process log ingestion through full pipeline', async () => {
      // 1. Ingest a critical event
      const ingestResponse = await request(app)
        .post('/api/v1/siem/logs/ingest')
        .send({
          source: 'test-system',
          event_type: 'security_breach',
          severity: 'critical',
          source_ip: '10.0.0.100',
          action: 'unauthorized_access',
          outcome: 'success'
        })
        .expect(201);

      expect(ingestResponse.body.success).toBe(true);

      // 2. Verify alert was generated (if rules match)
      const alertsResponse = await request(app)
        .get('/api/v1/siem/alerts')
        .expect(200);

      expect(alertsResponse.body.success).toBe(true);
    });

    test('should handle invalid log ingestion', async () => {
      const response = await request(app)
        .post('/api/v1/siem/logs/ingest')
        .send({
          // Missing required 'source' field
          event_type: 'test'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('should handle not found resources', async () => {
      await request(app)
        .get('/api/v1/siem/alerts/nonexistent-id')
        .expect(404);
    });
  });
});
