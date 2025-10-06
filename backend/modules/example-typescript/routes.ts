/**
 * Example TypeScript Module - Routes
 * Demonstrates TypeScript best practices for Express routing:
 * - Explicit type imports using 'type' keyword
 * - Named imports for better tree-shaking
 * - RESTful route organization
 * - Comprehensive route documentation with JSDoc
 */

import type { Router } from 'express';
import { Router as ExpressRouter } from 'express';
import * as controller from './controller';

/**
 * Example module router
 * Defines RESTful endpoints for example data management
 */
const router: Router = ExpressRouter();

/**
 * GET /api/v1/example
 * List all example data with optional filtering
 * Query parameters:
 * - status: 'active' | 'inactive' (optional)
 * - search: string (optional)
 * - limit: number (optional)
 */
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/', controller.list);

/**
 * GET /api/v1/example/:id
 * Get example data by ID
 * Path parameters:
 * - id: string (required)
 */
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/:id', controller.getById);

/**
 * POST /api/v1/example
 * Create new example data
 * Body: CreateExampleInput
 */
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/', controller.create);

/**
 * PUT /api/v1/example/:id
 * Update existing example data
 * Path parameters:
 * - id: string (required)
 * Body: UpdateExampleInput
 */
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.put('/:id', controller.update);

/**
 * DELETE /api/v1/example/:id
 * Delete example data by ID
 * Path parameters:
 * - id: string (required)
 */
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.delete('/:id', controller.deleteById);

export default router;
