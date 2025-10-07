import express from 'express';

const router = express.Router();
import actorController from '../controllers/actorController';
import { validate, commonSchemas, Joi } from '../../../middleware/validator';
import validatorSchemas from '../validators/actorValidator';

const { actorSchema, actorUpdateSchema } = validatorSchemas;

router.post('/', validate({ body: actorSchema }), actorController.create);
router.get('/', actorController.list);
router.get('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), actorController.getById);
router.put('/:id', validate({
  params: Joi.object({ id: commonSchemas.objectId.required() }),
  body: actorUpdateSchema,
}), actorController.update);
router.delete('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), actorController.delete);

export default router;

