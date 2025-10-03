/**
 * Feed Integration Module
 *
 * Main entry point for the feed integration module
 * Comprehensive threat intelligence feed management from aggregation to deduplication
 */

const express = require('express');

const router = express.Router();
const services = require('./services');
const validators = require('./validators');

// ==================== Module Health Check ====================

/**
 * Health check
 * GET /api/v1/feeds/health
 */
router.get('/health', (req, res) => {
  res.json({
    module: 'feed-integration',
    status: 'operational',
    version: '1.0.0',
    features: [
      'multi-source-aggregation',
      'commercial-opensource-support',
      'reliability-scoring',
      'automated-parsing',
      'custom-feed-creation',
      'feed-scheduling',
      'duplicate-detection'
    ],
    timestamp: new Date().toISOString()
  });
});

// ==================== Feed Aggregation Endpoints ====================

/**
 * Aggregate feeds from multiple sources
 * POST /api/v1/feeds/aggregate
 */
router.post('/aggregate', async (req, res) => {
  try {
    const { error, value } = validators.aggregationSchemas.aggregate.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await services.feedAggregationService.aggregateFeeds(value.feed_source_ids);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get aggregation status
 * GET /api/v1/feeds/aggregation/status
 */
router.get('/aggregation/status', async (req, res) => {
  try {
    const status = await services.feedAggregationService.getAggregationStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Monitor feed health
 * GET /api/v1/feeds/health-monitor
 */
router.get('/health-monitor', async (req, res) => {
  try {
    const healthReport = await services.feedAggregationService.monitorFeedHealth();
    res.json({
      success: true,
      data: healthReport
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Feed Source Management Endpoints ====================

/**
 * List all feed sources
 * GET /api/v1/feeds/sources
 */
router.get('/sources', async (req, res) => {
  try {
    const result = await services.feedSourceManagementService.listFeedSources(req.query);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Create feed source
 * POST /api/v1/feeds/sources
 */
router.post('/sources', async (req, res) => {
  try {
    const { error, value } = validators.feedSourceSchemas.create.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const feedSource = await services.feedSourceManagementService.createFeedSource(value);
    res.status(201).json({
      success: true,
      data: feedSource.toJSON(),
      message: 'Feed source created successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get feed source by ID
 * GET /api/v1/feeds/sources/:id
 */
router.get('/sources/:id', async (req, res) => {
  try {
    const feedSource = await services.feedSourceManagementService.getFeedSource(req.params.id);
    if (!feedSource) {
      return res.status(404).json({ error: 'Feed source not found' });
    }
    res.json({
      success: true,
      data: feedSource.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update feed source
 * PUT /api/v1/feeds/sources/:id
 */
router.put('/sources/:id', async (req, res) => {
  try {
    const { error, value } = validators.feedSourceSchemas.update.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const feedSource = await services.feedSourceManagementService.updateFeedSource(req.params.id, value);
    if (!feedSource) {
      return res.status(404).json({ error: 'Feed source not found' });
    }
    res.json({
      success: true,
      data: feedSource.toJSON(),
      message: 'Feed source updated successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Delete feed source
 * DELETE /api/v1/feeds/sources/:id
 */
router.delete('/sources/:id', async (req, res) => {
  try {
    await services.feedSourceManagementService.deleteFeedSource(req.params.id);
    res.json({
      success: true,
      message: 'Feed source deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get commercial feeds
 * GET /api/v1/feeds/commercial
 */
router.get('/commercial', async (req, res) => {
  try {
    const result = await services.feedSourceManagementService.getCommercialFeeds(req.query);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get open-source feeds
 * GET /api/v1/feeds/opensource
 */
router.get('/opensource', async (req, res) => {
  try {
    const result = await services.feedSourceManagementService.getOpenSourceFeeds(req.query);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Test feed source connectivity
 * POST /api/v1/feeds/sources/:id/test
 */
router.post('/sources/:id/test', async (req, res) => {
  try {
    const testResult = await services.feedSourceManagementService.testFeedSource(req.params.id);
    res.json({
      success: true,
      data: testResult
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Feed Reliability Endpoints ====================

/**
 * Get feed reliability score
 * GET /api/v1/feeds/:id/reliability
 */
router.get('/:id/reliability', async (req, res) => {
  try {
    const reliability = await services.feedReliabilityService.calculateReliabilityScore(req.params.id);
    res.json({
      success: true,
      data: reliability
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update feed reliability score
 * POST /api/v1/feeds/:id/score
 */
router.post('/:id/score', async (req, res) => {
  try {
    const { error, value } = validators.reliabilitySchemas.updateScore.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await services.feedReliabilityService.updateReliabilityScore(
      req.params.id,
      value.score,
      value.reason
    );
    res.json({
      success: true,
      data: result,
      message: 'Reliability score updated'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get feed reliability report
 * GET /api/v1/feeds/:id/reliability/report
 */
router.get('/:id/reliability/report', async (req, res) => {
  try {
    const report = await services.feedReliabilityService.getReliabilityReport(req.params.id);
    res.json({
      success: true,
      data: report
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Compare feed reliability
 * POST /api/v1/feeds/reliability/compare
 */
router.post('/reliability/compare', async (req, res) => {
  try {
    const feedIds = req.body.feed_source_ids || [];
    const comparison = await services.feedReliabilityService.compareFeeds(feedIds);
    res.json({
      success: true,
      data: comparison
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Feed Parsing Endpoints ====================

/**
 * Parse feed data
 * POST /api/v1/feeds/parse
 */
router.post('/parse', async (req, res) => {
  try {
    const feedSource = req.body;
    const parsed = await services.parsingService.parseFeed(feedSource);
    res.json({
      success: true,
      data: parsed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get supported schemas
 * GET /api/v1/feeds/schemas
 */
router.get('/schemas', async (req, res) => {
  try {
    const schemas = services.parsingService.getSupportedSchemas();
    res.json({
      success: true,
      data: schemas
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Custom Feed Endpoints ====================

/**
 * Create custom feed
 * POST /api/v1/feeds/custom
 */
router.post('/custom', async (req, res) => {
  try {
    const { error, value } = validators.customFeedSchemas.create.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const customFeed = await services.customFeedService.createCustomFeed(value);
    res.status(201).json({
      success: true,
      data: customFeed.toJSON(),
      message: 'Custom feed created successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * List custom feeds
 * GET /api/v1/feeds/custom
 */
router.get('/custom', async (req, res) => {
  try {
    const result = await services.customFeedService.listCustomFeeds(req.query);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get custom feed by ID
 * GET /api/v1/feeds/custom/:id
 */
router.get('/custom/:id', async (req, res) => {
  try {
    const customFeed = await services.customFeedService.getCustomFeed(req.params.id);
    if (!customFeed) {
      return res.status(404).json({ error: 'Custom feed not found' });
    }
    res.json({
      success: true,
      data: customFeed.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update custom feed
 * PUT /api/v1/feeds/custom/:id
 */
router.put('/custom/:id', async (req, res) => {
  try {
    const { error, value } = validators.customFeedSchemas.update.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const customFeed = await services.customFeedService.updateCustomFeed(req.params.id, value);
    res.json({
      success: true,
      data: customFeed.toJSON(),
      message: 'Custom feed updated successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Delete custom feed
 * DELETE /api/v1/feeds/custom/:id
 */
router.delete('/custom/:id', async (req, res) => {
  try {
    await services.customFeedService.deleteCustomFeed(req.params.id);
    res.json({
      success: true,
      message: 'Custom feed deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Generate custom feed data
 * GET /api/v1/feeds/custom/:id/generate
 */
router.get('/custom/:id/generate', async (req, res) => {
  try {
    const feedData = await services.customFeedService.generateFeedData(req.params.id);
    res.json({
      success: true,
      data: feedData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Feed Scheduling Endpoints ====================

/**
 * Schedule feed
 * POST /api/v1/feeds/:id/schedule
 */
router.post('/:id/schedule', async (req, res) => {
  try {
    const { schedule } = req.body;
    if (!schedule) {
      return res.status(400).json({ error: 'Schedule is required' });
    }

    const result = await services.feedSchedulingService.scheduleFeed(req.params.id, schedule);
    res.json({
      success: true,
      data: result,
      message: 'Feed scheduled successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get feed status
 * GET /api/v1/feeds/:id/status
 */
router.get('/:id/status', async (req, res) => {
  try {
    const status = await services.feedSchedulingService.getFeedStatus(req.params.id);
    res.json({
      success: true,
      data: status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Trigger manual feed update
 * POST /api/v1/feeds/:id/update
 */
router.post('/:id/update', async (req, res) => {
  try {
    const result = await services.feedSchedulingService.triggerUpdate(req.params.id);
    res.json({
      success: true,
      data: result,
      message: 'Feed update triggered successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Pause feed
 * POST /api/v1/feeds/:id/pause
 */
router.post('/:id/pause', async (req, res) => {
  try {
    const result = await services.feedSchedulingService.pauseFeed(req.params.id);
    res.json({
      success: true,
      data: result,
      message: 'Feed paused successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Resume feed
 * POST /api/v1/feeds/:id/resume
 */
router.post('/:id/resume', async (req, res) => {
  try {
    const result = await services.feedSchedulingService.resumeFeed(req.params.id);
    res.json({
      success: true,
      data: result,
      message: 'Feed resumed successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Deduplication Endpoints ====================

/**
 * Deduplicate feed items
 * POST /api/v1/feeds/deduplicate
 */
router.post('/deduplicate', async (req, res) => {
  try {
    const { error, value } = validators.deduplicationSchemas.deduplicate.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await services.deduplicationService.deduplicateItems(value);
    res.json({
      success: true,
      data: result,
      message: 'Deduplication completed'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get duplicates
 * GET /api/v1/feeds/duplicates
 */
router.get('/duplicates', async (req, res) => {
  try {
    const result = await services.deduplicationService.listDuplicates(req.query);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get duplicate statistics
 * GET /api/v1/feeds/duplicates/stats
 */
router.get('/duplicates/stats', async (req, res) => {
  try {
    const stats = await services.deduplicationService.getDuplicateStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get deduplication report
 * GET /api/v1/feeds/deduplication/report
 */
router.get('/deduplication/report', async (req, res) => {
  try {
    const report = await services.deduplicationService.getDeduplicationReport();
    res.json({
      success: true,
      data: report
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Statistics Endpoints ====================

/**
 * Get feed statistics
 * GET /api/v1/feeds/statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    const stats = await services.feedSourceManagementService.getFeedSourceStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
