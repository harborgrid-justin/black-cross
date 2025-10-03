/**
 * Task Service
 * Handles task creation, assignment, tracking, and management
 */

const Task = require('../models/Task');
const Workspace = require('../models/Workspace');
const logger = require('../utils/logger');

class TaskService {
  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @param {string} userId - User creating the task
   * @returns {Promise<Object>} Created task
   */
  async createTask(taskData, userId) {
    try {
      logger.info('Creating new task', { title: taskData.title, workspace: taskData.workspace_id });

      const task = new Task({
        ...taskData,
        created_by: taskData.created_by || userId,
      });

      await task.save();

      // Update workspace analytics
      await Workspace.updateOne(
        { id: taskData.workspace_id },
        {
          $inc: { 'analytics.task_count': 1 },
          $set: { 'analytics.last_activity_at': new Date() },
        },
      );

      logger.info('Task created successfully', { id: task.id });
      return task;
    } catch (error) {
      logger.error('Error creating task', { error: error.message });
      throw error;
    }
  }

  /**
   * Get task by ID
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} Task
   */
  async getTask(taskId) {
    try {
      const task = await Task.findOne({ id: taskId });

      if (!task) {
        throw new Error('Task not found');
      }

      return task;
    } catch (error) {
      logger.error('Error getting task', { error: error.message });
      throw error;
    }
  }

  /**
   * Update task
   * @param {string} taskId - Task ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated task
   */
  async updateTask(taskId, updates) {
    try {
      logger.info('Updating task', { taskId });

      const task = await Task.findOne({ id: taskId });

      if (!task) {
        throw new Error('Task not found');
      }

      // Handle status change
      if (updates.status === 'completed' && task.status !== 'completed') {
        task.completed_at = new Date();
        task.progress = 100;
      }

      Object.assign(task, updates);
      await task.save();

      logger.info('Task updated successfully', { id: task.id });
      return task;
    } catch (error) {
      logger.error('Error updating task', { error: error.message });
      throw error;
    }
  }

  /**
   * Assign task to user
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID to assign to
   * @returns {Promise<Object>} Updated task
   */
  async assignTask(taskId, userId) {
    try {
      logger.info('Assigning task', { taskId, userId });

      const task = await Task.findOne({ id: taskId });

      if (!task) {
        throw new Error('Task not found');
      }

      task.assigned_to = userId;

      // Add user to watchers if not already there
      if (!task.watchers.includes(userId)) {
        task.watchers.push(userId);
      }

      await task.save();
      logger.info('Task assigned successfully', { taskId, userId });

      return task;
    } catch (error) {
      logger.error('Error assigning task', { error: error.message });
      throw error;
    }
  }

  /**
   * List tasks
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Tasks
   */
  async listTasks(filters = {}) {
    try {
      const query = {};

      if (filters.workspace_id) {
        query.workspace_id = filters.workspace_id;
      }

      if (filters.assigned_to) {
        query.assigned_to = filters.assigned_to;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.priority) {
        query.priority = filters.priority;
      }

      if (filters.overdue) {
        query.due_date = { $lt: new Date() };
        query.status = { $nin: ['completed', 'cancelled'] };
      }

      const sort = {};
      if (filters.sort_by === 'due_date') {
        sort.due_date = 1;
      } else if (filters.sort_by === 'priority') {
        sort.priority = 1;
      } else {
        sort.created_at = -1;
      }

      const tasks = await Task.find(query)
        .sort(sort)
        .limit(filters.limit || 100);

      return tasks;
    } catch (error) {
      logger.error('Error listing tasks', { error: error.message });
      throw error;
    }
  }

  /**
   * Add comment to task
   * @param {string} taskId - Task ID
   * @param {string} userId - User ID
   * @param {string} content - Comment content
   * @returns {Promise<Object>} Updated task
   */
  async addComment(taskId, userId, content) {
    try {
      logger.info('Adding comment to task', { taskId, userId });

      const task = await Task.findOne({ id: taskId });

      if (!task) {
        throw new Error('Task not found');
      }

      task.comments.push({
        user_id: userId,
        content,
        created_at: new Date(),
      });

      await task.save();
      logger.info('Comment added successfully', { taskId });

      return task;
    } catch (error) {
      logger.error('Error adding comment', { error: error.message });
      throw error;
    }
  }

  /**
   * Update task progress
   * @param {string} taskId - Task ID
   * @param {number} progress - Progress percentage
   * @returns {Promise<Object>} Updated task
   */
  async updateProgress(taskId, progress) {
    try {
      const task = await Task.findOne({ id: taskId });

      if (!task) {
        throw new Error('Task not found');
      }

      task.progress = Math.max(0, Math.min(100, progress));

      // Auto-update status based on progress
      if (task.progress === 100 && task.status !== 'completed') {
        task.status = 'completed';
        task.completed_at = new Date();
      } else if (task.progress > 0 && task.status === 'todo') {
        task.status = 'in-progress';
      }

      await task.save();
      return task;
    } catch (error) {
      logger.error('Error updating progress', { error: error.message });
      throw error;
    }
  }

  /**
   * Get task dependencies
   * @param {string} taskId - Task ID
   * @returns {Promise<Array>} Dependent tasks
   */
  async getDependencies(taskId) {
    try {
      const task = await Task.findOne({ id: taskId });

      if (!task) {
        throw new Error('Task not found');
      }

      const dependencyIds = task.dependencies.map((d) => d.task_id);
      const dependencies = await Task.find({ id: { $in: dependencyIds } });

      return dependencies;
    } catch (error) {
      logger.error('Error getting dependencies', { error: error.message });
      throw error;
    }
  }

  /**
   * Get workload for user
   * @param {string} userId - User ID
   * @param {string} workspaceId - Workspace ID (optional)
   * @returns {Promise<Object>} Workload data
   */
  async getUserWorkload(userId, workspaceId = null) {
    try {
      const query = {
        assigned_to: userId,
        status: { $nin: ['completed', 'cancelled'] },
      };

      if (workspaceId) {
        query.workspace_id = workspaceId;
      }

      const tasks = await Task.find(query);

      const workload = {
        total_tasks: tasks.length,
        by_priority: {
          critical: tasks.filter((t) => t.priority === 'critical').length,
          high: tasks.filter((t) => t.priority === 'high').length,
          medium: tasks.filter((t) => t.priority === 'medium').length,
          low: tasks.filter((t) => t.priority === 'low').length,
        },
        by_status: {
          todo: tasks.filter((t) => t.status === 'todo').length,
          'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
          review: tasks.filter((t) => t.status === 'review').length,
          blocked: tasks.filter((t) => t.status === 'blocked').length,
        },
        overdue: tasks.filter((t) => t.due_date && t.due_date < new Date()).length,
        estimated_hours: tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0),
      };

      return workload;
    } catch (error) {
      logger.error('Error getting user workload', { error: error.message });
      throw error;
    }
  }
}

module.exports = new TaskService();
