import express from 'express';
import siemController from '../controllers/siemController';
import { validate, commonSchemas, Joi } from '../../../middleware/validator';
import validatorSchemas from '../validators/siemValidator';

const router = express.Router();

const { siemSchema, siemUpdateSchema } = validatorSchemas;

router.post('/', validate({ body: siemSchema }), siemController.create);
router.get('/', siemController.list);
router.get('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), siemController.getById);
router.put('/:id', validate({
  params: Joi.object({ id: commonSchemas.objectId.required() }),
  body: siemUpdateSchema,
}), siemController.update);
router.delete('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), siemController.delete);

export default router;
