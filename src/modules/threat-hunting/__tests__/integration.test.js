/**
 * Integration Tests for Threat Hunting Module
 */

const request = require('supertest');
const express = require('express');
const threatHuntingRoutes = require('../routes');
const database = require('../models/database');

const app = express();
app.use(express.json());
app.use('/api/v1/hunting', threatHuntingRoutes);

describe('Threat Hunting API Integration Tests', () => {
  beforeEach(async () => {
    await database.clearAll();
  });

  describe('Health Check', () => {
    it('should return module health status', async () => {
      const response = await request(app)
        .get('/api/v1/hunting/health')
        .expect(200);

      expect(response.body.module).toBe('threat-hunting');
      expect(response.body.status).toBe('operational');
    });
  });

  describe('Query Operations', () => {
    it('should execute a query', async () => {
      const response = await request(app)
        .post('/api/v1/hunting/query')
        .send({
          query: 'SELECT * FROM logs',
          queryLanguage: 'sql',
          dataSources: ['logs'],
        })
        .expect(200);

      expect(response.body).toHaveProperty('queryId');
      expect(response.body).toHaveProperty('results');
    });

    it('should save and retrieve a query', async () => {
      const createResponse = await request(app)
        .post('/api/v1/hunting/queries')
        .send({
          name: 'Test Query',
          description: 'A test query',
          query: 'SELECT * FROM events',
          queryLanguage: 'sql',
        })
        .expect(201);

      const queryId = createResponse.body.id;

      const getResponse = await request(app)
        .get(`/api/v1/hunting/queries/${queryId}`)
        .expect(200);

      expect(getResponse.body.name).toBe('Test Query');
    });

    it('should list queries', async () => {
      await request(app)
        .post('/api/v1/hunting/queries')
        .send({
          name: 'Query 1',
          query: 'SELECT 1',
          queryLanguage: 'sql',
        });

      await request(app)
        .post('/api/v1/hunting/queries')
        .send({
          name: 'Query 2',
          query: 'SELECT 2',
          queryLanguage: 'sql',
        });

      const response = await request(app)
        .get('/api/v1/hunting/queries')
        .expect(200);

      expect(response.body.queries).toHaveLength(2);
    });

    it('should reject invalid query data', async () => {
      const response = await request(app)
        .post('/api/v1/hunting/queries')
        .send({
          name: 'ab',
        })
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
    });
  });

  describe('Hypothesis Operations', () => {
    it('should create a hypothesis', async () => {
      const response = await request(app)
        .post('/api/v1/hunting/hypotheses')
        .send({
          title: 'Data Exfiltration Hypothesis',
          description: 'Testing for data exfiltration via DNS',
          hypothesis: 'Attackers are using DNS tunneling',
        })
        .expect(201);

      expect(response.body.title).toBe('Data Exfiltration Hypothesis');
      expect(response.body.status).toBe('draft');
    });

    it('should retrieve and list hypotheses', async () => {
      await request(app)
        .post('/api/v1/hunting/hypotheses')
        .send({
          title: 'Hypothesis 1',
          description: 'Description 1',
          hypothesis: 'Test hypothesis 1',
        });

      const response = await request(app)
        .get('/api/v1/hunting/hypotheses')
        .expect(200);

      expect(response.body.hypotheses).toHaveLength(1);
    });
  });

  describe('Playbook Operations', () => {
    it('should create a playbook', async () => {
      const response = await request(app)
        .post('/api/v1/hunting/playbooks')
        .send({
          name: 'Login Anomaly Detection',
          description: 'Detects unusual login patterns',
          category: 'authentication',
          steps: [
            { name: 'Query failed logins', type: 'query', query: 'SELECT * FROM auth_logs' },
          ],
        })
        .expect(201);

      expect(response.body.name).toBe('Login Anomaly Detection');
      expect(response.body.enabled).toBe(true);
    });

    it('should execute a playbook', async () => {
      const createResponse = await request(app)
        .post('/api/v1/hunting/playbooks')
        .send({
          name: 'Test Playbook',
          description: 'Test',
          steps: [
            { name: 'Step 1', type: 'query' },
          ],
        });

      const playbookId = createResponse.body.id;

      const executeResponse = await request(app)
        .post(`/api/v1/hunting/playbooks/${playbookId}/execute`)
        .expect(200);

      expect(executeResponse.body.status).toBe('completed');
      expect(executeResponse.body.steps).toHaveLength(1);
    });
  });

  describe('Behavior Analysis Operations', () => {
    it('should analyze entity behavior', async () => {
      const response = await request(app)
        .post('/api/v1/hunting/behavior-analysis')
        .send({
          entityId: 'user123',
          entityType: 'user',
          analysisWindow: '30d',
        })
        .expect(200);

      expect(response.body.entityId).toBe('user123');
      expect(response.body.anomalyScore).toBeDefined();
      expect(response.body.riskScore).toBeDefined();
    });
  });

  describe('Pattern Detection Operations', () => {
    it('should detect anomalies', async () => {
      const response = await request(app)
        .post('/api/v1/hunting/detect-anomalies')
        .send({
          data: [
            { event: 'login', user: 'admin', timestamp: new Date() },
            { event: 'data_access', user: 'admin', timestamp: new Date() },
          ],
          algorithm: 'statistical',
          threshold: 0.7,
        })
        .expect(200);

      expect(response.body.patterns).toBeDefined();
      expect(Array.isArray(response.body.patterns)).toBe(true);
    });
  });

  describe('Finding Operations', () => {
    it('should create a finding', async () => {
      const response = await request(app)
        .post('/api/v1/hunting/findings')
        .send({
          title: 'Suspicious Login Activity',
          description: 'Multiple failed login attempts detected',
          severity: 'high',
          category: 'authentication',
        })
        .expect(201);

      expect(response.body.title).toBe('Suspicious Login Activity');
      expect(response.body.severity).toBe('high');
    });

    it('should list and filter findings', async () => {
      await request(app)
        .post('/api/v1/hunting/findings')
        .send({
          title: 'Finding 1',
          description: 'Test finding',
          severity: 'critical',
        });

      await request(app)
        .post('/api/v1/hunting/findings')
        .send({
          title: 'Finding 2',
          description: 'Test finding',
          severity: 'low',
        });

      const response = await request(app)
        .get('/api/v1/hunting/findings?severity=critical')
        .expect(200);

      expect(response.body.findings).toHaveLength(1);
      expect(response.body.findings[0].severity).toBe('critical');
    });
  });

  describe('Session Operations', () => {
    it('should create a hunting session', async () => {
      const response = await request(app)
        .post('/api/v1/hunting/sessions')
        .send({
          name: 'Test Hunt Session',
          hypothesis: 'Testing for lateral movement',
        })
        .expect(201);

      expect(response.body.name).toBe('Test Hunt Session');
      expect(response.body.status).toBe('active');
    });

    it('should join a session', async () => {
      const createResponse = await request(app)
        .post('/api/v1/hunting/sessions')
        .send({
          name: 'Collaborative Hunt',
          hypothesis: 'Test hypothesis',
        });

      const sessionId = createResponse.body.id;

      const joinResponse = await request(app)
        .post(`/api/v1/hunting/sessions/${sessionId}/join`)
        .expect(200);

      expect(joinResponse.body.teamMembers).toBeDefined();
    });

    it('should send chat messages in session', async () => {
      const createResponse = await request(app)
        .post('/api/v1/hunting/sessions')
        .send({
          name: 'Chat Test',
          hypothesis: 'Test',
        });

      const sessionId = createResponse.body.id;

      const messageResponse = await request(app)
        .post(`/api/v1/hunting/sessions/${sessionId}/messages`)
        .send({
          message: 'Hello team!',
        })
        .expect(200);

      expect(messageResponse.body.message).toBe('Hello team!');
    });
  });
});
