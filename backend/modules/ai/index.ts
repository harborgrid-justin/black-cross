/**
 * AI Module - Main Router
 * Provides AI-powered content generation and analysis endpoints
 */

import express from 'express';
import { aiController } from './controller';
import { requireCapability } from '../../middleware/access-control';
import { CAPABILITIES } from '../../utils/access';

const router = express.Router();

// Check AI service status (public)
router.get('/status', aiController.getStatus.bind(aiController));

// Content generation endpoints (require AI_USE capability)
router.post('/fix-spelling',
  requireCapability(CAPABILITIES.AI_USE),
  aiController.fixSpelling.bind(aiController)
);

router.post('/make-shorter',
  requireCapability(CAPABILITIES.AI_USE),
  aiController.makeShorter.bind(aiController)
);

router.post('/make-longer',
  requireCapability(CAPABILITIES.AI_USE),
  aiController.makeLonger.bind(aiController)
);

router.post('/change-tone',
  requireCapability(CAPABILITIES.AI_USE),
  aiController.changeTone.bind(aiController)
);

router.post('/summarize',
  requireCapability(CAPABILITIES.AI_USE),
  aiController.summarize.bind(aiController)
);

// Report generation (require REPORT_CREATE capability)
router.post('/generate-report',
  requireCapability(CAPABILITIES.REPORT_CREATE),
  aiController.generateReport.bind(aiController)
);

// Threat analysis
router.post('/analyze-threat',
  requireCapability(CAPABILITIES.AI_USE),
  aiController.analyzeThreat.bind(aiController)
);

// IOC extraction
router.post('/extract-iocs',
  requireCapability(CAPABILITIES.AI_USE),
  aiController.extractIOCs.bind(aiController)
);

// Usage statistics
router.get('/usage',
  requireCapability(CAPABILITIES.AI_USE),
  aiController.getUsage.bind(aiController)
);

export default router;
