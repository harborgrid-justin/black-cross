const express = require('express');

const router = express.Router();
const complianceController = require('../controllers/complianceController');

router.post('/', complianceController.create);
router.get('/', complianceController.list);
router.get('/:id', complianceController.getById);
router.put('/:id', complianceController.update);
router.delete('/:id', complianceController.delete);

module.exports = router;
