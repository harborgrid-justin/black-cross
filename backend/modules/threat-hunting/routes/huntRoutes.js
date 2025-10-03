const express = require('express');
const router = express.Router();
const huntController = require('../controllers/huntController');

router.post('/sessions', huntController.createSession);
router.get('/sessions', huntController.listSessions);
router.get('/sessions/:id', huntController.getSession);
router.post('/sessions/:id/query', huntController.executeQuery);
router.post('/sessions/:id/findings', huntController.addFinding);

module.exports = router;
