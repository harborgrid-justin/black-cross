/**
 * Risk Assessment Routes
 */

import express from 'express';
import riskController from '../controllers/riskController';
import validators from '../validators/riskValidator';

const router = express.Router();
const {
  assetCriticalitySchema,
  threatImpactSchema,
  riskCalculationSchema,
  riskModelSchema,
  reportOptionsSchema,
} = validators;

// Validation middleware
const validate = (schema: any) => (req: any, res: any, next: any) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

// Asset Criticality Assessment routes
router.post('/assets/assess', validate(assetCriticalitySchema), riskController.assessAsset);
router.get('/assets/:id/criticality', riskController.getAssetCriticality);

// Threat Impact Analysis routes
router.post('/threats/:id/impact', validate(threatImpactSchema), riskController.analyzeThreatImpact);
router.get('/impact-analysis', riskController.getImpactAnalysis);

// Risk Calculation Engine routes
router.post('/calculate', validate(riskCalculationSchema), riskController.calculateRisk);
router.get('/scores', riskController.getRiskScores);

// Risk-Based Prioritization routes
router.get('/priorities', riskController.getPriorities);
router.post('/reprioritize', riskController.reprioritize);

// Custom Risk Scoring Models routes
router.post('/models', validate(riskModelSchema), riskController.createModel);
router.put('/models/:id', riskController.updateModel);

// Risk Trend Visualization routes
router.get('/trends', riskController.getTrends);
router.get('/visualizations', riskController.getVisualizations);

// Executive Risk Reporting routes
router.get('/reports/executive', riskController.getExecutiveReport);
router.post('/reports/generate', validate(reportOptionsSchema), riskController.generateReport);

export default router;
