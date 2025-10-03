/**
 * Task Controller
 * HTTP handlers for task operations
 */

const taskService = require('../services/taskService');
const logger = require('../utils/logger');

class TaskController {
  async createTask(req, res) {
    try {
      const userId = req.user?.id || req.body.user_id || 'test-user';
      const task = await taskService.createTask(req.body, userId);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      logger.error('Create task failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getTask(req, res) {
    try {
      const task = await taskService.getTaskById(req.params.id);
      res.json({ success: true, data: task });
    } catch (error) {
      logger.error('Get task failed', { error: error.message });
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async updateTask(req, res) {
    try {
      const userId = req.user?.id || req.body.user_id || 'test-user';
      const task = await taskService.updateTask(req.params.id, req.body, userId);
      res.json({ success: true, data: task });
    } catch (error) {
      logger.error('Update task failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteTask(req, res) {
    try {
      const userId = req.user?.id || 'test-user';
      const task = await taskService.deleteTask(req.params.id, userId);
      res.json({ success: true, data: task, message: 'Task deleted' });
    } catch (error) {
      logger.error('Delete task failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async listTasks(req, res) {
    try {
      const filters = {
        workspace_id: req.query.workspace_id,
        assigned_to: req.query.assigned_to,
        status: req.query.status,
        priority: req.query.priority,
        created_by: req.query.created_by,
        sort_by: req.query.sort_by,
        limit: parseInt(req.query.limit, 10) || 100,
      };
      const tasks = await taskService.listTasks(filters);
      res.json({ success: true, data: tasks, count: tasks.length });
    } catch (error) {
      logger.error('List tasks failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async addComment(req, res) {
    try {
      const userId = req.user?.id || req.body.user_id || 'test-user';
      const task = await taskService.addComment(req.params.id, req.body.content, userId);
      res.json({ success: true, data: task });
    } catch (error) {
      logger.error('Add comment failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getAnalytics(req, res) {
    try {
      const analytics = await taskService.getTaskAnalytics(req.params.workspaceId);
      res.json({ success: true, data: analytics });
    } catch (error) {
      logger.error('Get analytics failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new TaskController();
