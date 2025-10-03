const express = require('express');
const router = express.Router();
const darkwebRoutes = require('./routes/darkwebRoutes');
router.use('/', darkwebRoutes);
module.exports = router;
