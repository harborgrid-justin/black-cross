import express from 'express';

const router = express.Router();
import iocController from '../controllers/iocController';
import { validate, commonSchemas, Joi } from '../../../middleware/validator';
import validatorSchemas from '../validators/iocValidator';

const { iocSchema, iocUpdateSchema } = validatorSchemas;

router.post('/', validate({ body: iocSchema }), iocController.create);
router.get('/', iocController.list);
router.get('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), iocController.getById);
router.put('/:id', validate({
  params: Joi.object({ id: commonSchemas.objectId.required() }),
  body: iocUpdateSchema,
}), iocController.update);
router.delete('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), iocController.delete);

export default router;

