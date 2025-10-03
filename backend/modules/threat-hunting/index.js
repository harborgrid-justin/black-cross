const express = require('express');

const router = express.Router();
const huntRoutes = require('./routes/huntRoutes');

// Health check route
router.get('/health', (req, res) => {
  res.json({
    module: 'threat-hunting',
    status: 'operational',
    version: '1.0.0',
    subFeatures: [
      'advanced-query-builder',
      'hunting-hypotheses',
      'automated-playbooks',
      'behavioral-analysis',
      'pattern-recognition',
      'hunt-documentation',
      'collaborative-sessions',
    ],
  });
});

router.use('/', huntRoutes);
module.exports = router;
