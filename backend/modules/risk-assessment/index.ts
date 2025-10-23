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

import express from 'express';
import riskRoutes from './routes/riskRoutes';
import logger from './utils/logger';
import { isMongoConnected } from '../../utils/database';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    module: 'risk-assessment',
    status: 'operational',
    version: '1.0.0',
    database: isMongoConnected() ? 'connected' : 'disconnected',
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

export default router;
