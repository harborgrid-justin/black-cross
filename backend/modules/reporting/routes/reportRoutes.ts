import express from 'express';
import reportController from '../controllers/reportController';
import { validate, commonSchemas, Joi } from '../../../middleware/validator';
import validatorSchemas from '../validators/reportValidator';

const router = express.Router();

const { reportSchema, reportUpdateSchema } = validatorSchemas;

router.post('/', validate({ body: reportSchema }), reportController.create);
router.get('/', reportController.list);
router.get('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), reportController.getById);
router.put('/:id', validate({
  params: Joi.object({ id: commonSchemas.objectId.required() }),
  body: reportUpdateSchema,
}), reportController.update);
router.delete('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), reportController.delete);

export default router;
