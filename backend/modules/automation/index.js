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

const express = require('express');
const router = express.Router();
const { connectDatabase } = require('./config/database');
const playbookRoutes = require('./routes/playbookRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const logger = require('./utils/logger');

// Initialize database connection
let dbInitialized = false;
const initializeDatabase = async () => {
  if (!dbInitialized) {
    try {
      await connectDatabase();
      dbInitialized = true;
      logger.info('Automation module database initialized');
    } catch (error) {
      logger.error('Failed to initialize database', { error: error.message });
    }
  }
};

// Health check route
router.get('/health', (req, res) => {
  res.json({ 
    module: 'automation',
    status: 'operational',
    version: '1.0.0',
    database: dbInitialized ? 'connected' : 'disconnected',
    subFeatures: [
      'pre-built-playbooks',
      'custom-playbook-creation',
      'automated-action-execution',
      'security-tool-integration',
      'decision-trees',
      'playbook-testing',
      'effectiveness-metrics'
    ]
  });
});

// Mount routes
router.use('/playbooks', playbookRoutes);
router.use('/integrations', integrationRoutes);

// Initialize database on module load
initializeDatabase().catch(err => {
  logger.error('Database initialization failed on module load', { error: err.message });
});

module.exports = router;
