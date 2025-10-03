const express = require('express');
const router = express.Router();
const siemRoutes = require('./routes/siemRoutes');
router.use('/', siemRoutes);
module.exports = router;
