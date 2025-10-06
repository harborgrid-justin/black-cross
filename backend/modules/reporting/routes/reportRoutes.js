const express = require('express');

const router = express.Router();
const reportController = require('../controllers/reportController');
const { validate, commonSchemas } = require('../../../middleware/validator');
const { reportSchema, reportUpdateSchema } = require('../validators/reportValidator');

router.post('/', validate({ body: reportSchema }), reportController.create);
router.get('/', reportController.list);
router.get('/:id', validate({ params: { id: commonSchemas.objectId.required() } }), reportController.getById);
router.put('/:id', validate({
  params: { id: commonSchemas.objectId.required() },
  body: reportUpdateSchema,
}), reportController.update);
router.delete('/:id', validate({ params: { id: commonSchemas.objectId.required() } }), reportController.delete);

module.exports = router;
