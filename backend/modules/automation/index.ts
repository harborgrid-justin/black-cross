/**
 * Automated Response & Playbooks Module
 *
 * This module handles:
 * - Pre-built response playbooks (Sub-Feature 15.1)
 * - Custom playbook creation (Sub-Feature 15.2)
 * - Automated action execution (Sub-Feature 15.3)
 * - Integration with security tools (Sub-Feature 15.4)
 * - Decision trees and conditional logic (Sub-Feature 15.5)
 * - Playbook testing and simulation (Sub-Feature 15.6)
 * - Response effectiveness metrics (Sub-Feature 15.7)
 */

import express from 'express';
import playbookRoutes from './routes/playbookRoutes';
import integrationRoutes from './routes/integrationRoutes';
import { isMongoConnected } from '../../utils/database';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    module: 'automation',
    status: 'operational',
    version: '1.0.0',
    database: isMongoConnected() ? 'connected' : 'disconnected',
    subFeatures: [
      'pre-built-playbooks',
      'custom-playbook-creation',
      'automated-action-execution',
      'security-tool-integration',
      'decision-trees',
      'playbook-testing',
      'effectiveness-metrics',
    ],
  });
});

// Mount routes
router.use('/playbooks', playbookRoutes);
router.use('/integrations', integrationRoutes);

export default router;
