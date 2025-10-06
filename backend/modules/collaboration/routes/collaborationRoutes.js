const express = require('express');

const router = express.Router();
const collaborationController = require('../controllers/collaborationController');
const { validate, commonSchemas } = require('../../../middleware/validator');
const { collaborationSchema, collaborationUpdateSchema } = require('../validators/collaborationValidator');

router.post('/', validate({ body: collaborationSchema }), collaborationController.create);
router.get('/', collaborationController.list);
router.get('/:id', validate({ params: { id: commonSchemas.objectId.required() } }), collaborationController.getById);
router.put('/:id', validate({
  params: { id: commonSchemas.objectId.required() },
  body: collaborationUpdateSchema,
}), collaborationController.update);
router.delete('/:id', validate({ params: { id: commonSchemas.objectId.required() } }), collaborationController.delete);

module.exports = router;
