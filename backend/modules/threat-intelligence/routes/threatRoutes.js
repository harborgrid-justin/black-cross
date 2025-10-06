/**
 * Threat Intelligence Routes
 */

const express = require('express');

const router = express.Router();
const threatController = require('../controllers/threatController');
const { validate, Joi } = require('../../../middleware/validator');
const {
  threatSchema, categorizationSchema, enrichmentSchema, archiveSchema, correlationSchema,
} = require('../validators/threatValidator');

// Basic CRUD routes (must come first before specific routes to avoid conflicts)
router.get('/threats', threatController.listThreats);
router.post('/threats', validate({ body: threatSchema }), threatController.collectThreat);

// Threat collection routes
router.post('/threats/collect', validate({ body: threatSchema }), threatController.collectThreat);
router.get('/threats/stream', threatController.streamThreats);

// Threat categorization routes
router.post('/threats/categorize', validate({ body: categorizationSchema }), threatController.categorizeThreat);
router.get('/threats/categories', threatController.getCategories);

// Threat archival routes
router.post('/threats/archive', validate({ body: archiveSchema }), threatController.archiveThreats);
router.get('/threats/history', threatController.getHistory);

// Threat enrichment routes
router.post('/threats/enrich', validate({ body: enrichmentSchema }), threatController.enrichThreat);

// Threat correlation routes
router.post('/threats/correlate', validate({ body: correlationSchema }), threatController.correlateThreats);

// Threat context routes
router.post('/threats/analyze', threatController.analyzeThreats);

// ID-based routes (must come last to avoid conflicts with named routes)
const idSchema = { params: Joi.object({ id: Joi.string().required() }) };
router.get('/threats/:id', validate(idSchema), threatController.getThreat);
router.put('/threats/:id', validate({
  params: Joi.object({ id: Joi.string().required() }),
  body: threatSchema,
}), threatController.updateThreat);
router.delete('/threats/:id', validate(idSchema), threatController.deleteThreat);
router.get('/threats/:id/enriched', validate(idSchema), threatController.getEnrichedThreat);
router.get('/threats/:id/related', validate(idSchema), threatController.getRelatedThreats);
router.get('/threats/:id/context', validate(idSchema), threatController.getThreatContext);

module.exports = router;
