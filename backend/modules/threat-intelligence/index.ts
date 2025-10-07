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

import express, { Router, Request, Response } from 'express';
import threatRoutes from './routes/threatRoutes';
import taxonomyRoutes from './routes/taxonomyRoutes';
import { isMongoConnected } from '../../utils/database';

const router: Router = express.Router();

// Health check route
router.get('/health', (req: Request, res: Response): void => {
  res.json({
    module: 'threat-intelligence',
    status: 'operational',
    version: '1.0.0',
    database: isMongoConnected() ? 'connected' : 'disconnected',
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

export default router;
