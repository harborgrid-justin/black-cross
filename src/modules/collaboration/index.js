/**
 * Collaboration & Workflow Module
 *
 * This module handles:
 * - Team workspace and project management
 * - Role-based access control
 * - Real-time collaboration tools
 * - Task assignment and tracking
 * - Knowledge base and wiki
 * - Secure chat and messaging
 * - Activity feeds and notifications
 */

const express = require('express');
const { connectDatabase } = require('./config/database');
const workspaceRoutes = require('./routes/workspaceRoutes');
const roleRoutes = require('./routes/roleRoutes');
const taskRoutes = require('./routes/taskRoutes');
const articleRoutes = require('./routes/articleRoutes');
const messageRoutes = require('./routes/messageRoutes');
const activityRoutes = require('./routes/activityRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const collaborationRoutes = require('./routes/collaborationRoutes');
const logger = require('./utils/logger');

const router = express.Router();

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
      'role-based-access-control',
      'real-time-collaboration',
      'task-management',
      'knowledge-base',
      'secure-messaging',
      'activity-feed',
      'notifications',
    ],
  });
});

// Mount routes
router.use('/', workspaceRoutes);
router.use('/', roleRoutes);
router.use('/', taskRoutes);
router.use('/', articleRoutes);
router.use('/', messageRoutes);
router.use('/', activityRoutes);
router.use('/', notificationRoutes);
router.use('/', collaborationRoutes);

// Initialize database on module load
initializeDatabase().catch((err) => {
  logger.error('Database initialization failed on module load', { error: err.message });
});

module.exports = router;
