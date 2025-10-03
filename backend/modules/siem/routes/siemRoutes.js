const express = require('express');
const router = express.Router();
const siemController = require('../controllers/siemController');

router.post('/', siemController.create);
router.get('/', siemController.list);
router.get('/:id', siemController.getById);
router.put('/:id', siemController.update);
router.delete('/:id', siemController.delete);

module.exports = router;
