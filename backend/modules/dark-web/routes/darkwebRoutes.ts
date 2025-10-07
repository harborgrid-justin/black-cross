import express from 'express';

const router = express.Router();
import darkwebController from '../controllers/darkwebController';
import { validate, commonSchemas, Joi } from '../../../middleware/validator';
import validatorSchemas from '../validators/darkwebValidator';

const { darkwebSchema, darkwebUpdateSchema } = validatorSchemas;

router.post('/', validate({ body: darkwebSchema }), darkwebController.create);
router.get('/', darkwebController.list);
router.get('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), darkwebController.getById);
router.put('/:id', validate({
  params: Joi.object({ id: commonSchemas.objectId.required() }),
  body: darkwebUpdateSchema,
}), darkwebController.update);
router.delete('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), darkwebController.delete);

export default router;

