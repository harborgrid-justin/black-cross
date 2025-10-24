/**
 * Background Tasks API Routes
 */

import express, { Request, Response, NextFunction } from 'express';
import { taskManager } from '../utils/background-tasks';
import { TaskStatus } from '../utils/background-tasks/task-types';

const router = express.Router();

/**
 * Create a new background task
 * POST /api/v1/tasks
 */
router.post('/tasks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { type, metadata } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Task type is required'
      });
    }

    const task = await taskManager.createTask({
      type,
      user_id: req.user.id,
      metadata: metadata || {}
    });

    return res.status(201).json({
      success: true,
      data: task
    });
  } catch (error: any) {
    return next(error);
  }
});

/**
 * Get a specific task by ID
 * GET /api/v1/tasks/:id
 */
router.get('/tasks/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const task = taskManager.getTask(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user owns the task
    if (task.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    return res.json({
      success: true,
      data: task
    });
  } catch (error: any) {
    return next(error);
  }
});

/**
 * Get all tasks for the current user
 * GET /api/v1/tasks
 */
router.get('/tasks', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const tasks = taskManager.getUserTasks(req.user.id);

    // Optional filtering by status
    const status = req.query.status as TaskStatus | undefined;
    const filteredTasks = status
      ? tasks.filter(t => t.status === status)
      : tasks;

    return res.json({
      success: true,
      data: filteredTasks,
      count: filteredTasks.length
    });
  } catch (error: any) {
    return next(error);
  }
});

/**
 * Cancel a running task
 * DELETE /api/v1/tasks/:id
 */
router.delete('/tasks/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const task = taskManager.getTask(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user owns the task
    if (task.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    await taskManager.cancelTask(req.params.id);

    return res.json({
      success: true,
      message: 'Task cancelled successfully'
    });
  } catch (error: any) {
    return next(error);
  }
});

/**
 * Get system stats about tasks
 * GET /api/v1/tasks/stats
 */
router.get('/tasks/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userTasks = taskManager.getUserTasks(req.user.id);
    const runningCount = taskManager.getRunningTasksCount();

    const stats = {
      total: userTasks.length,
      pending: userTasks.filter(t => t.status === TaskStatus.PENDING).length,
      running: userTasks.filter(t => t.status === TaskStatus.RUNNING).length,
      completed: userTasks.filter(t => t.status === TaskStatus.COMPLETED).length,
      failed: userTasks.filter(t => t.status === TaskStatus.FAILED).length,
      cancelled: userTasks.filter(t => t.status === TaskStatus.CANCELLED).length,
      system_running: runningCount
    };

    return res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    return next(error);
  }
});

export default router;
