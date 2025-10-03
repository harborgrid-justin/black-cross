const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.post('/', reportController.create);
router.get('/', reportController.list);
router.get('/:id', reportController.getById);
router.put('/:id', reportController.update);
router.delete('/:id', reportController.delete);

module.exports = router;
