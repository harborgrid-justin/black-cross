/**
 * IoC Management Module
 * 
 * Main entry point for the IoC management module
 * Comprehensive IoC lifecycle management from collection to expiration
 */

const express = require('express');
const router = express.Router();
const services = require('./services');
const validators = require('./validators');
const { iocRepository } = require('./repositories');

// ==================== Module Health Check ====================

/**
 * Health check
 * GET /api/v1/iocs/health
 */
router.get('/health', (req, res) => {
  res.json({
    module: 'ioc-management',
    status: 'operational',
    version: '1.0.0',
    features: [
      'ioc-collection-validation',
      'multi-format-support',
      'confidence-scoring',
      'automated-enrichment',
      'lifecycle-management',
      'bulk-import-export',
      'search-filtering'
    ],
    timestamp: new Date().toISOString()
  });
});

// ==================== Collection & Validation Endpoints (7.1) ====================

/**
 * Ingest IoCs from external sources
 * POST /api/v1/iocs/ingest
 */
router.post('/ingest', async (req, res) => {
  try {
    const { error, value } = validators.ingestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const results = await services.collectionService.ingestIoCs(value.iocs, value.source);
    res.status(201).json({
      success: true,
      data: results,
      message: `Ingested ${results.ingested.length} IoCs`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Validate IoC
 * POST /api/v1/iocs/validate
 */
router.post('/validate', async (req, res) => {
  try {
    const { error, value } = validators.validateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await services.collectionService.validateIoC(value);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get duplicate IoCs
 * GET /api/v1/iocs/duplicates
 */
router.get('/duplicates', async (req, res) => {
  try {
    const duplicates = await services.collectionService.detectDuplicates();
    res.json({
      success: true,
      data: duplicates,
      count: duplicates.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get IoC age analysis
 * GET /api/v1/iocs/age-analysis
 */
router.get('/age-analysis', async (req, res) => {
  try {
    const analysis = await services.collectionService.getAgeAnalysis();
    res.json({
      success: true,
      data: analysis
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get source reliability
 * GET /api/v1/iocs/source-reliability
 */
router.get('/source-reliability', async (req, res) => {
  try {
    const reliability = await services.collectionService.getSourceReliability();
    res.json({
      success: true,
      data: reliability
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Multi-Format Support Endpoints (7.2) ====================

/**
 * Get supported IoC types
 * GET /api/v1/iocs/types
 */
router.get('/types', (req, res) => {
  try {
    const types = services.formatService.getSupportedTypes();
    res.json({
      success: true,
      data: types
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Convert IoC format
 * POST /api/v1/iocs/convert
 */
router.post('/convert', async (req, res) => {
  try {
    const { error, value } = validators.formatConversionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { iocs, target_format } = req.body;
    const converted = await services.formatService.convertFormat(iocs, target_format);
    
    res.json({
      success: true,
      data: converted,
      format: target_format
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Auto-detect IoC type
 * POST /api/v1/iocs/detect-type
 */
router.post('/detect-type', (req, res) => {
  try {
    const { value } = req.body;
    if (!value) {
      return res.status(400).json({ error: 'value is required' });
    }

    const detectedType = services.formatService.detectType(value);
    res.json({
      success: true,
      data: {
        value,
        detected_type: detectedType
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Confidence Scoring Endpoints (7.3) ====================

/**
 * Get IoC confidence score
 * GET /api/v1/iocs/:id/confidence
 */
router.get('/:id/confidence', async (req, res) => {
  try {
    const confidence = await services.confidenceService.getConfidence(req.params.id);
    res.json({
      success: true,
      data: confidence
    });
  } catch (err) {
    if (err.message === 'IoC not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update IoC confidence score
 * PUT /api/v1/iocs/:id/confidence
 */
router.put('/:id/confidence', async (req, res) => {
  try {
    const { error, value } = validators.confidenceUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await services.confidenceService.updateConfidence(
      req.params.id,
      value.confidence,
      value.reason
    );
    
    res.json({
      success: true,
      data: result,
      message: 'Confidence updated successfully'
    });
  } catch (err) {
    if (err.message === 'IoC not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get confidence trend
 * GET /api/v1/iocs/:id/confidence/trend
 */
router.get('/:id/confidence/trend', async (req, res) => {
  try {
    const trend = await services.confidenceService.getConfidenceTrend(req.params.id);
    res.json({
      success: true,
      data: trend
    });
  } catch (err) {
    if (err.message === 'IoC not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get confidence statistics
 * GET /api/v1/iocs/confidence/stats
 */
router.get('/confidence/stats', async (req, res) => {
  try {
    const stats = await services.confidenceService.getConfidenceStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Enrichment Endpoints (7.4) ====================

/**
 * Enrich IoC
 * POST /api/v1/iocs/:id/enrich
 */
router.post('/:id/enrich', async (req, res) => {
  try {
    const { error, value } = validators.enrichmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await services.enrichmentService.enrichIoC(req.params.id, value.sources);
    res.json({
      success: true,
      data: result,
      message: 'IoC enriched successfully'
    });
  } catch (err) {
    if (err.message === 'IoC not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get IoC enrichment data
 * GET /api/v1/iocs/:id/enrichment
 */
router.get('/:id/enrichment', async (req, res) => {
  try {
    const enrichment = await services.enrichmentService.getEnrichment(req.params.id);
    res.json({
      success: true,
      data: enrichment
    });
  } catch (err) {
    if (err.message === 'IoC not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * Discover related IoCs
 * GET /api/v1/iocs/:id/related
 */
router.get('/:id/related', async (req, res) => {
  try {
    const related = await services.enrichmentService.discoverRelatedIoCs(req.params.id);
    res.json({
      success: true,
      data: related
    });
  } catch (err) {
    if (err.message === 'IoC not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get enrichment statistics
 * GET /api/v1/iocs/enrichment/stats
 */
router.get('/enrichment/stats', async (req, res) => {
  try {
    const stats = await services.enrichmentService.getEnrichmentStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Lifecycle Management Endpoints (7.5) ====================

/**
 * Update IoC lifecycle
 * PATCH /api/v1/iocs/:id/lifecycle
 */
router.patch('/:id/lifecycle', async (req, res) => {
  try {
    const { error, value } = validators.lifecycleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await services.lifecycleService.updateLifecycle(
      req.params.id,
      value.status,
      { expiration_date: value.expiration_date, reason: value.reason }
    );
    
    res.json({
      success: true,
      data: result,
      message: 'Lifecycle updated successfully'
    });
  } catch (err) {
    if (err.message === 'IoC not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get lifecycle status
 * GET /api/v1/iocs/lifecycle-status
 */
router.get('/lifecycle-status', async (req, res) => {
  try {
    const status = await services.lifecycleService.getAllLifecycleStatus(req.query);
    res.json({
      success: true,
      data: status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get lifecycle status for specific IoC
 * GET /api/v1/iocs/:id/lifecycle-status
 */
router.get('/:id/lifecycle-status', async (req, res) => {
  try {
    const status = await services.lifecycleService.getLifecycleStatus(req.params.id);
    res.json({
      success: true,
      data: status
    });
  } catch (err) {
    if (err.message === 'IoC not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * Track IoC sighting
 * POST /api/v1/iocs/:id/sighting
 */
router.post('/:id/sighting', async (req, res) => {
  try {
    const { error, value } = validators.sightingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await services.lifecycleService.trackSighting(req.params.id, value);
    res.json({
      success: true,
      data: result,
      message: 'Sighting tracked successfully'
    });
  } catch (err) {
    if (err.message === 'IoC not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get effectiveness metrics
 * GET /api/v1/iocs/lifecycle/metrics
 */
router.get('/lifecycle/metrics', async (req, res) => {
  try {
    const metrics = await services.lifecycleService.getEffectivenessMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get lifecycle statistics
 * GET /api/v1/iocs/lifecycle/stats
 */
router.get('/lifecycle/stats', async (req, res) => {
  try {
    const stats = await services.lifecycleService.getLifecycleStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Bulk Import/Export Endpoints (7.6) ====================

/**
 * Bulk import IoCs
 * POST /api/v1/iocs/bulk-import
 */
router.post('/bulk-import', async (req, res) => {
  try {
    const { error, value } = validators.bulkImportSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await services.bulkService.bulkImport(value.data, {
      format: value.format,
      source: value.source,
      validate: value.validate,
      skip_duplicates: value.skip_duplicates,
      update_existing: value.update_existing
    });
    
    res.status(201).json({
      success: result.success,
      data: result,
      message: `Bulk import completed: ${result.imported} imported, ${result.updated} updated, ${result.skipped} skipped, ${result.failed} failed`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Bulk export IoCs
 * POST /api/v1/iocs/bulk-export
 */
router.post('/bulk-export', async (req, res) => {
  try {
    const { error, value } = validators.bulkExportSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await services.bulkService.bulkExport(value.criteria || {}, {
      format: value.format,
      fields: value.fields,
      include_enrichment: value.include_enrichment,
      include_sightings: value.include_sightings
    });
    
    res.json({
      success: result.success,
      data: result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Generate import template
 * GET /api/v1/iocs/import-template
 */
router.get('/import-template', async (req, res) => {
  try {
    const format = req.query.format || 'json';
    const includeExamples = req.query.examples !== 'false';
    
    const template = await services.bulkService.generateTemplate(format, includeExamples);
    res.json({
      success: true,
      data: template,
      format
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get bulk statistics
 * GET /api/v1/iocs/bulk/stats
 */
router.get('/bulk/stats', async (req, res) => {
  try {
    const stats = await services.bulkService.getBulkStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== Search & Filtering Endpoints (7.7) ====================

/**
 * Simple search
 * GET /api/v1/iocs/search
 */
router.get('/search', async (req, res) => {
  try {
    const { query, type, status, limit, offset } = req.query;
    const results = await services.searchService.search(query, {
      type,
      status,
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0
    });
    
    res.json({
      success: true,
      ...results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Advanced search
 * POST /api/v1/iocs/search/advanced
 */
router.post('/search/advanced', async (req, res) => {
  try {
    const { error, value } = validators.advancedSearchSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const results = await services.searchService.advancedSearch(value);
    res.json({
      success: true,
      ...results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get search facets
 * GET /api/v1/iocs/search/facets
 */
router.get('/search/facets', async (req, res) => {
  try {
    const facets = await services.searchService.getSearchFacets();
    res.json({
      success: true,
      data: facets
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get search suggestions
 * GET /api/v1/iocs/search/suggestions
 */
router.get('/search/suggestions', async (req, res) => {
  try {
    const { query, limit } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'query parameter is required' });
    }
    
    const suggestions = await services.searchService.getSuggestions(query, parseInt(limit) || 10);
    res.json({
      success: true,
      data: suggestions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== IoC CRUD Endpoints ====================

/**
 * Get IoC statistics
 * GET /api/v1/iocs/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await iocRepository.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Create IoC
 * POST /api/v1/iocs
 */
router.post('/', async (req, res) => {
  try {
    const { error, value } = validators.iocSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const ioc = await iocRepository.create(value);
    res.status(201).json({
      success: true,
      data: ioc.toJSON(),
      message: 'IoC created successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get IoC by ID
 * GET /api/v1/iocs/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const ioc = await iocRepository.findById(req.params.id);
    if (!ioc) {
      return res.status(404).json({ error: 'IoC not found' });
    }
    
    res.json({
      success: true,
      data: ioc.toJSON()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * List IoCs
 * GET /api/v1/iocs
 */
router.get('/', async (req, res) => {
  try {
    const iocs = await iocRepository.find(req.query);
    res.json({
      success: true,
      data: iocs.map(ioc => ioc.toJSON ? ioc.toJSON() : ioc),
      total: iocs.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update IoC
 * PATCH /api/v1/iocs/:id
 */
router.patch('/:id', async (req, res) => {
  try {
    const ioc = await iocRepository.update(req.params.id, req.body);
    res.json({
      success: true,
      data: ioc.toJSON(),
      message: 'IoC updated successfully'
    });
  } catch (err) {
    if (err.message === 'IoC not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * Delete IoC
 * DELETE /api/v1/iocs/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await iocRepository.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'IoC not found' });
    }
    
    res.json({
      success: true,
      message: 'IoC deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
