/**
 * STIX 2.1 Module - Main Router
 * Provides STIX 2.1 import/export capabilities
 */

import express from 'express';
import { stixController } from './controller';
import { requireCapability } from '../../middleware/access-control';
import { CAPABILITIES } from '../../utils/access';

const router = express.Router();

// Export entities to STIX bundle
router.post('/export',
  requireCapability(CAPABILITIES.KNOWLEDGE_EXPORT),
  stixController.exportBundle.bind(stixController)
);

// Import STIX bundle
router.post('/import',
  requireCapability(CAPABILITIES.KNOWLEDGE_IMPORT),
  stixController.importBundle.bind(stixController)
);

// Convert single entity to STIX
router.post('/convert',
  requireCapability(CAPABILITIES.KNOWLEDGE_READ),
  stixController.convertToSTIX.bind(stixController)
);

// Parse STIX pattern
router.post('/parse-pattern',
  requireCapability(CAPABILITIES.KNOWLEDGE_READ),
  stixController.parsePattern.bind(stixController)
);

export default router;
