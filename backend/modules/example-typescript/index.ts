/**
 * Example TypeScript Module
 * This demonstrates the TypeScript migration pattern for backend modules
 */

import type { Request, Response } from 'express';
import { Router } from 'express';
import routes from './routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    module: 'example-typescript',
    status: 'operational',
    version: '1.0.0',
    language: 'TypeScript',
    description: 'Example module demonstrating TypeScript migration pattern',
  });
});

// Mount routes
router.use('/', routes);

export default router;
