/**
 * Incident Response & Management Module
 * Entry point for the module
 */

const express = require('express');
const router = express.Router();
const incidentRoutes = require('./routes/incidentRoutes');

// Mount routes
router.use('/', incidentRoutes);

module.exports = router;
