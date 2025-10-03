const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');

router.post('/', feedController.create);
router.get('/', feedController.list);
router.get('/:id', feedController.getById);
router.put('/:id', feedController.update);
router.delete('/:id', feedController.delete);

module.exports = router;
