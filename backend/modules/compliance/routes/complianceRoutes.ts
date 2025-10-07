import express from 'express';

const router = express.Router();
import complianceController from '../controllers/complianceController';
import { validate, commonSchemas, Joi } from '../../../middleware/validator';
import validatorSchemas from '../validators/complianceValidator';

const { complianceSchema, complianceUpdateSchema } = validatorSchemas;

router.post('/', validate({ body: complianceSchema }), complianceController.create);
router.get('/', complianceController.list);
router.get('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), complianceController.getById);
router.put('/:id', validate({
  params: Joi.object({ id: commonSchemas.objectId.required() }),
  body: complianceUpdateSchema,
}), complianceController.update);
router.delete('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), complianceController.delete);

export default router;

