/**
 * Playbook Routes
 */

const express = require('express');
const router = express.Router();
const playbookController = require('../controllers/playbookController');
const { 
  playbookSchema, 
  playbookUpdateSchema, 
  executePlaybookSchema,
  decisionSchema,
  testPlaybookSchema
} = require('../validators/playbookValidator');

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

// Library routes
router.get('/library', playbookController.getLibrary);
router.get('/categories', playbookController.getCategories);

// Analytics routes (must come before /:id routes)
router.get('/analytics', playbookController.getAnalytics);

// Execution routes
router.get('/executions', playbookController.listExecutions);
router.get('/executions/:id', playbookController.getExecution);
router.post('/executions/:id/cancel', playbookController.cancelExecution);
router.post('/executions/:id/approve', playbookController.approveExecution);

// Playbook CRUD routes
router.get('/', playbookController.listPlaybooks);
router.post('/', validate(playbookSchema), playbookController.createPlaybook);
router.get('/:id', playbookController.getPlaybook);
router.put('/:id', validate(playbookUpdateSchema), playbookController.updatePlaybook);
router.delete('/:id', playbookController.deletePlaybook);

// Playbook operations
router.post('/:id/clone', playbookController.clonePlaybook);
router.post('/:id/execute', validate(executePlaybookSchema), playbookController.executePlaybook);
router.get('/:id/export', playbookController.exportPlaybook);
router.post('/import', playbookController.importPlaybook);

// Decision routes
router.post('/:id/decisions', validate(decisionSchema), playbookController.addDecision);
router.get('/:id/paths', playbookController.getExecutionPaths);

// Testing routes
router.post('/:id/test', validate(testPlaybookSchema), playbookController.testPlaybook);
router.get('/:id/test-results', playbookController.getTestResults);

// Metrics routes
router.get('/:id/metrics', playbookController.getMetrics);

module.exports = router;
