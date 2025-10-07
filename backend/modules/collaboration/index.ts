import express from 'express';

const router = express.Router();
import collaborationRoutes from './routes/collaborationRoutes';

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
export default router;

