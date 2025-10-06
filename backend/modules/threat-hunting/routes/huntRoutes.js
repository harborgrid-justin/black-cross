const express = require('express');

const router = express.Router();
const huntController = require('../controllers/huntController');
const { validate, commonSchemas } = require('../../../middleware/validator');
const {
  huntSessionSchema, huntQuerySchema, huntFindingSchema,
} = require('../validators/huntValidator');

router.post('/sessions', validate({ body: huntSessionSchema }), huntController.createSession);
router.get('/sessions', huntController.listSessions);
router.get('/sessions/:id', validate({ params: { id: commonSchemas.objectId.required() } }), huntController.getSession);
router.post('/sessions/:id/query', validate({
  params: { id: commonSchemas.objectId.required() },
  body: huntQuerySchema,
}), huntController.executeQuery);
router.post('/sessions/:id/findings', validate({
  params: { id: commonSchemas.objectId.required() },
  body: huntFindingSchema,
}), huntController.addFinding);

module.exports = router;
