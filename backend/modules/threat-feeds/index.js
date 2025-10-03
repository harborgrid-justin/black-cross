const express = require('express');
const router = express.Router();
const feedRoutes = require('./routes/feedRoutes');
router.use('/', feedRoutes);
module.exports = router;
