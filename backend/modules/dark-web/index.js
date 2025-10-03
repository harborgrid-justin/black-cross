const express = require('express');

const router = express.Router();
const darkwebRoutes = require('./routes/darkwebRoutes');

// Health check route
router.get('/health', (req, res) => {
  res.json({
    module: 'dark-web',
    status: 'operational',
    version: '1.0.0',
    subFeatures: [
      'forum-monitoring',
      'credential-detection',
      'brand-monitoring',
      'actor-tracking',
      'alert-generation',
      'data-collection',
      'intelligence-reports',
    ],
  });
});

router.use('/', darkwebRoutes);
module.exports = router;
