/**
 * Health Check Integration Tests
 * Test health endpoints with real application
 */

const request = require('supertest');
const express = require('express');
const {
  basicHealthCheck, detailedHealthCheck, livenessProbe, readinessProbe,
} = require('../../middleware/healthCheck');

// Create test app
const createApp = () => {
  const app = express();

  app.get('/health', basicHealthCheck);
  app.get('/health/detailed', detailedHealthCheck);
  app.get('/health/live', livenessProbe);
  app.get('/health/ready', readinessProbe);

  return app;
};

describe('Health Check Endpoints', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  describe('GET /health', () => {
    it('should return 200 with basic health info', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toMatchObject({
        status: 'healthy',
        platform: 'Black-Cross',
        version: '1.0.0',
      });

      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /health/detailed', () => {
    it('should return detailed health information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect('Content-Type', /json/);

      expect(response.body).toMatchObject({
        platform: 'Black-Cross',
        version: '1.0.0',
      });

      expect(response.body.status).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.system).toBeDefined();
      expect(response.body.dependencies).toBeDefined();
      expect(response.body.modules).toBeDefined();
    });

    it('should include system metrics', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect('Content-Type', /json/);

      expect(response.body.system).toMatchObject({
        memory: expect.any(Object),
        uptime: expect.any(String),
        uptimeSeconds: expect.any(Number),
        pid: expect.any(Number),
        nodeVersion: expect.any(String),
      });
    });

    it('should include all modules', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect('Content-Type', /json/);

      const { modules } = response.body;

      expect(modules.threatIntelligence).toBe('operational');
      expect(modules.incidentResponse).toBe('operational');
      expect(modules.threatHunting).toBe('operational');
      expect(modules.automation).toBe('operational');
    });
  });

  describe('GET /health/live', () => {
    it('should return 200 for liveness probe', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toMatchObject({
        status: 'alive',
      });

      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /health/ready', () => {
    it('should check readiness', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');

      // Status should be 'ready' or 'not ready'
      expect(['ready', 'not ready']).toContain(response.body.status);
    });
  });
});
