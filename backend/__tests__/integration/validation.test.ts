/**
 * Integration Tests for Validation
 * Tests validation across different endpoints
 */

import request from 'supertest';
import express from 'express';
import {  validate, Joi  } from '../../middleware/validator';
import errorHandler from '../../middleware/errorHandler';

describe('Validation Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Body Validation', () => {
    it('should validate required fields', async () => {
      const schema = {
        body: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
        }),
      };

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true, data: req.body });
      });
      app.use(errorHandler.errorHandler);

      const response = await request(app)
        .post('/test')
        .send({ name: 'Test User' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('validation');
    });

    it('should accept valid data', async () => {
      const schema = {
        body: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
        }),
      };

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true, data: req.body });
      });
      app.use(errorHandler.errorHandler);

      const response = await request(app)
        .post('/test')
        .send({ name: 'Test User', email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test User');
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('should sanitize unknown fields', async () => {
      const schema = {
        body: Joi.object({
          name: Joi.string().required(),
        }),
      };

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true, data: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({ name: 'Test', extra: 'should be removed' });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Test');
      expect(response.body.data.extra).toBeUndefined();
    });
  });

  describe('Query Parameter Validation', () => {
    it('should validate query parameters', async () => {
      const schema = {
        query: Joi.object({
          page: Joi.number().integer().min(1).required(),
          limit: Joi.number().integer().min(1).max(100)
            .required(),
        }),
      };

      app.get('/test', validate(schema), (req, res) => {
        res.json({ success: true, query: req.query });
      });
      app.use(errorHandler.errorHandler);

      const response = await request(app)
        .get('/test')
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.query.page).toBe(1);
      expect(response.body.query.limit).toBe(20);
    });

    it('should reject invalid query parameters', async () => {
      const schema = {
        query: Joi.object({
          page: Joi.number().integer().min(1).required(),
          limit: Joi.number().integer().min(1).max(100)
            .required(),
        }),
      };

      app.get('/test', validate(schema), (req, res) => {
        res.json({ success: true, query: req.query });
      });
      app.use(errorHandler.errorHandler);

      const response = await request(app)
        .get('/test')
        .query({ page: 0, limit: 200 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Path Parameter Validation', () => {
    it('should validate path parameters', async () => {
      const schema = {
        params: Joi.object({
          id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
        }),
      };

      app.get('/test/:id', validate(schema), (req, res) => {
        res.json({ success: true, params: req.params });
      });
      app.use(errorHandler.errorHandler);

      const validId = '507f1f77bcf86cd799439011';
      const response = await request(app).get(`/test/${validId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.params.id).toBe(validId);
    });

    it('should reject invalid path parameters', async () => {
      const schema = {
        params: Joi.object({
          id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
        }),
      };

      app.get('/test/:id', validate(schema), (req, res) => {
        res.json({ success: true, params: req.params });
      });
      app.use(errorHandler.errorHandler);

      const response = await request(app).get('/test/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Complex Validation Scenarios', () => {
    it('should validate nested objects', async () => {
      const schema = {
        body: Joi.object({
          user: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
          }).required(),
          metadata: Joi.object({
            tags: Joi.array().items(Joi.string()),
          }).optional(),
        }),
      };

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true, data: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({
          user: {
            name: 'Test User',
            email: 'test@example.com',
          },
          metadata: {
            tags: ['tag1', 'tag2'],
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe('Test User');
    });

    it('should validate arrays', async () => {
      const schema = {
        body: Joi.object({
          items: Joi.array().items(
            Joi.object({
              id: Joi.string().required(),
              value: Joi.number().required(),
            }),
          ).min(1).required(),
        }),
      };

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true, data: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({
          items: [
            { id: 'item1', value: 10 },
            { id: 'item2', value: 20 },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
    });

    it('should validate date ranges', async () => {
      const schema = {
        body: Joi.object({
          startDate: Joi.date().iso().required(),
          endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
        }),
      };

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true, data: req.body });
      });
      app.use(errorHandler.errorHandler);

      const response = await request(app)
        .post('/test')
        .send({
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-02T00:00:00Z',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject invalid date ranges', async () => {
      const schema = {
        body: Joi.object({
          startDate: Joi.date().iso().required(),
          endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
        }),
      };

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true, data: req.body });
      });
      app.use(errorHandler.errorHandler);

      const response = await request(app)
        .post('/test')
        .send({
          startDate: '2024-01-02T00:00:00Z',
          endDate: '2024-01-01T00:00:00Z',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Validation Error Messages', () => {
    it('should provide detailed error messages', async () => {
      const schema = {
        body: Joi.object({
          email: Joi.string().email().required(),
          age: Joi.number().integer().min(18).required(),
        }),
      };

      app.post('/test', validate(schema), (req, res) => {
        res.json({ success: true, data: req.body });
      });
      app.use(errorHandler.errorHandler);

      const response = await request(app)
        .post('/test')
        .send({
          email: 'invalid-email',
          age: 15,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
      expect(Array.isArray(response.body.details)).toBe(true);
    });
  });
});

