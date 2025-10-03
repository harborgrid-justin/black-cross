const express = require('express');
const router = express.Router();
const iocRoutes = require('./routes/iocRoutes');
router.use('/', iocRoutes);
module.exports = router;
