import express from 'express';
import collaborationController from '../controllers/collaborationController';
import { validate, commonSchemas, Joi } from '../../../middleware/validator';
import validatorSchemas from '../validators/collaborationValidator';

const router = express.Router();

const { collaborationSchema, collaborationUpdateSchema } = validatorSchemas;

router.post('/', validate({ body: collaborationSchema }), collaborationController.create);
router.get('/', collaborationController.list);
router.get('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), collaborationController.getById);
router.put('/:id', validate({
  params: Joi.object({ id: commonSchemas.objectId.required() }),
  body: collaborationUpdateSchema,
}), collaborationController.update);
router.delete('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), collaborationController.delete);

export default router;
