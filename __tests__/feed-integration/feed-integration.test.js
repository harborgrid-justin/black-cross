/**
 * Feed Integration Module Tests
 * 
 * Comprehensive test suite for feed integration module
 */

const request = require('supertest');
const app = require('../../src/index');

describe('Feed Integration Module', () => {
  let feedSourceId;
  let customFeedId;

  // Clean up after tests
  afterAll(async () => {
    const { 
      feedSourceRepository, 
      feedItemRepository,
      customFeedRepository
    } = require('../../src/modules/feed-integration/repositories');
    
    await feedSourceRepository.clear();
    await feedItemRepository.clear();
    await customFeedRepository.clear();
  });

  describe('Module Health', () => {
    test('should return module health status', async () => {
      const response = await request(app)
        .get('/api/v1/feeds/health')
        .expect(200);

      expect(response.body.module).toBe('feed-integration');
      expect(response.body.status).toBe('operational');
      expect(response.body.features).toContain('multi-source-aggregation');
      expect(response.body.features).toContain('reliability-scoring');
      expect(response.body.features).toContain('duplicate-detection');
    });
  });

  describe('Feed Source Management', () => {
    test('should create a feed source', async () => {
      const response = await request(app)
        .post('/api/v1/feeds/sources')
        .send({
          name: 'Test Feed Source',
          type: 'opensource',
          url: 'https://example.com/feed.json',
          format: 'json',
          category: 'malware',
          priority: 'high',
          metadata: {
            provider: 'Test Provider',
            description: 'Test feed for malware indicators'
          }
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Test Feed Source');
      expect(response.body.data.type).toBe('opensource');
      feedSourceId = response.body.data.id;
    });

    test('should list feed sources', async () => {
      const response = await request(app)
        .get('/api/v1/feeds/sources')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.total).toBeGreaterThan(0);
    });

    test('should get feed source by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/feeds/sources/${feedSourceId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(feedSourceId);
      expect(response.body.data.name).toBe('Test Feed Source');
    });

    test('should update feed source', async () => {
      const response = await request(app)
        .put(`/api/v1/feeds/sources/${feedSourceId}`)
        .send({
          priority: 'critical',
          enabled: true
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.priority).toBe('critical');
    });

    test('should get commercial feeds', async () => {
      const response = await request(app)
        .get('/api/v1/feeds/commercial')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('should get open-source feeds', async () => {
      const response = await request(app)
        .get('/api/v1/feeds/opensource')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should validate feed source input', async () => {
      const response = await request(app)
        .post('/api/v1/feeds/sources')
        .send({
          name: 'Invalid Feed'
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Feed Reliability', () => {
    test('should get feed reliability score', async () => {
      const response = await request(app)
        .get(`/api/v1/feeds/${feedSourceId}/reliability`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('reliability_score');
      expect(response.body.data).toHaveProperty('metrics');
      expect(response.body.data).toHaveProperty('status');
    });

    test('should update feed reliability score', async () => {
      const response = await request(app)
        .post(`/api/v1/feeds/${feedSourceId}/score`)
        .send({
          score: 85,
          reason: 'Manual adjustment based on performance'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.new_score).toBe(85);
    });

    test('should get reliability report', async () => {
      const response = await request(app)
        .get(`/api/v1/feeds/${feedSourceId}/reliability/report`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('feed');
      expect(response.body.data).toHaveProperty('statistics');
      expect(response.body.data).toHaveProperty('recommendations');
    });

    test('should compare feed reliability', async () => {
      const response = await request(app)
        .post('/api/v1/feeds/reliability/compare')
        .send({
          feed_source_ids: [feedSourceId]
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('comparisons');
    });
  });

  describe('Feed Scheduling', () => {
    test('should schedule a feed', async () => {
      const response = await request(app)
        .post(`/api/v1/feeds/${feedSourceId}/schedule`)
        .send({
          schedule: '0 */6 * * *'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.schedule).toBe('0 */6 * * *');
      expect(response.body.data).toHaveProperty('next_update');
    });

    test('should get feed status', async () => {
      const response = await request(app)
        .get(`/api/v1/feeds/${feedSourceId}/status`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('feed_id');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('schedule');
    });

    test('should pause a feed', async () => {
      const response = await request(app)
        .post(`/api/v1/feeds/${feedSourceId}/pause`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('paused');
    });

    test('should resume a feed', async () => {
      const response = await request(app)
        .post(`/api/v1/feeds/${feedSourceId}/resume`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('active');
    });
  });

  describe('Custom Feeds', () => {
    test('should create a custom feed', async () => {
      const response = await request(app)
        .post('/api/v1/feeds/custom')
        .send({
          name: 'Test Custom Feed',
          description: 'Custom feed for testing',
          output_format: 'json',
          fields: [
            { name: 'value', type: 'string', required: true },
            { name: 'type', type: 'string', required: true }
          ],
          distribution: 'internal'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Test Custom Feed');
      customFeedId = response.body.data.id;
    });

    test('should list custom feeds', async () => {
      const response = await request(app)
        .get('/api/v1/feeds/custom')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.total).toBeGreaterThan(0);
    });

    test('should get custom feed by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/feeds/custom/${customFeedId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(customFeedId);
    });

    test('should update custom feed', async () => {
      const response = await request(app)
        .put(`/api/v1/feeds/custom/${customFeedId}`)
        .send({
          description: 'Updated description'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe('Updated description');
    });

    test('should generate custom feed data', async () => {
      const response = await request(app)
        .get(`/api/v1/feeds/custom/${customFeedId}/generate`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('feed_id');
      expect(response.body.data).toHaveProperty('format');
      expect(response.body.data).toHaveProperty('data');
    });
  });

  describe('Feed Parsing', () => {
    test('should get supported schemas', async () => {
      const response = await request(app)
        .get('/api/v1/feeds/schemas')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('formats');
      expect(response.body.data.formats).toContain('json');
      expect(response.body.data.formats).toContain('stix');
      expect(response.body.data.formats).toContain('csv');
    });
  });

  describe('Deduplication', () => {
    test('should get duplicate statistics', async () => {
      const response = await request(app)
        .get('/api/v1/feeds/duplicates/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total_items');
      expect(response.body.data).toHaveProperty('unique_items');
      expect(response.body.data).toHaveProperty('duplicates');
    });

    test('should get deduplication report', async () => {
      const response = await request(app)
        .get('/api/v1/feeds/deduplication/report')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('recommendations');
    });

    test('should list duplicates', async () => {
      const response = await request(app)
        .get('/api/v1/feeds/duplicates')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('Feed Aggregation', () => {
    test('should get aggregation status', async () => {
      const response = await request(app)
        .get('/api/v1/feeds/aggregation/status')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total_sources');
      expect(response.body.data).toHaveProperty('active_sources');
      expect(response.body.data).toHaveProperty('health_score');
    });

    test('should monitor feed health', async () => {
      const response = await request(app)
        .get('/api/v1/feeds/health-monitor')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total_feeds');
      expect(response.body.data).toHaveProperty('healthy');
      expect(response.body.data).toHaveProperty('degraded');
      expect(response.body.data).toHaveProperty('unhealthy');
    });
  });

  describe('Statistics', () => {
    test('should get feed statistics', async () => {
      const response = await request(app)
        .get('/api/v1/feeds/statistics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('by_type');
      expect(response.body.data).toHaveProperty('by_status');
    });
  });

  describe('Cleanup', () => {
    test('should delete custom feed', async () => {
      const response = await request(app)
        .delete(`/api/v1/feeds/custom/${customFeedId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should delete feed source', async () => {
      const response = await request(app)
        .delete(`/api/v1/feeds/sources/${feedSourceId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
