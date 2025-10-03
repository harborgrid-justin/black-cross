/**
 * Integration Routes
 */

const express = require('express');

const router = express.Router();
const integrationController = require('../controllers/integrationController');
const {
  integrationSchema,
  integrationUpdateSchema,
  testIntegrationSchema,
} = require('../validators/integrationValidator');

// Validation middleware
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

// Integration types and statistics (must come before /:id routes)
router.get('/types', integrationController.getIntegrationTypes);
router.get('/statistics', integrationController.getStatistics);

// Integration CRUD routes
router.get('/', integrationController.listIntegrations);
router.post('/', validate(integrationSchema), integrationController.createIntegration);
router.get('/:id', integrationController.getIntegration);
router.put('/:id', validate(integrationUpdateSchema), integrationController.updateIntegration);
router.delete('/:id', integrationController.deleteIntegration);

// Integration operations
router.post('/:id/test', validate(testIntegrationSchema), integrationController.testIntegration);

module.exports = router;
