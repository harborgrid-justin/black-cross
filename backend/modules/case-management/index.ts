/**
 * Case Management - Router
 * API endpoints for case management operations
 */

import { Router } from 'express';
import * as controller from './controller';

const router = Router();

// Case endpoints
router.post('/cases', controller.createCase);
router.get('/cases', controller.getCases);
router.get('/cases/metrics', controller.getMetrics);
router.get('/cases/:id', controller.getCase);
router.put('/cases/:id', controller.updateCase);
router.delete('/cases/:id', controller.deleteCase);

// Task endpoints
router.post('/cases/:id/tasks', controller.createTask);
router.get('/cases/:id/tasks', controller.getCaseTasks);
router.put('/cases/:id/tasks/:taskId', controller.updateTask);
router.delete('/cases/:id/tasks/:taskId', controller.deleteTask);

// Comment endpoints
router.post('/cases/:id/comments', controller.addComment);
router.get('/cases/:id/comments', controller.getCaseComments);

// Timeline endpoint
router.get('/cases/:id/timeline', controller.getCaseTimeline);

// Template endpoints
router.post('/cases/templates', controller.createTemplate);
router.get('/cases/templates', controller.getTemplates);

export default router;
