const express = require('express');

const router = express.Router();
const darkwebController = require('../controllers/darkwebController');
const { validate, commonSchemas } = require('../../../middleware/validator');
const { darkwebSchema, darkwebUpdateSchema } = require('../validators/darkwebValidator');

router.post('/', validate({ body: darkwebSchema }), darkwebController.create);
router.get('/', darkwebController.list);
router.get('/:id', validate({ params: { id: commonSchemas.objectId.required() } }), darkwebController.getById);
router.put('/:id', validate({
  params: { id: commonSchemas.objectId.required() },
  body: darkwebUpdateSchema,
}), darkwebController.update);
router.delete('/:id', validate({ params: { id: commonSchemas.objectId.required() } }), darkwebController.delete);

module.exports = router;
