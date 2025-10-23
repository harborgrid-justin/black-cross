/**
 * Playbook Routes
 */

import express from 'express';
import playbookController from '../controllers/playbookController';
import { validate } from '../../../middleware/validator';
import playbookValidator from '../validators/playbookValidator';

const router = express.Router();

const {
  playbookSchema,
  playbookUpdateSchema,
  executePlaybookSchema,
  decisionSchema,
  testPlaybookSchema,
} = playbookValidator;

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
router.post('/', validate({ body: playbookSchema }), playbookController.createPlaybook);
router.get('/:id', playbookController.getPlaybook);
router.put('/:id', validate({ body: playbookUpdateSchema }), playbookController.updatePlaybook);
router.delete('/:id', playbookController.deletePlaybook);

// Playbook operations
router.post('/:id/clone', playbookController.clonePlaybook);
router.post('/:id/execute', validate({ body: executePlaybookSchema }), playbookController.executePlaybook);
router.get('/:id/export', playbookController.exportPlaybook);
router.post('/import', playbookController.importPlaybook);

// Decision routes
router.post('/:id/decisions', validate({ body: decisionSchema }), playbookController.addDecision);
router.get('/:id/paths', playbookController.getExecutionPaths);

// Testing routes
router.post('/:id/test', validate({ body: testPlaybookSchema }), playbookController.testPlaybook);
router.get('/:id/test-results', playbookController.getTestResults);

// Metrics routes
router.get('/:id/metrics', playbookController.getMetrics);

export default router;
