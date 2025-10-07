import express from 'express';

const router = express.Router();
import siemController from '../controllers/siemController';
import { validate, commonSchemas, Joi } from '../../../middleware/validator';
import validatorSchemas from '../validators/siemValidator';

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

