const express = require('express');

const router = express.Router();
const siemController = require('../controllers/siemController');
const { validate, commonSchemas } = require('../../../middleware/validator');
const { siemSchema, siemUpdateSchema } = require('../validators/siemValidator');

router.post('/', validate({ body: siemSchema }), siemController.create);
router.get('/', siemController.list);
router.get('/:id', validate({ params: { id: commonSchemas.objectId.required() } }), siemController.getById);
router.put('/:id', validate({
  params: { id: commonSchemas.objectId.required() },
  body: siemUpdateSchema,
}), siemController.update);
router.delete('/:id', validate({ params: { id: commonSchemas.objectId.required() } }), siemController.delete);

module.exports = router;
