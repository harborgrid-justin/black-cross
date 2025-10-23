/**
 * Incident Response & Management Module
 * Entry point for the module
 */

import type { Router } from 'express';
import express, { Request, Response } from 'express';
import incidentRoutes from './routes/incidentRoutes';

const router: Router = express.Router();

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

export default router;
