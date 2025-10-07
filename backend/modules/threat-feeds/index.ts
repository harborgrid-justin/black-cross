import express from 'express';

const router = express.Router();
import feedRoutes from './routes/feedRoutes';

// Health check route
router.get('/health', (req, res) => {
  res.json({
    module: 'threat-feeds',
    status: 'operational',
    version: '1.0.0',
    subFeatures: [
      'multi-source-aggregation',
      'feed-support',
      'reliability-scoring',
      'automated-parsing',
      'custom-feeds',
      'feed-scheduling',
      'deduplication',
    ],
  });
});

router.use('/', feedRoutes);
export default router;

