import express from 'express';
import huntController from '../controllers/huntController';
import { validate, commonSchemas } from '../../../middleware/validator';
import huntValidator from '../validators/huntValidator';

const router = express.Router();

const { huntSessionSchema, huntQuerySchema, huntFindingSchema } = huntValidator;

router.post('/sessions', validate({ body: huntSessionSchema }), huntController.createSession);
router.get('/sessions', huntController.listSessions);
router.get('/sessions/:id', validate({ params: commonSchemas.objectId }), huntController.getSession);
router.post('/sessions/:id/query', validate({
  params: commonSchemas.objectId,
  body: huntQuerySchema,
}), huntController.executeQuery);
router.post('/sessions/:id/findings', validate({
  params: commonSchemas.objectId,
  body: huntFindingSchema,
}), huntController.addFinding);

export default router;
