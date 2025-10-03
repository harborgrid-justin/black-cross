/**
 * Compliance Routes
 */

const express = require('express');

const router = express.Router();
const complianceController = require('../controllers/complianceController');
const {
  controlSchema,
  frameworkMappingSchema,
  gapAnalysisSchema,
  policySchema,
  reportGenerationSchema,
  evidenceSchema,
  requirementTrackingSchema,
} = require('../validators/complianceValidator');

// Validation middleware
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  next();
};

// Framework mapping routes
router.get('/frameworks', complianceController.getFrameworks);
router.post('/frameworks/:framework/map', validate(frameworkMappingSchema), complianceController.mapFramework);

// Control management routes
router.post('/controls', validate(controlSchema), complianceController.createControl);
router.get('/controls', complianceController.getControls);

// Audit trail routes
router.get('/audit/logs', complianceController.getAuditLogs);
router.post('/audit/logs', complianceController.createAuditLog);
router.get('/audit/logs/user/:userId', complianceController.getUserAuditLogs);

// Gap analysis routes
router.post('/gap-analysis', validate(gapAnalysisSchema), complianceController.performGapAnalysis);
router.get('/gaps', complianceController.getGaps);

// Policy management routes
router.post('/policies', validate(policySchema), complianceController.createPolicy);
router.get('/policies', complianceController.listPolicies);
router.get('/policies/:policyId', complianceController.getPolicy);

// Compliance reporting routes
router.post('/reports/generate', validate(reportGenerationSchema), complianceController.generateReport);
router.get('/reports', complianceController.getReports);

// Evidence collection routes
router.post('/evidence', validate(evidenceSchema), complianceController.addEvidence);
router.get('/evidence/:controlId', complianceController.getEvidence);

// Regulatory requirement tracking routes
router.get('/requirements', complianceController.getRequirements);
router.post('/requirements/track', validate(requirementTrackingSchema), complianceController.trackRequirement);

module.exports = router;
