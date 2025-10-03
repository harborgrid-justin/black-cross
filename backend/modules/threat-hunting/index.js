const express = require('express');

const router = express.Router();
const huntRoutes = require('./routes/huntRoutes');

router.use('/', huntRoutes);
module.exports = router;
