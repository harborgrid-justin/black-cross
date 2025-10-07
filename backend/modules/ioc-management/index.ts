import express from 'express';

const router = express.Router();
import iocRoutes from './routes/iocRoutes';

// Health check route
router.get('/health', (req, res) => {
  res.json({
    module: 'ioc-management',
    status: 'operational',
    version: '1.0.0',
    subFeatures: [
      'ioc-collection',
      'multi-format-support',
      'confidence-scoring',
      'automated-enrichment',
      'lifecycle-management',
      'bulk-operations',
      'search-filtering',
    ],
  });
});

router.use('/', iocRoutes);
export default router;

