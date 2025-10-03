const express = require('express');

const router = express.Router();
const actorRoutes = require('./routes/actorRoutes');

// Health check route
router.get('/health', (req, res) => {
  res.json({
    module: 'threat-actors',
    status: 'operational',
    version: '1.0.0',
    subFeatures: [
      'actor-database',
      'ttps-mapping',
      'attribution-analysis',
      'campaign-tracking',
      'motivation-assessment',
      'targeting-analysis',
      'relationship-mapping',
    ],
  });
});

router.use('/', actorRoutes);
module.exports = router;
