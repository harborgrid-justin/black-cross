const express = require('express');

const router = express.Router();
const siemRoutes = require('./routes/siemRoutes');

// Health check route
router.get('/health', (req, res) => {
  res.json({
    module: 'siem',
    status: 'operational',
    version: '1.0.0',
    subFeatures: [
      'log-collection',
      'event-correlation',
      'detection-rules',
      'alert-management',
      'security-dashboards',
      'forensic-analysis',
      'compliance-reporting',
    ],
  });
});

router.use('/', siemRoutes);
module.exports = router;
