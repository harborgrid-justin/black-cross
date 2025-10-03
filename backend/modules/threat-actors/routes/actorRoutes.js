const express = require('express');

const router = express.Router();
const actorController = require('../controllers/actorController');

router.post('/', actorController.create);
router.get('/', actorController.list);
router.get('/:id', actorController.getById);
router.put('/:id', actorController.update);
router.delete('/:id', actorController.delete);

module.exports = router;
