/**
 * Incident Response Module Tests
 * Comprehensive tests for all sub-features
 */

const request = require('supertest');
const app = require('../../../index');
const { dataStore } = require('../services');

describe('Incident Response Module', () => {
  let testIncidentId;
  let testWorkflowId;
  let testEvidenceId;

  // Clear data before each test
  beforeEach(() => {
    dataStore.clearAll();
  });

  describe('1. Incident Creation and Tracking', () => {
    test('should create a new incident', async () => {
      const response = await request(app)
        .post('/api/v1/incidents')
        .send({
          title: 'Test Security Incident',
          description: 'This is a test incident for unit testing purposes',
          category: 'malware',
          severity: 'high',
          priority: 'high',
          reported_by: 'test-user'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe('Test Security Incident');
      expect(response.body.data.status).toBe('new');

      testIncidentId = response.body.data.id;
    });

    test('should get incident by ID', async () => {
      const createResponse = await request(app)
        .post('/api/v1/incidents')
        .send({
          title: 'Test Incident',
          description: 'Test description',
          category: 'phishing',
          reported_by: 'test-user'
        });

      const incidentId = createResponse.body.data.id;

      const response = await request(app).get(`/api/v1/incidents/${incidentId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(incidentId);
    });

    test('should update incident', async () => {
      const createResponse = await request(app)
        .post('/api/v1/incidents')
        .send({
          title: 'Test Incident',
          description: 'Test description',
          category: 'malware',
          reported_by: 'test-user'
        });

      const incidentId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/v1/incidents/${incidentId}`)
        .send({
          status: 'in_progress',
          assigned_to: 'analyst-001'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('in_progress');
      expect(response.body.data.assigned_to).toBe('analyst-001');
    });

    test('should list incidents', async () => {
      // Create multiple incidents
      await request(app).post('/api/v1/incidents').send({
        title: 'Incident 1',
        description: 'Description 1',
        category: 'malware',
        reported_by: 'user1'
      });

      await request(app).post('/api/v1/incidents').send({
        title: 'Incident 2',
        description: 'Description 2',
        category: 'phishing',
        reported_by: 'user2'
      });

      const response = await request(app).get('/api/v1/incidents');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });
  });

  describe('2. Automated Incident Prioritization', () => {
    test('should prioritize incident', async () => {
      const createResponse = await request(app)
        .post('/api/v1/incidents')
        .send({
          title: 'Critical Incident',
          description: 'High severity incident',
          category: 'ransomware',
          severity: 'critical',
          reported_by: 'system',
          affected_assets: ['server-1', 'server-2', 'server-3']
        });

      const incidentId = createResponse.body.data.id;

      const response = await request(app)
        .post(`/api/v1/incidents/${incidentId}/prioritize`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.scores.priority_score).toBeGreaterThan(0);
      expect(response.body.data.priority).toBeDefined();
    });

    test('should get priority queue', async () => {
      // Create incidents with different priorities
      await request(app).post('/api/v1/incidents').send({
        title: 'High Priority',
        description: 'Test',
        category: 'malware',
        severity: 'high',
        reported_by: 'user'
      });

      await request(app).post('/api/v1/incidents').send({
        title: 'Low Priority',
        description: 'Test',
        category: 'spam',
        severity: 'low',
        reported_by: 'user'
      });

      const response = await request(app).get('/api/v1/incidents/priority-queue');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('3. Workflow Automation', () => {
    test('should create workflow', async () => {
      const response = await request(app)
        .post('/api/v1/workflows')
        .send({
          name: 'Test Workflow',
          description: 'Automated test workflow',
          tasks: [
            {
              name: 'Task 1',
              action: 'block_ip',
              parameters: { ip: '1.2.3.4' }
            }
          ]
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Test Workflow');

      testWorkflowId = response.body.data.id;
    });

    test('should execute workflow', async () => {
      // Create incident
      const incidentResponse = await request(app)
        .post('/api/v1/incidents')
        .send({
          title: 'Test Incident',
          description: 'Test',
          category: 'malware',
          reported_by: 'user'
        });

      const incidentId = incidentResponse.body.data.id;

      // Create workflow
      const workflowResponse = await request(app)
        .post('/api/v1/workflows')
        .send({
          name: 'Test Workflow',
          description: 'Test',
          tasks: [
            { name: 'Task 1', action: 'block_ip', parameters: {} }
          ]
        });

      const workflowId = workflowResponse.body.data.id;

      // Execute workflow
      const response = await request(app)
        .post(`/api/v1/incidents/${incidentId}/execute-workflow`)
        .send({ workflow_id: workflowId });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('completed');
    });
  });

  describe('4. Timeline Visualization', () => {
    test('should get incident timeline', async () => {
      const incidentResponse = await request(app)
        .post('/api/v1/incidents')
        .send({
          title: 'Test Incident',
          description: 'Test',
          category: 'malware',
          reported_by: 'user'
        });

      const incidentId = incidentResponse.body.data.id;

      const response = await request(app).get(`/api/v1/incidents/${incidentId}/timeline`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should create timeline event', async () => {
      const incidentResponse = await request(app)
        .post('/api/v1/incidents')
        .send({
          title: 'Test Incident',
          description: 'Test',
          category: 'malware',
          reported_by: 'user'
        });

      const incidentId = incidentResponse.body.data.id;

      const response = await request(app)
        .post(`/api/v1/incidents/${incidentId}/events`)
        .send({
          type: 'custom',
          title: 'Custom Event',
          description: 'Test event'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe('Custom Event');
    });
  });

  describe('5. Evidence Collection', () => {
    test('should collect evidence', async () => {
      const incidentResponse = await request(app)
        .post('/api/v1/incidents')
        .send({
          title: 'Test Incident',
          description: 'Test',
          category: 'malware',
          reported_by: 'user'
        });

      const incidentId = incidentResponse.body.data.id;

      const response = await request(app)
        .post(`/api/v1/incidents/${incidentId}/evidence`)
        .send({
          type: 'log_file',
          name: 'system.log',
          description: 'System log file containing suspicious activity',
          source: 'server-01',
          file_size: 1024
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('system.log');
      expect(response.body.data.chain_of_custody).toHaveLength(1);

      testEvidenceId = response.body.data.id;
    });

    test('should get chain of custody', async () => {
      const incidentResponse = await request(app)
        .post('/api/v1/incidents')
        .send({
          title: 'Test',
          description: 'Test',
          category: 'malware',
          reported_by: 'user'
        });

      const evidenceResponse = await request(app)
        .post(`/api/v1/incidents/${incidentResponse.body.data.id}/evidence`)
        .send({
          type: 'screenshot',
          name: 'evidence.png',
          description: 'Screenshot',
          source: 'workstation'
        });

      const evidenceId = evidenceResponse.body.data.id;

      const response = await request(app).get(`/api/v1/evidence/${evidenceId}/chain-of-custody`);

      expect(response.status).toBe(200);
      expect(response.body.data.chain_of_custody).toBeDefined();
    });
  });

  describe('6. Communication and Notification', () => {
    test('should send notification', async () => {
      const incidentResponse = await request(app)
        .post('/api/v1/incidents')
        .send({
          title: 'Test Incident',
          description: 'Test',
          category: 'malware',
          reported_by: 'user'
        });

      const incidentId = incidentResponse.body.data.id;

      const response = await request(app)
        .post(`/api/v1/incidents/${incidentId}/notify`)
        .send({
          channel: 'email',
          subject: 'Test Notification',
          message: 'This is a test notification',
          recipients: ['test@example.com']
        });

      expect(response.status).toBe(201);
      expect(response.body.data.status).toBe('sent');
    });

    test('should get notification templates', async () => {
      const response = await request(app).get('/api/v1/notifications/templates');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('7. Post-Incident Analysis', () => {
    test('should create post-mortem', async () => {
      const incidentResponse = await request(app)
        .post('/api/v1/incidents')
        .send({
          title: 'Test Incident',
          description: 'Test',
          category: 'malware',
          reported_by: 'user'
        });

      const incidentId = incidentResponse.body.data.id;

      const response = await request(app)
        .post(`/api/v1/incidents/${incidentId}/post-mortem`)
        .send({
          title: 'Test Post-Mortem',
          summary: 'This is a comprehensive analysis of the test incident that occurred in our environment',
          root_cause: 'Test root cause analysis for the incident'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe('Test Post-Mortem');
    });

    test('should add lesson learned', async () => {
      const incidentResponse = await request(app)
        .post('/api/v1/incidents')
        .send({
          title: 'Test',
          description: 'Test',
          category: 'malware',
          reported_by: 'user'
        });

      const postMortemResponse = await request(app)
        .post(`/api/v1/incidents/${incidentResponse.body.data.id}/post-mortem`)
        .send({
          title: 'Test',
          summary: 'Summary of the incident that provides context and overview of what happened',
          root_cause: 'Root cause of the incident'
        });

      const postMortemId = postMortemResponse.body.data.id;

      const response = await request(app)
        .post(`/api/v1/post-mortems/${postMortemId}/lessons`)
        .send({
          description: 'Important lesson learned from this incident',
          category: 'technical',
          severity: 'high'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.lessons_learned).toHaveLength(1);
    });
  });

  describe('Module Health Check', () => {
    test('should return module health status', async () => {
      const response = await request(app).get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body.module).toBe('incident-response');
      expect(response.body.status).toBe('operational');
      expect(response.body.subFeatures).toBeDefined();
    });
  });
});
