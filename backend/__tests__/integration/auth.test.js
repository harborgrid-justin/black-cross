/**
 * Integration Tests for Authentication & Authorization
 * Tests JWT authentication and role-based access control
 */

const request = require('supertest');
const express = require('express');
const {
  authenticate, authorize, requireAdmin, generateToken,
} = require('../../middleware/auth');
const errorHandler = require('../../middleware/errorHandler');

describe('Authentication & Authorization Integration Tests', () => {
  let app;
  let validToken;
  let adminToken;
  let analystToken;
  let viewerToken;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Generate test tokens
    adminToken = generateToken({ id: 'admin1', email: 'admin@test.com', role: 'admin' });
    analystToken = generateToken({ id: 'analyst1', email: 'analyst@test.com', role: 'analyst' });
    viewerToken = generateToken({ id: 'viewer1', email: 'viewer@test.com', role: 'viewer' });
    validToken = adminToken;
  });

  describe('Authentication Middleware', () => {
    it('should authenticate with valid token', async () => {
      app.get('/test', authenticate, (req, res) => {
        res.json({ success: true, user: req.user });
      });
      app.use(errorHandler.errorHandler);

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBe('admin1');
      expect(response.body.user.role).toBe('admin');
    });

    it('should reject request without token', async () => {
      app.get('/test', authenticate, (req, res) => {
        res.json({ success: true, user: req.user });
      });
      app.use(errorHandler.errorHandler);

      const response = await request(app).get('/test');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('authentication');
    });

    it('should reject request with invalid token', async () => {
      app.get('/test', authenticate, (req, res) => {
        res.json({ success: true, user: req.user });
      });
      app.use(errorHandler.errorHandler);

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject request with malformed Authorization header', async () => {
      app.get('/test', authenticate, (req, res) => {
        res.json({ success: true, user: req.user });
      });
      app.use(errorHandler.errorHandler);

      const response = await request(app)
        .get('/test')
        .set('Authorization', validToken);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Authorization Middleware', () => {
    it('should allow admin role', async () => {
      app.get('/test', authenticate, authorize('admin'), (req, res) => {
        res.json({ success: true, user: req.user });
      });
      app.use(errorHandler.errorHandler);

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny non-admin role for admin-only endpoint', async () => {
      app.get('/test', authenticate, authorize('admin'), (req, res) => {
        res.json({ success: true, user: req.user });
      });
      app.use(errorHandler.errorHandler);

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access denied');
    });

    it('should allow multiple roles', async () => {
      app.get('/test', authenticate, authorize('admin', 'analyst'), (req, res) => {
        res.json({ success: true, user: req.user });
      });
      app.use(errorHandler.errorHandler);

      // Test admin
      const adminResponse = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);

      // Test analyst
      const analystResponse = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(analystResponse.status).toBe(200);

      // Test viewer (should be denied)
      const viewerResponse = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(viewerResponse.status).toBe(403);
    });

    it('should use requireAdmin helper', async () => {
      app.get('/test', authenticate, requireAdmin, (req, res) => {
        res.json({ success: true, user: req.user });
      });
      app.use(errorHandler.errorHandler);

      const adminResponse = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);

      const analystResponse = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(analystResponse.status).toBe(403);
    });
  });

  describe('Role-Based Access Control Scenarios', () => {
    it('should handle create operations (admin/analyst only)', async () => {
      app.post('/test', authenticate, authorize('admin', 'analyst'), (req, res) => {
        res.json({ success: true, created: true });
      });
      app.use(errorHandler.errorHandler);

      // Admin can create
      const adminResponse = await request(app)
        .post('/test')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test' });

      expect(adminResponse.status).toBe(200);

      // Analyst can create
      const analystResponse = await request(app)
        .post('/test')
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ name: 'Test' });

      expect(analystResponse.status).toBe(200);

      // Viewer cannot create
      const viewerResponse = await request(app)
        .post('/test')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ name: 'Test' });

      expect(viewerResponse.status).toBe(403);
    });

    it('should handle delete operations (admin only)', async () => {
      app.delete('/test/:id', authenticate, requireAdmin, (req, res) => {
        res.json({ success: true, deleted: true });
      });
      app.use(errorHandler.errorHandler);

      // Admin can delete
      const adminResponse = await request(app)
        .delete('/test/123')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);

      // Analyst cannot delete
      const analystResponse = await request(app)
        .delete('/test/123')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(analystResponse.status).toBe(403);
    });

    it('should handle read operations (all roles)', async () => {
      app.get('/test', authenticate, (req, res) => {
        res.json({ success: true, data: [] });
      });
      app.use(errorHandler.errorHandler);

      // All roles can read
      const roles = [adminToken, analystToken, viewerToken];

      for (const token of roles) {
        const response = await request(app)
          .get('/test')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
      }
    });
  });

  describe('Token Generation', () => {
    it('should generate valid JWT token', () => {
      const user = {
        id: 'test123',
        email: 'test@example.com',
        role: 'analyst',
      };

      const token = generateToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user data in token', async () => {
      const user = {
        id: 'test123',
        email: 'test@example.com',
        role: 'analyst',
      };

      const token = generateToken(user);

      app.get('/test', authenticate, (req, res) => {
        res.json({ success: true, user: req.user });
      });

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe('test123');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.role).toBe('analyst');
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication failure with proper error code', async () => {
      app.get('/test', authenticate, (req, res) => {
        res.json({ success: true });
      });
      app.use(errorHandler.errorHandler);

      const response = await request(app)
        .get('/test')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should handle authorization failure with proper error code', async () => {
      app.get('/test', authenticate, requireAdmin, (req, res) => {
        res.json({ success: true });
      });
      app.use(errorHandler.errorHandler);

      const response = await request(app)
        .get('/test')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Access denied');
    });
  });
});
