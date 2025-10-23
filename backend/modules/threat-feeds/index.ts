import express from 'express';
import feedRoutes from './routes/feedRoutes';

const router = express.Router();

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
