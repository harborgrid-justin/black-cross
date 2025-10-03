/**
 * Reporting & Analytics Module
 *
 * This module handles:
 * - Customizable report templates
 * - Automated scheduled reporting
 * - Executive dashboards
 * - Threat trend analysis
 * - Metric tracking and KPIs
 * - Data visualization tools
 * - Export capabilities (PDF, CSV, JSON)
 */

const express = require('express');

const router = express.Router();
const { connectDatabase } = require('./config/database');
const reportRoutes = require('./routes/reportRoutes');
const logger = require('./utils/logger');

// Initialize database connection
let dbInitialized = false;
const initializeDatabase = async () => {
  if (!dbInitialized) {
    try {
      await connectDatabase();
      dbInitialized = true;
      logger.info('Reporting module database initialized');
    } catch (error) {
      logger.error('Failed to initialize database', { error: error.message });
    }
  }
};

// Health check route
router.get('/health', (req, res) => {
  res.json({
    module: 'reporting',
    status: 'operational',
    version: '1.0.0',
    database: dbInitialized ? 'connected' : 'disconnected',
    subFeatures: [
      'customizable-report-templates',
      'automated-scheduled-reporting',
      'executive-dashboards',
      'threat-trend-analysis',
      'metric-tracking-kpis',
      'data-visualization-tools',
      'export-capabilities',
    ],
  });
});

// Mount routes
router.use('/', reportRoutes);

// Initialize database on module load
initializeDatabase().catch((err) => {
  logger.error('Database initialization failed on module load', { error: err.message });
});

module.exports = router;
