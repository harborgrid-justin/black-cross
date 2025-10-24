import express, { type Request, type Response } from 'express';
import dashboardRoutes from './routes/dashboardRoutes';

const router = express.Router();

// Health check for the dashboard module
router.get('/health', (req: Request, res: Response) => {
  res.json({
    module: 'dashboard',
    status: 'operational',
    version: '1.0.0',
    subFeatures: ['stats'],
  });
});

// Mount the main dashboard routes
router.use('/', dashboardRoutes);

export default router;
