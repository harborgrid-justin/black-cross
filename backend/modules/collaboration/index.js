const express = require('express');
const router = express.Router();
const collaborationRoutes = require('./routes/collaborationRoutes');
router.use('/', collaborationRoutes);
module.exports = router;
