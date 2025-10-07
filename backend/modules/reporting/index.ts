import express from 'express';

const router = express.Router();
import reportRoutes from './routes/reportRoutes';

// Health check route
router.get('/health', (req, res) => {
  res.json({
    module: 'reporting',
    status: 'operational',
    version: '1.0.0',
    subFeatures: [
      'custom-templates',
      'scheduled-reporting',
      'executive-dashboards',
      'trend-analysis',
      'kpi-tracking',
      'data-visualization',
      'export-capabilities',
    ],
  });
});

router.use('/', reportRoutes);
export default router;

