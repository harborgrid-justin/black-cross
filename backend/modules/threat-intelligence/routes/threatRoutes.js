/**
 * Threat Intelligence Routes
 * @swagger
 * tags:
 *   name: Threat Intelligence
 *   description: Threat intelligence collection and management
 */

const express = require('express');

const router = express.Router();
const threatController = require('../controllers/threatController');
const { validate, Joi } = require('../../../middleware/validator');
const { endpointRateLimiter } = require('../../../middleware/rateLimiter');
const {
  threatSchema, categorizationSchema, enrichmentSchema, archiveSchema, correlationSchema,
} = require('../validators/threatValidator');

// Apply stricter rate limiting to threat intelligence endpoints
const threatRateLimit = endpointRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
});

/**
 * @swagger
 * /api/v1/threat-intelligence/threats:
 *   get:
 *     summary: List all threats
 *     description: Retrieve a paginated list of threats with optional filtering
 *     tags: [Threat Intelligence]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - name: severity
 *         in: query
 *         schema:
 *           type: string
 *           enum: [critical, high, medium, low, info]
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of threats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get('/threats', threatRateLimit, threatController.listThreats);

/**
 * @swagger
 * /api/v1/threat-intelligence/threats:
 *   post:
 *     summary: Create a new threat
 *     description: Collect and store new threat intelligence
 *     tags: [Threat Intelligence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - severity
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [malware, phishing, ransomware, apt, botnet, ddos]
 *               severity:
 *                 type: string
 *                 enum: [critical, high, medium, low, info]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Threat created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/threats', threatRateLimit, validate({ body: threatSchema }), threatController.collectThreat);

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
