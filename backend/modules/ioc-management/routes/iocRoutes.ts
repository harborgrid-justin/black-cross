import express from 'express';

const router = express.Router();
import iocController from '../controllers/iocController';
import { validate, commonSchemas, Joi } from '../../../middleware/validator';
import validatorSchemas from '../validators/iocValidator';

const { iocSchema, iocUpdateSchema } = validatorSchemas;

// Base CRUD routes
router.post('/', validate({ body: iocSchema }), iocController.create);
router.get('/', iocController.list);
router.get('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), iocController.getById);
router.put('/:id', validate({
  params: Joi.object({ id: commonSchemas.objectId.required() }),
  body: iocUpdateSchema,
}), iocController.update);
router.delete('/:id', validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }), iocController.delete);

// Additional IoC operations
router.post('/bulk', iocController.bulkImport);
router.get('/export', iocController.exportIoCs);
router.post('/check', iocController.checkIoC);

export default router;

