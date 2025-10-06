const express = require('express');

const router = express.Router();
const actorController = require('../controllers/actorController');
const { validate, commonSchemas } = require('../../../middleware/validator');
const { actorSchema, actorUpdateSchema } = require('../validators/actorValidator');

router.post('/', validate({ body: actorSchema }), actorController.create);
router.get('/', actorController.list);
router.get('/:id', validate({ params: { id: commonSchemas.objectId.required() } }), actorController.getById);
router.put('/:id', validate({
  params: { id: commonSchemas.objectId.required() },
  body: actorUpdateSchema,
}), actorController.update);
router.delete('/:id', validate({ params: { id: commonSchemas.objectId.required() } }), actorController.delete);

module.exports = router;
