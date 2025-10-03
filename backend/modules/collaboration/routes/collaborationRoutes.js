const express = require('express');
const router = express.Router();
const collaborationController = require('../controllers/collaborationController');

router.post('/', collaborationController.create);
router.get('/', collaborationController.list);
router.get('/:id', collaborationController.getById);
router.put('/:id', collaborationController.update);
router.delete('/:id', collaborationController.delete);

module.exports = router;
