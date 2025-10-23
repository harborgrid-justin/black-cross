/**
 * Code Review Module Routes
 * SOA-Aligned Code Review System with Six Expert Agents
 */

import { Router } from 'express';
import * as controller from './controller';

const router = Router();

/**
 * @swagger
 * /api/v1/code-review/execute:
 *   post:
 *     summary: Execute comprehensive code review
 *     description: Run all six expert agents simultaneously for SOA-aligned code review
 *     tags: [Code Review]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetPath:
 *                 type: string
 *                 description: Path to review (defaults to project root)
 *               includePatterns:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: File patterns to include
 *               excludePatterns:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: File patterns to exclude
 *               enabledAgents:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Specific agents to run
 *               minSeverity:
 *                 type: string
 *                 enum: [critical, high, medium, low, info]
 *                 description: Minimum severity level to report
 *               parallel:
 *                 type: boolean
 *                 description: Run agents in parallel (default: true)
 *     responses:
 *       200:
 *         description: Code review completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       500:
 *         description: Code review failed
 */
router.post('/execute', controller.executeCodeReview);

/**
 * @swagger
 * /api/v1/code-review/agents:
 *   get:
 *     summary: Get available review agents
 *     description: Retrieve list of all six expert agents
 *     tags: [Code Review]
 *     responses:
 *       200:
 *         description: Agents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     agents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           category:
 *                             type: string
 *                     totalAgents:
 *                       type: number
 */
router.get('/agents', controller.getAvailableAgents);

/**
 * @swagger
 * /api/v1/code-review/health:
 *   get:
 *     summary: Get health status
 *     description: Check if code review module is operational
 *     tags: [Code Review]
 *     responses:
 *       200:
 *         description: Health status retrieved
 */
router.get('/health', controller.getHealthStatus);

export default router;
