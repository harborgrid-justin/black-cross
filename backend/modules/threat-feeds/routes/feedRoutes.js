const express = require('express');

const router = express.Router();
const feedController = require('../controllers/feedController');
const { validate, commonSchemas } = require('../../../middleware/validator');
const { feedSchema, feedUpdateSchema } = require('../validators/feedValidator');

router.post('/', validate({ body: feedSchema }), feedController.create);
router.get('/', feedController.list);
router.get('/:id', validate({ params: { id: commonSchemas.objectId.required() } }), feedController.getById);
router.put('/:id', validate({
  params: { id: commonSchemas.objectId.required() },
  body: feedUpdateSchema,
}), feedController.update);
router.delete('/:id', validate({ params: { id: commonSchemas.objectId.required() } }), feedController.delete);

module.exports = router;
