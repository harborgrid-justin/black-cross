import express from 'express';
import siemRoutes from './routes/siemRoutes';

const router = express.Router();

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
export default router;
