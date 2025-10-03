/**
 * Task Controller
 * Handles HTTP requests for task operations
 */

const taskService = require('../services/taskService');
const activityService = require('../services/activityService');
const logger = require('../utils/logger');

class TaskController {
  /**
   * Create task
   * POST /api/v1/collaboration/tasks
   */
  async createTask(req, res) {
    try {
      const userId = req.user?.id || 'system';
      const task = await taskService.createTask(req.body, userId);

      // Log activity
      await activityService.logActivity({
        workspace_id: task.workspace_id,
        actor_id: userId,
        action: 'task.created',
        resource_type: 'task',
        resource_id: task.id,
        details: { title: task.title },
      });

      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      logger.error('Error in createTask controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get task
   * GET /api/v1/collaboration/tasks/:id
   */
  async getTask(req, res) {
    try {
      const task = await taskService.getTask(req.params.id);
      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      logger.error('Error in getTask controller', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update task
   * PATCH /api/v1/collaboration/tasks/:id
   */
  async updateTask(req, res) {
    try {
      const userId = req.user?.id || 'system';
      const task = await taskService.updateTask(req.params.id, req.body, userId);

      // Log activity
      await activityService.logActivity({
        workspace_id: task.workspace_id,
        actor_id: userId,
        action: 'task.updated',
        resource_type: 'task',
        resource_id: task.id,
        details: { changes: req.body },
      });

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      logger.error('Error in updateTask controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Assign task
   * PUT /api/v1/collaboration/tasks/:id/assign
   */
  async assignTask(req, res) {
    try {
      const userId = req.user?.id || 'system';
      const task = await taskService.assignTask(req.params.id, req.body.user_id);

      // Log activity
      await activityService.logActivity({
        workspace_id: task.workspace_id,
        actor_id: userId,
        action: 'task.assigned',
        resource_type: 'task',
        resource_id: task.id,
        details: { assigned_to: req.body.user_id },
      });

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      logger.error('Error in assignTask controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * List tasks
   * GET /api/v1/collaboration/tasks
   */
  async listTasks(req, res) {
    try {
      const filters = {
        workspace_id: req.query.workspace_id,
        assigned_to: req.query.assigned_to,
        status: req.query.status,
        priority: req.query.priority,
        overdue: req.query.overdue === 'true',
        sort_by: req.query.sort_by,
        limit: parseInt(req.query.limit, 10) || 100,
      };

      const tasks = await taskService.listTasks(filters);
      res.json({
        success: true,
        data: tasks,
        count: tasks.length,
      });
    } catch (error) {
      logger.error('Error in listTasks controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Add comment to task
   * POST /api/v1/collaboration/tasks/:id/comments
   */
  async addComment(req, res) {
    try {
      const userId = req.user?.id || 'system';
      const task = await taskService.addComment(req.params.id, userId, req.body.content);

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      logger.error('Error in addComment controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update task progress
   * PUT /api/v1/collaboration/tasks/:id/progress
   */
  async updateProgress(req, res) {
    try {
      const task = await taskService.updateProgress(req.params.id, req.body.progress);

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      logger.error('Error in updateProgress controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get task dependencies
   * GET /api/v1/collaboration/tasks/:id/dependencies
   */
  async getDependencies(req, res) {
    try {
      const dependencies = await taskService.getDependencies(req.params.id);
      res.json({
        success: true,
        data: dependencies,
      });
    } catch (error) {
      logger.error('Error in getDependencies controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get user workload
   * GET /api/v1/collaboration/tasks/workload/:userId
   */
  async getUserWorkload(req, res) {
    try {
      const workload = await taskService.getUserWorkload(
        req.params.userId,
        req.query.workspace_id,
      );
      res.json({
        success: true,
        data: workload,
      });
    } catch (error) {
      logger.error('Error in getUserWorkload controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new TaskController();
