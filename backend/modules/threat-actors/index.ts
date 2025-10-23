import express from 'express';
import actorRoutes from './routes/actorRoutes';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    module: 'threat-actors',
    status: 'operational',
    version: '1.0.0',
    subFeatures: [
      'actor-database',
      'ttps-mapping',
      'attribution-analysis',
      'campaign-tracking',
      'motivation-assessment',
      'targeting-analysis',
      'relationship-mapping',
    ],
  });
});

router.use('/', actorRoutes);
export default router;
