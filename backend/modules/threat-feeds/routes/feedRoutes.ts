import express from 'express';

const router = express.Router();
import feedController from '../controllers/feedController';
import { validate, commonSchemas, Joi } from '../../../middleware/validator';
import validatorSchemas from '../validators/feedValidator';

const { feedSchema, feedUpdateSchema } = validatorSchemas;

router.post('/', validate({ body: feedSchema }), feedController.create);
router.get('/', feedController.list);
router.get('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), feedController.getById);
router.put('/:id', validate({
  params: Joi.object({ id: commonSchemas.objectId.required() }),
  body: feedUpdateSchema,
}), feedController.update);
router.delete('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), feedController.delete);

export default router;

