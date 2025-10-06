const express = require('express');

const router = express.Router();
const iocController = require('../controllers/iocController');
const { validate, commonSchemas } = require('../../../middleware/validator');
const { iocSchema, iocUpdateSchema } = require('../validators/iocValidator');

router.post('/', validate({ body: iocSchema }), iocController.create);
router.get('/', iocController.list);
router.get('/:id', validate({ params: { id: commonSchemas.objectId.required() } }), iocController.getById);
router.put('/:id', validate({
  params: { id: commonSchemas.objectId.required() },
  body: iocUpdateSchema,
}), iocController.update);
router.delete('/:id', validate({ params: { id: commonSchemas.objectId.required() } }), iocController.delete);

module.exports = router;
