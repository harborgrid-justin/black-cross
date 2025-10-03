/**
 * Threat Intelligence Management Module
 *
 * This module handles:
 * - Real-time threat data collection and aggregation
 * - Threat categorization and tagging system
 * - Historical threat data archival
 * - Threat intelligence enrichment
 * - Custom threat taxonomy management
 * - Automated threat correlation
 * - Threat context analysis
 */

const express = require('express');

const router = express.Router();
const { connectDatabase } = require('./config/database');
const threatRoutes = require('./routes/threatRoutes');
const taxonomyRoutes = require('./routes/taxonomyRoutes');
const logger = require('./utils/logger');

// Initialize database connection
let dbInitialized = false;
const initializeDatabase = async () => {
  if (!dbInitialized) {
    try {
      await connectDatabase();
      dbInitialized = true;
      logger.info('Threat Intelligence module database initialized');
    } catch (error) {
      logger.error('Failed to initialize database', { error: error.message });
    }
  }
};

// Health check route
router.get('/health', (req, res) => {
  res.json({
    module: 'threat-intelligence',
    status: 'operational',
    version: '1.0.0',
    database: dbInitialized ? 'connected' : 'disconnected',
    subFeatures: [
      'real-time-collection',
      'categorization',
      'archival',
      'enrichment',
      'taxonomy-management',
      'correlation',
      'context-analysis',
    ],
  });
});

// Mount routes
router.use('/', threatRoutes);
router.use('/', taxonomyRoutes);

// Initialize database on module load
initializeDatabase().catch((err) => {
  logger.error('Database initialization failed on module load', { error: err.message });
});

module.exports = router;
