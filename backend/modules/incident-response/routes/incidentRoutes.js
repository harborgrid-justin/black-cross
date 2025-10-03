/**
 * Incident Routes
 * API endpoints for incident management
 */

const express = require('express');

const router = express.Router();
const incidentController = require('../controllers/incidentController');

// Incident CRUD
router.post('/incidents', incidentController.createIncident);
router.get('/incidents', incidentController.listIncidents);
router.get('/incidents/stats', incidentController.getStatistics);
router.get('/incidents/:id', incidentController.getIncident);
router.patch('/incidents/:id', incidentController.updateIncident);

// Prioritization
router.post('/incidents/:id/prioritize', incidentController.prioritizeIncident);
router.get('/incidents-priority-queue', incidentController.getPriorityQueue);

// Workflow execution
router.post('/incidents/:id/execute-workflow', incidentController.executeWorkflow);
router.get('/workflows', incidentController.getWorkflows);

// Post-mortem
router.post('/incidents/:id/post-mortem', incidentController.createPostMortem);
router.get('/incidents/:id/report', incidentController.generateReport);

// Timeline
router.get('/incidents/:id/timeline', incidentController.getTimeline);
router.post('/incidents/:id/events', incidentController.addTimelineEvent);

// Evidence
router.post('/incidents/:id/evidence', incidentController.addEvidence);
router.get('/incidents/:id/evidence/:evidence_id', incidentController.getEvidence);

// Notifications
router.post('/incidents/:id/notify', incidentController.sendNotification);
router.get('/incidents/:id/communications', incidentController.getCommunications);

module.exports = router;
