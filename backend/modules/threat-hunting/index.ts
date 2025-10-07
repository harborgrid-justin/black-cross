import express from 'express';

const router = express.Router();
import huntRoutes from './routes/huntRoutes';

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
export default router;

