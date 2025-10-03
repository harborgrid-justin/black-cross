/**
 * Collaboration & Workflow Module
 *
 * This module handles:
 * - Team workspace and project management
 * - Role-based access control (RBAC)
 * - Real-time collaboration tools
 * - Task assignment and tracking
 * - Knowledge base and wiki
 * - Secure chat and messaging
 * - Activity feeds and notifications
 */

const express = require('express');

const router = express.Router();
const { connectDatabase } = require('./config/database');
const workspaceRoutes = require('./routes/workspaceRoutes');
const taskRoutes = require('./routes/taskRoutes');
const collaborationRoutes = require('./routes/collaborationRoutes');
const logger = require('./utils/logger');

// Initialize database connection
let dbInitialized = false;
const initializeDatabase = async () => {
  if (!dbInitialized) {
    try {
      await connectDatabase();
      dbInitialized = true;
      logger.info('Collaboration module database initialized');
    } catch (error) {
      logger.error('Failed to initialize database', { error: error.message });
    }
  }
};

// Health check route
router.get('/health', (req, res) => {
  res.json({
    module: 'collaboration',
    status: 'operational',
    version: '1.0.0',
    database: dbInitialized ? 'connected' : 'disconnected',
    subFeatures: [
      'workspace-management',
      'rbac',
      'real-time-collaboration',
      'task-management',
      'knowledge-base',
      'secure-messaging',
      'activity-notifications',
    ],
  });
});

// Mount routes
router.use('/', workspaceRoutes);
router.use('/', taskRoutes);
router.use('/', collaborationRoutes);

// Initialize database on module load
initializeDatabase().catch((err) => {
  logger.error('Database initialization failed on module load', { error: err.message });
});

module.exports = router;
