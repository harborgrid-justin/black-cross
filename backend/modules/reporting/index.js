const express = require('express');

const router = express.Router();
const reportRoutes = require('./routes/reportRoutes');

router.use('/', reportRoutes);
module.exports = router;
