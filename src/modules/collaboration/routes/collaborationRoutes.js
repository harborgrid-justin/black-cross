/**
 * Collaboration Session Routes
 */

const express = require('express');
const collaborationController = require('../controllers/collaborationController');

const router = express.Router();

router.post('/session', collaborationController.joinSession);
router.delete('/session/:id', collaborationController.leaveSession);
router.get('/session', collaborationController.getSession);
router.get('/sessions', collaborationController.listSessions);

module.exports = router;
