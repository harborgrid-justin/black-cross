import express from 'express';

const router = express.Router();
import complianceRoutes from './routes/complianceRoutes';

// Health check route
router.get('/health', (req, res) => {
  res.json({
    module: 'compliance',
    status: 'operational',
    version: '1.0.0',
    subFeatures: [
      'framework-mapping',
      'audit-trail',
      'gap-analysis',
      'policy-management',
      'compliance-reporting',
      'evidence-collection',
      'requirement-tracking',
    ],
  });
});

router.use('/', complianceRoutes);
export default router;

