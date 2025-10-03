const express = require('express');
const router = express.Router();
const complianceRoutes = require('./routes/complianceRoutes');
router.use('/', complianceRoutes);
module.exports = router;
