const express = require('express');

const router = express.Router();
const darkwebController = require('../controllers/darkwebController');

router.post('/', darkwebController.create);
router.get('/', darkwebController.list);
router.get('/:id', darkwebController.getById);
router.put('/:id', darkwebController.update);
router.delete('/:id', darkwebController.delete);

module.exports = router;
