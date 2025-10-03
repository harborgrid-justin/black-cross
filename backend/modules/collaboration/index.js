const express = require('express');

const router = express.Router();
const collaborationRoutes = require('./routes/collaborationRoutes');

// Health check route
router.get('/health', (req, res) => {
  res.json({
    module: 'collaboration',
    status: 'operational',
    version: '1.0.0',
    subFeatures: [
      'team-workspace',
      'rbac',
      'real-time-collaboration',
      'task-tracking',
      'knowledge-base',
      'secure-messaging',
      'activity-feeds',
    ],
  });
});

router.use('/', collaborationRoutes);
module.exports = router;
