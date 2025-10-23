import express from 'express';
import darkwebRoutes from './routes/darkwebRoutes';

const router = express.Router();

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
export default router;
