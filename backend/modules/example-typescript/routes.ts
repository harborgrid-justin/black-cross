/**
 * Example TypeScript Module - Routes
 * This demonstrates route definitions with type safety
 */

import { Router } from 'express';
import * as controller from './controller';

const router = Router();

// GET /api/v1/example - List all with optional filters
router.get('/', controller.list);

// GET /api/v1/example/:id - Get by ID
router.get('/:id', controller.getById);

// POST /api/v1/example - Create new
router.post('/', controller.create);

export default router;
