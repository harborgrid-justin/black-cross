/**
 * Incident Response Routes
 * Main router for incident response module
 */

const express = require('express');
const router = express.Router();

// Import controllers
const incidentController = require('../controllers/incidentController');
const prioritizationController = require('../controllers/prioritizationController');
const workflowController = require('../controllers/workflowController');
const timelineController = require('../controllers/timelineController');
const evidenceController = require('../controllers/evidenceController');
const notificationController = require('../controllers/notificationController');
const postMortemController = require('../controllers/postMortemController');

// === Incident Routes ===

// Create incident
router.post('/incidents', incidentController.createIncident.bind(incidentController));

// Get incident statistics (must be before /:id route)
router.get('/incidents/stats', incidentController.getStatistics.bind(incidentController));

// Get priority queue
router.get('/incidents/priority-queue', incidentController.getPriorityQueue.bind(incidentController));

// Reprioritize all incidents
router.post('/incidents/reprioritize', prioritizationController.reprioritizeAll.bind(prioritizationController));

// Get prioritization rules
router.get('/incidents/prioritization-rules', prioritizationController.getCustomRules.bind(prioritizationController));

// List incidents
router.get('/incidents', incidentController.listIncidents.bind(incidentController));

// Get incident by ID
router.get('/incidents/:id', incidentController.getIncident.bind(incidentController));

// Update incident
router.patch('/incidents/:id', incidentController.updateIncident.bind(incidentController));

// Delete incident
router.delete('/incidents/:id', incidentController.deleteIncident.bind(incidentController));

// Close incident
router.post('/incidents/:id/close', incidentController.closeIncident.bind(incidentController));

// Reopen incident
router.post('/incidents/:id/reopen', incidentController.reopenIncident.bind(incidentController));

// Link incidents
router.post('/incidents/:id/link', incidentController.linkIncidents.bind(incidentController));

// Prioritize incident
router.post('/incidents/:id/prioritize', prioritizationController.prioritizeIncident.bind(prioritizationController));

// === Workflow Routes ===

// List workflow templates
router.get('/workflows/templates', workflowController.listTemplates.bind(workflowController));

// Create workflow
router.post('/workflows', workflowController.createWorkflow.bind(workflowController));

// Get workflow
router.get('/workflows/:id', workflowController.getWorkflow.bind(workflowController));

// Pause workflow
router.post('/workflows/:id/pause', workflowController.pauseWorkflow.bind(workflowController));

// Resume workflow
router.post('/workflows/:id/resume', workflowController.resumeWorkflow.bind(workflowController));

// Cancel workflow
router.post('/workflows/:id/cancel', workflowController.cancelWorkflow.bind(workflowController));

// Execute workflow for incident
router.post('/incidents/:id/execute-workflow', workflowController.executeWorkflow.bind(workflowController));

// === Timeline Routes ===

// Get timeline
router.get('/incidents/:id/timeline', timelineController.getTimeline.bind(timelineController));

// Create timeline event
router.post('/incidents/:id/events', timelineController.createEvent.bind(timelineController));

// Export timeline
router.get('/incidents/:id/timeline/export', timelineController.exportTimeline.bind(timelineController));

// Get timeline stats
router.get('/incidents/:id/timeline/stats', timelineController.getTimelineStats.bind(timelineController));

// Search timeline
router.get('/incidents/:id/timeline/search', timelineController.searchEvents.bind(timelineController));

// Add annotation to event
router.post('/timeline-events/:id/annotations', timelineController.addAnnotation.bind(timelineController));

// === Evidence Routes ===

// Search evidence
router.get('/evidence/search', evidenceController.searchEvidence.bind(evidenceController));

// Get evidence
router.get('/incidents/:incidentId/evidence/:evidenceId', evidenceController.getEvidence.bind(evidenceController));

// List evidence for incident
router.get('/incidents/:id/evidence', evidenceController.listEvidence.bind(evidenceController));

// Collect evidence
router.post('/incidents/:id/evidence', evidenceController.collectEvidence.bind(evidenceController));

// Get evidence stats
router.get('/incidents/:id/evidence/stats', evidenceController.getEvidenceStats.bind(evidenceController));

// Transfer custody
router.post('/evidence/:id/transfer', evidenceController.transferCustody.bind(evidenceController));

// Tag evidence
router.post('/evidence/:id/tags', evidenceController.tagEvidence.bind(evidenceController));

// Delete evidence
router.delete('/evidence/:id', evidenceController.deleteEvidence.bind(evidenceController));

// Get chain of custody
router.get('/evidence/:id/chain-of-custody', evidenceController.getChainOfCustody.bind(evidenceController));

// === Notification Routes ===

// Get notification templates
router.get('/notifications/templates', notificationController.getTemplates.bind(notificationController));

// Send bulk notifications
router.post('/notifications/bulk', notificationController.sendBulkNotifications.bind(notificationController));

// Get notification
router.get('/notifications/:id', notificationController.getNotification.bind(notificationController));

// Send notification
router.post('/incidents/:id/notify', notificationController.sendNotification.bind(notificationController));

// List notifications for incident
router.get('/incidents/:id/communications', notificationController.listNotifications.bind(notificationController));

// Get notification stats
router.get('/incidents/:id/communications/stats', notificationController.getNotificationStats.bind(notificationController));

// Set user notification preferences
router.put('/users/:userId/notification-preferences', notificationController.setUserPreferences.bind(notificationController));

// === Post-Mortem Routes ===

// Analyze trends
router.get('/post-mortems/trends', postMortemController.analyzeTrends.bind(postMortemController));

// Get post-mortem
router.get('/post-mortems/:id', postMortemController.getPostMortem.bind(postMortemController));

// Update post-mortem
router.patch('/post-mortems/:id', postMortemController.updatePostMortem.bind(postMortemController));

// Generate executive summary
router.get('/post-mortems/:id/executive-summary', postMortemController.generateExecutiveSummary.bind(postMortemController));

// Add lesson learned
router.post('/post-mortems/:id/lessons', postMortemController.addLessonLearned.bind(postMortemController));

// Add recommendation
router.post('/post-mortems/:id/recommendations', postMortemController.addRecommendation.bind(postMortemController));

// Add action item
router.post('/post-mortems/:id/action-items', postMortemController.addActionItem.bind(postMortemController));

// Create post-mortem for incident
router.post('/incidents/:id/post-mortem', postMortemController.createPostMortem.bind(postMortemController));

// Get post-mortem by incident
router.get('/incidents/:id/post-mortem', postMortemController.getPostMortemByIncident.bind(postMortemController));

// Generate full report
router.get('/incidents/:id/report', postMortemController.generateFullReport.bind(postMortemController));

// Health check
router.get('/health', (req, res) => {
  res.json({
    module: 'incident-response',
    status: 'operational',
    version: '1.0.0',
    subFeatures: [
      'incident-tracking',
      'automated-prioritization',
      'workflow-automation',
      'timeline-visualization',
      'evidence-collection',
      'communication-notification',
      'post-incident-analysis'
    ]
  });
});

module.exports = router;
