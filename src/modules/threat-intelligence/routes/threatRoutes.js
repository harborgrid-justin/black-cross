/**
 * Threat Intelligence Routes
 */

const express = require('express');
const router = express.Router();
const threatController = require('../controllers/threatController');
const { threatSchema, categorizationSchema, enrichmentSchema, archiveSchema, correlationSchema } = require('../validators/threatValidator');

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  };
};

// Threat collection routes
router.post('/threats/collect', validate(threatSchema), threatController.collectThreat);
router.get('/threats/stream', threatController.streamThreats);

// Threat categorization routes
router.post('/threats/categorize', validate(categorizationSchema), threatController.categorizeThreat);
router.get('/threats/categories', threatController.getCategories);

// Threat archival routes
router.post('/threats/archive', validate(archiveSchema), threatController.archiveThreats);
router.get('/threats/history', threatController.getHistory);

// Threat enrichment routes
router.post('/threats/enrich', validate(enrichmentSchema), threatController.enrichThreat);
router.get('/threats/:id/enriched', threatController.getEnrichedThreat);

// Threat correlation routes
router.post('/threats/correlate', validate(correlationSchema), threatController.correlateThreats);
router.get('/threats/:id/related', threatController.getRelatedThreats);

// Threat context routes
router.get('/threats/:id/context', threatController.getThreatContext);
router.post('/threats/analyze', threatController.analyzeThreats);

module.exports = router;
