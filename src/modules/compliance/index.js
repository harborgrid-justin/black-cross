/**
 * Compliance & Audit Management Module
 *
 * This module handles:
 * - Compliance framework mapping (NIST, ISO, PCI-DSS, HIPAA, GDPR, etc.)
 * - Audit trail and logging
 * - Compliance gap analysis
 * - Policy management and enforcement
 * - Automated compliance reporting
 * - Evidence collection for audits
 * - Regulatory requirement tracking
 */

const express = require('express');

const router = express.Router();
const { connectDatabase } = require('./config/database');
const complianceRoutes = require('./routes/complianceRoutes');
const logger = require('./utils/logger');

// Initialize database connection
let dbInitialized = false;
const initializeDatabase = async () => {
  if (!dbInitialized) {
    try {
      await connectDatabase();
      dbInitialized = true;
      logger.info('Compliance module database initialized');
    } catch (error) {
      logger.error('Failed to initialize database', { error: error.message });
    }
  }
};

// Health check route
router.get('/health', (req, res) => {
  res.json({
    module: 'compliance',
    status: 'operational',
    version: '1.0.0',
    database: dbInitialized ? 'connected' : 'disconnected',
    subFeatures: [
      'compliance-framework-mapping',
      'audit-trail-logging',
      'gap-analysis',
      'policy-management',
      'automated-reporting',
      'evidence-collection',
      'regulatory-requirement-tracking',
    ],
  });
});

// Mount routes
router.use('/', complianceRoutes);

// Initialize database on module load
initializeDatabase().catch((err) => {
  logger.error('Database initialization failed on module load', { error: err.message });
});

module.exports = router;
