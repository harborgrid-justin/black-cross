/**
 * Task Management Service
 * Business logic for task operations
 */

const Task = require('../models/Task');
const logger = require('../utils/logger');
const activityService = require('./activityService');
const notificationService = require('./notificationService');

class TaskService {
  /**
   * Create a new task
   */
  async createTask(data, userId) {
    try {
      const task = new Task({
        ...data,
        created_by: userId,
      });

      await task.save();

      // Log activity
      await activityService.logActivity({
        actor_id: userId,
        action: 'created',
        entity_type: 'task',
        entity_id: task.id,
        workspace_id: task.workspace_id,
        details: { task_title: task.title },
      });

      // Send notification to assigned user
      if (task.assigned_to && task.assigned_to !== userId) {
        await notificationService.createNotification({
          user_id: task.assigned_to,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You have been assigned task: ${task.title}`,
          entity_type: 'task',
          entity_id: task.id,
          actor_id: userId,
        });
      }

      logger.info('Task created', { task_id: task.id, user_id: userId });
      return task;
    } catch (error) {
      logger.error('Failed to create task', { error: error.message, user_id: userId });
      throw error;
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId) {
    try {
      const task = await Task.findOne({ id: taskId });
      if (!task) {
        throw new Error('Task not found');
      }
      return task;
    } catch (error) {
      logger.error('Failed to get task', { error: error.message, task_id: taskId });
      throw error;
    }
  }

  /**
   * Update task
   */
  async updateTask(taskId, updates, userId) {
    try {
      const task = await Task.findOne({ id: taskId });
      if (!task) {
        throw new Error('Task not found');
      }

      const oldAssignee = task.assigned_to;
      const oldStatus = task.status;

      Object.assign(task, updates);
      await task.save();

      // Log activity
      await activityService.logActivity({
        actor_id: userId,
        action: 'updated',
        entity_type: 'task',
        entity_id: task.id,
        workspace_id: task.workspace_id,
        details: { updates },
      });

      // Send notifications for assignment changes
      if (updates.assigned_to && updates.assigned_to !== oldAssignee) {
        await notificationService.createNotification({
          user_id: updates.assigned_to,
          type: 'task_assigned',
          title: 'Task Assigned',
          message: `You have been assigned task: ${task.title}`,
          entity_type: 'task',
          entity_id: task.id,
          actor_id: userId,
        });
      }

      // Send notification for status changes
      if (updates.status && updates.status !== oldStatus) {
        await notificationService.createNotification({
          user_id: task.created_by,
          type: 'task_updated',
          title: 'Task Status Changed',
          message: `Task "${task.title}" status changed to ${updates.status}`,
          entity_type: 'task',
          entity_id: task.id,
          actor_id: userId,
        });
      }

      logger.info('Task updated', { task_id: taskId, user_id: userId });
      return task;
    } catch (error) {
      logger.error('Failed to update task', { error: error.message, task_id: taskId });
      throw error;
    }
  }

  /**
   * Delete task
   */
  async deleteTask(taskId, userId) {
    try {
      const task = await Task.findOneAndDelete({ id: taskId });
      if (!task) {
        throw new Error('Task not found');
      }

      await activityService.logActivity({
        actor_id: userId,
        action: 'deleted',
        entity_type: 'task',
        entity_id: task.id,
        workspace_id: task.workspace_id,
        details: { task_title: task.title },
      });

      logger.info('Task deleted', { task_id: taskId, user_id: userId });
      return task;
    } catch (error) {
      logger.error('Failed to delete task', { error: error.message, task_id: taskId });
      throw error;
    }
  }

  /**
   * List tasks
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

      if (filters.created_by) {
        query.created_by = filters.created_by;
      }

      const sort = {};
      if (filters.sort_by === 'due_date') {
        sort.due_date = 1;
      } else if (filters.sort_by === 'priority') {
        sort.priority = -1;
      } else {
        sort.created_at = -1;
      }

      const tasks = await Task.find(query)
        .sort(sort)
        .limit(filters.limit || 100);

      return tasks;
    } catch (error) {
      logger.error('Failed to list tasks', { error: error.message });
      throw error;
    }
  }

  /**
   * Add comment to task
   */
  async addComment(taskId, content, userId) {
    try {
      const task = await Task.findOne({ id: taskId });
      if (!task) {
        throw new Error('Task not found');
      }

      task.comments.push({
        user_id: userId,
        content,
      });

      await task.save();

      await activityService.logActivity({
        actor_id: userId,
        action: 'commented',
        entity_type: 'task',
        entity_id: task.id,
        workspace_id: task.workspace_id,
        details: { comment_preview: content.substring(0, 50) },
      });

      // Notify task assignee
      if (task.assigned_to && task.assigned_to !== userId) {
        await notificationService.createNotification({
          user_id: task.assigned_to,
          type: 'comment',
          title: 'New Comment on Task',
          message: `${userId} commented on task: ${task.title}`,
          entity_type: 'task',
          entity_id: task.id,
          actor_id: userId,
        });
      }

      logger.info('Comment added to task', { task_id: taskId, user_id: userId });
      return task;
    } catch (error) {
      logger.error('Failed to add comment', { error: error.message, task_id: taskId });
      throw error;
    }
  }

  /**
   * Get task analytics
   */
  async getTaskAnalytics(workspaceId) {
    try {
      const analytics = await Task.aggregate([
        { $match: { workspace_id: workspaceId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      const result = {
        total: 0,
        by_status: {},
      };

      analytics.forEach((item) => {
        result.by_status[item._id] = item.count;
        result.total += item.count;
      });

      return result;
    } catch (error) {
      logger.error('Failed to get task analytics', { error: error.message, workspace_id: workspaceId });
      throw error;
    }
  }
}

module.exports = new TaskService();
