const express = require('express');

const router = express.Router();
const complianceController = require('../controllers/complianceController');
const { validate, commonSchemas } = require('../../../middleware/validator');
const { complianceSchema, complianceUpdateSchema } = require('../validators/complianceValidator');

router.post('/', validate({ body: complianceSchema }), complianceController.create);
router.get('/', complianceController.list);
router.get('/:id', validate({ params: { id: commonSchemas.objectId.required() } }), complianceController.getById);
router.put('/:id', validate({
  params: { id: commonSchemas.objectId.required() },
  body: complianceUpdateSchema,
}), complianceController.update);
router.delete('/:id', validate({ params: { id: commonSchemas.objectId.required() } }), complianceController.delete);

module.exports = router;
