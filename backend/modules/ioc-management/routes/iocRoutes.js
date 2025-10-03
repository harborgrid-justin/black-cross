const express = require('express');
const router = express.Router();
const iocController = require('../controllers/iocController');

router.post('/', iocController.create);
router.get('/', iocController.list);
router.get('/:id', iocController.getById);
router.put('/:id', iocController.update);
router.delete('/:id', iocController.delete);

module.exports = router;
