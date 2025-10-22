import express from 'express';

const router = express.Router();
import complianceController from '../controllers/complianceController';
import { validate, commonSchemas, Joi } from '../../../middleware/validator';
import validatorSchemas from '../validators/complianceValidator';

const { complianceSchema, complianceUpdateSchema } = validatorSchemas;

// Framework routes
router.get('/frameworks', complianceController.getFrameworks);
router.get('/frameworks/:id', complianceController.getFramework);
router.post('/frameworks', validate({ body: complianceSchema }), complianceController.createFramework);
router.put('/frameworks/:id', validate({ body: complianceUpdateSchema }), complianceController.updateFramework);
router.delete('/frameworks/:id', complianceController.deleteFramework);

// Control routes
router.get('/frameworks/:frameworkId/controls', complianceController.getControls);
router.put('/frameworks/:frameworkId/controls/:controlId', complianceController.updateControl);

// Gap analysis routes
router.post('/frameworks/:frameworkId/analyze-gaps', complianceController.analyzeGaps);
router.get('/frameworks/:frameworkId/gaps', complianceController.getGaps);

// Audit log routes
router.get('/audit-logs', complianceController.getAuditLogs);

// Report routes
router.post('/frameworks/:frameworkId/reports', complianceController.generateReport);
router.get('/frameworks/:frameworkId/reports', complianceController.getFrameworkReports);
router.get('/reports', complianceController.getAllReports);
router.get('/reports/:reportId/export', complianceController.exportReport);

// Evidence routes
router.post('/frameworks/:frameworkId/controls/:controlId/evidence', complianceController.uploadEvidence);
router.delete('/frameworks/:frameworkId/controls/:controlId/evidence/:evidenceId', complianceController.deleteEvidence);

// Legacy CRUD routes (backward compatibility)
router.post('/', validate({ body: complianceSchema }), complianceController.create);
router.get('/', complianceController.list);
router.get('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), complianceController.getById);
router.put('/:id', validate({
  params: Joi.object({ id: commonSchemas.objectId.required() }),
  body: complianceUpdateSchema,
}), complianceController.update);
router.delete('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), complianceController.delete);

export default router;

