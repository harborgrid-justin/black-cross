/**
 * Risk Assessment & Scoring Module
 *
 * This module handles:
 * - Asset criticality assessment
 * - Threat impact analysis
 * - Risk calculation engine
 * - Risk-based prioritization
 * - Custom risk scoring models
 * - Risk trend visualization
 * - Executive risk reporting
 */

const express = require('express');

const router = express.Router();
const { connectDatabase } = require('./config/database');
const riskRoutes = require('./routes/riskRoutes');
const logger = require('./utils/logger');

// Initialize database connection
let dbInitialized = false;
const initializeDatabase = async () => {
  if (!dbInitialized) {
    try {
      await connectDatabase();
      dbInitialized = true;
      logger.info('Risk Assessment module database initialized');
    } catch (error) {
      logger.error('Failed to initialize database', { error: error.message });
    }
  }
};

// Health check route
router.get('/health', (req, res) => {
  res.json({
    module: 'risk-assessment',
    status: 'operational',
    version: '1.0.0',
    database: dbInitialized ? 'connected' : 'disconnected',
    subFeatures: [
      'asset-criticality-assessment',
      'threat-impact-analysis',
      'risk-calculation-engine',
      'risk-based-prioritization',
      'custom-risk-scoring-models',
      'risk-trend-visualization',
      'executive-risk-reporting',
    ],
  });
});

// Mount routes
router.use('/', riskRoutes);

// Initialize database on module load
initializeDatabase().catch((err) => {
  logger.error('Database initialization failed on module load', { error: err.message });
});

module.exports = router;
