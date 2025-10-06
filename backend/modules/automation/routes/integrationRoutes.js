/**
 * Integration Routes
 */

const express = require('express');

const router = express.Router();
const integrationController = require('../controllers/integrationController');
const { validate } = require('../../../middleware/validator');
const {
  integrationSchema,
  integrationUpdateSchema,
  testIntegrationSchema,
} = require('../validators/integrationValidator');

// Integration types and statistics (must come before /:id routes)
router.get('/types', integrationController.getIntegrationTypes);
router.get('/statistics', integrationController.getStatistics);

// Integration CRUD routes
router.get('/', integrationController.listIntegrations);
router.post('/', validate({ body: integrationSchema }), integrationController.createIntegration);
router.get('/:id', integrationController.getIntegration);
router.put('/:id', validate({ body: integrationUpdateSchema }), integrationController.updateIntegration);
router.delete('/:id', integrationController.deleteIntegration);

// Integration operations
router.post('/:id/test', validate({ body: testIntegrationSchema }), integrationController.testIntegration);

module.exports = router;
