/**
 * IoC Management Tests
 * 
 * Comprehensive test suite for IoC management module
 */

const request = require('supertest');
const app = require('../../src/index');

describe('IoC Management Module', () => {
  let iocId;
  let sourceId;

  // Clean up after tests
  afterAll(async () => {
    const { iocRepository, sourceRepository } = require('../../src/modules/ioc-management/repositories');
    
    await iocRepository.clear();
    await sourceRepository.clear();
  });

  describe('Module Health', () => {
    test('should return module health status', async () => {
      const response = await request(app)
        .get('/api/v1/iocs/health')
        .expect(200);

      expect(response.body.module).toBe('ioc-management');
      expect(response.body.status).toBe('operational');
      expect(response.body.features).toContain('ioc-collection-validation');
    });
  });

  describe('IoC CRUD Operations', () => {
    test('should create a new IoC', async () => {
      const response = await request(app)
        .post('/api/v1/iocs')
        .send({
          value: '192.168.1.100',
          type: 'ip',
          confidence: 75,
          severity: 'high',
          tags: ['malware', 'c2']
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.value).toBe('192.168.1.100');
      expect(response.body.data.type).toBe('ip');
      iocId = response.body.data.id;
    });

    test('should get IoC by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/iocs/${iocId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(iocId);
      expect(response.body.data.value).toBe('192.168.1.100');
    });

    test('should list IoCs', async () => {
      const response = await request(app)
        .get('/api/v1/iocs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should update IoC', async () => {
      const response = await request(app)
        .patch(`/api/v1/iocs/${iocId}`)
        .send({
          confidence: 85,
          tags: ['malware', 'c2', 'botnet']
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.confidence).toBe(85);
    });

    test('should get IoC statistics', async () => {
      const response = await request(app)
        .get('/api/v1/iocs/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBeGreaterThan(0);
    });
  });

  describe('Collection & Validation (7.1)', () => {
    test('should ingest IoCs', async () => {
      const response = await request(app)
        .post('/api/v1/iocs/ingest')
        .send({
          iocs: [
            {
              value: 'malicious.example.com',
              type: 'domain',
              confidence: 80,
              severity: 'high'
            },
            {
              value: '5d41402abc4b2a76b9719d911017c592',
              type: 'hash',
              confidence: 90,
              severity: 'critical'
            }
          ],
          source: {
            name: 'Test Feed',
            type: 'feed',
            reliability: 85
          }
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ingested.length).toBeGreaterThan(0);
    });

    test('should validate IoC', async () => {
      const response = await request(app)
        .post('/api/v1/iocs/validate')
        .send({
          value: '192.168.1.1',
          type: 'ip'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(true);
    });

    test('should detect invalid IoC', async () => {
      const response = await request(app)
        .post('/api/v1/iocs/validate')
        .send({
          value: 'not-a-valid-ip',
          type: 'ip'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.errors.length).toBeGreaterThan(0);
    });

    test('should get duplicate IoCs', async () => {
      const response = await request(app)
        .get('/api/v1/iocs/duplicates')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should get age analysis', async () => {
      const response = await request(app)
        .get('/api/v1/iocs/age-analysis')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBeGreaterThan(0);
      expect(response.body.data.age_groups).toBeDefined();
    });

    test('should get source reliability', async () => {
      const response = await request(app)
        .get('/api/v1/iocs/source-reliability')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Multi-Format Support (7.2)', () => {
    test('should get supported IoC types', async () => {
      const response = await request(app)
        .get('/api/v1/iocs/types')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.types).toBeDefined();
      expect(Array.isArray(response.body.data.types)).toBe(true);
    });

    test('should detect IoC type', async () => {
      const response = await request(app)
        .post('/api/v1/iocs/detect-type')
        .send({
          value: '192.168.1.1'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.detected_type).toBe('ip');
    });

    test('should convert IoC format', async () => {
      const response = await request(app)
        .post('/api/v1/iocs/convert')
        .send({
          iocs: [
            { value: '192.168.1.1', type: 'ip', confidence: 75 }
          ],
          target_format: 'json'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.format).toBe('json');
    });
  });

  describe('Confidence Scoring (7.3)', () => {
    test('should get IoC confidence', async () => {
      const response = await request(app)
        .get(`/api/v1/iocs/${iocId}/confidence`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.confidence).toBeDefined();
      expect(response.body.data.factors).toBeDefined();
    });

    test('should update IoC confidence', async () => {
      const response = await request(app)
        .put(`/api/v1/iocs/${iocId}/confidence`)
        .send({
          confidence: 95,
          reason: 'Verified by multiple sources'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.new_confidence).toBe(95);
    });

    test('should get confidence trend', async () => {
      const response = await request(app)
        .get(`/api/v1/iocs/${iocId}/confidence/trend`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.current_confidence).toBeDefined();
      expect(response.body.data.trend).toBeDefined();
    });

    test('should get confidence statistics', async () => {
      const response = await request(app)
        .get('/api/v1/iocs/confidence/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_iocs).toBeGreaterThan(0);
      expect(response.body.data.average_confidence).toBeDefined();
    });
  });

  describe('Automated Enrichment (7.4)', () => {
    test('should enrich IoC', async () => {
      const response = await request(app)
        .post(`/api/v1/iocs/${iocId}/enrich`)
        .send({
          sources: ['geolocation', 'reputation']
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.enrichment).toBeDefined();
    });

    test('should get IoC enrichment data', async () => {
      const response = await request(app)
        .get(`/api/v1/iocs/${iocId}/enrichment`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.enrichment).toBeDefined();
    });

    test('should discover related IoCs', async () => {
      const response = await request(app)
        .get(`/api/v1/iocs/${iocId}/related`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.related_iocs).toBeDefined();
      expect(Array.isArray(response.body.data.related_iocs)).toBe(true);
    });

    test('should get enrichment statistics', async () => {
      const response = await request(app)
        .get('/api/v1/iocs/enrichment/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_iocs).toBeGreaterThan(0);
    });
  });

  describe('Lifecycle Management (7.5)', () => {
    test('should update IoC lifecycle', async () => {
      const response = await request(app)
        .patch(`/api/v1/iocs/${iocId}/lifecycle`)
        .send({
          status: 'active',
          reason: 'Recent sighting confirmed'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.new_status).toBe('active');
    });

    test('should get lifecycle status', async () => {
      const response = await request(app)
        .get(`/api/v1/iocs/${iocId}/lifecycle-status`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.lifecycle_stage).toBeDefined();
    });

    test('should track IoC sighting', async () => {
      const response = await request(app)
        .post(`/api/v1/iocs/${iocId}/sighting`)
        .send({
          source: 'IDS System',
          location: 'DMZ',
          context: { severity: 'high' }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sighting_added).toBe(true);
    });

    test('should get effectiveness metrics', async () => {
      const response = await request(app)
        .get('/api/v1/iocs/lifecycle/metrics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_iocs).toBeGreaterThan(0);
    });

    test('should get lifecycle statistics', async () => {
      const response = await request(app)
        .get('/api/v1/iocs/lifecycle/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBeGreaterThan(0);
      expect(response.body.data.by_status).toBeDefined();
    });
  });

  describe('Bulk Import/Export (7.6)', () => {
    test('should bulk import IoCs', async () => {
      const response = await request(app)
        .post('/api/v1/iocs/bulk-import')
        .send({
          data: [
            { value: '10.0.0.1', type: 'ip', confidence: 70 },
            { value: 'evil.com', type: 'domain', confidence: 80 }
          ],
          format: 'json',
          skip_duplicates: true
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(2);
    });

    test('should bulk export IoCs', async () => {
      const response = await request(app)
        .post('/api/v1/iocs/bulk-export')
        .send({
          format: 'json',
          criteria: {
            type: 'ip'
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.format).toBe('json');
    });

    test('should generate import template', async () => {
      const response = await request(app)
        .get('/api/v1/iocs/import-template?format=json')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    test('should get bulk statistics', async () => {
      const response = await request(app)
        .get('/api/v1/iocs/bulk/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBeGreaterThan(0);
    });
  });

  describe('Search & Filtering (7.7)', () => {
    test('should perform simple search', async () => {
      const response = await request(app)
        .get('/api/v1/iocs/search?query=192.168')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should perform advanced search', async () => {
      const response = await request(app)
        .post('/api/v1/iocs/search/advanced')
        .send({
          type: 'ip',
          min_confidence: 70,
          severity: 'high',
          sort_by: 'confidence',
          sort_order: 'desc',
          limit: 10
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should get search facets', async () => {
      const response = await request(app)
        .get('/api/v1/iocs/search/facets')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.types).toBeDefined();
      expect(response.body.data.statuses).toBeDefined();
      expect(response.body.data.severities).toBeDefined();
    });

    test('should get search suggestions', async () => {
      const response = await request(app)
        .get('/api/v1/iocs/search/suggestions?query=192')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent IoC', async () => {
      const response = await request(app)
        .get('/api/v1/iocs/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('IoC not found');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/iocs')
        .send({
          type: 'ip'
          // Missing required 'value' field
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test('should validate confidence range', async () => {
      const response = await request(app)
        .put(`/api/v1/iocs/${iocId}/confidence`)
        .send({
          confidence: 150  // Invalid - should be 0-100
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Cleanup', () => {
    test('should delete IoC', async () => {
      const response = await request(app)
        .delete(`/api/v1/iocs/${iocId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should return 404 for deleted IoC', async () => {
      await request(app)
        .get(`/api/v1/iocs/${iocId}`)
        .expect(404);
    });
  });
});
