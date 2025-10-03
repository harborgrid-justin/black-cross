/**
 * Incident Response & Management Module
 * Entry point for the module
 */

const express = require('express');

const router = express.Router();
const incidentRoutes = require('./routes/incidentRoutes');

// Health check route
router.get('/health', (req, res) => {
  res.json({
    module: 'incident-response',
    status: 'operational',
    version: '1.0.0',
    subFeatures: [
      'incident-ticket-creation',
      'automated-prioritization',
      'workflow-automation',
      'post-incident-analysis',
      'timeline-visualization',
      'evidence-collection',
      'communication-notification',
    ],
  });
});

// Mount routes
router.use('/', incidentRoutes);

module.exports = router;
