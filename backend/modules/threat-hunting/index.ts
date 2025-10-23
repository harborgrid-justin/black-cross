import express from 'express';
import huntRoutes from './routes/huntRoutes';

const router = express.Router();

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
