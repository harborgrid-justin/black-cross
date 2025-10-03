const express = require('express');
const router = express.Router();
const actorRoutes = require('./routes/actorRoutes');
router.use('/', actorRoutes);
module.exports = router;
