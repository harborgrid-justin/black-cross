/**
 * Activity Service
 * Handles activity tracking and notifications
 */

const Activity = require('../models/Activity');
const logger = require('../utils/logger');

class ActivityService {
  /**
   * Log an activity
   * @param {Object} activityData - Activity data
   * @returns {Promise<Object>} Created activity
   */
  async logActivity(activityData) {
    try {
      logger.info('Logging activity', { action: activityData.action, workspace: activityData.workspace_id });

      const activity = new Activity(activityData);
      await activity.save();

      logger.info('Activity logged successfully', { id: activity.id });
      return activity;
    } catch (error) {
      logger.error('Error logging activity', { error: error.message });
      throw error;
    }
  }

  /**
   * Get activities for workspace
   * @param {string} workspaceId - Workspace ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Activities
   */
  async getActivities(workspaceId, options = {}) {
    try {
      const query = { workspace_id: workspaceId };

      if (options.action) {
        query.action = options.action;
      }

      if (options.resource_type) {
        query.resource_type = options.resource_type;
      }

      if (options.actor_id) {
        query.actor_id = options.actor_id;
      }

      if (options.since) {
        query.created_at = { $gte: new Date(options.since) };
      }

      const activities = await Activity.find(query)
        .sort({ created_at: -1 })
        .limit(options.limit || 100);

      return activities;
    } catch (error) {
      logger.error('Error getting activities', { error: error.message });
      throw error;
    }
  }

  /**
   * Get personalized activity feed for user
   * @param {string} userId - User ID
   * @param {string} workspaceId - Workspace ID (optional)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Activities
   */
  async getPersonalFeed(userId, workspaceId = null, options = {}) {
    try {
      const query = {
        $or: [
          { actor_id: userId },
          { 'recipients.user_id': userId },
        ],
      };

      if (workspaceId) {
        query.workspace_id = workspaceId;
      }

      if (options.unread_only) {
        query['recipients.user_id'] = userId;
        query['recipients.read'] = false;
      }

      const activities = await Activity.find(query)
        .sort({ created_at: -1 })
        .limit(options.limit || 50);

      return activities;
    } catch (error) {
      logger.error('Error getting personal feed', { error: error.message });
      throw error;
    }
  }

  /**
   * Mark activity as read
   * @param {string} activityId - Activity ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated activity
   */
  async markAsRead(activityId, userId) {
    try {
      const activity = await Activity.findOne({ id: activityId });

      if (!activity) {
        throw new Error('Activity not found');
      }

      const recipient = activity.recipients.find((r) => r.user_id === userId);
      if (recipient) {
        recipient.read = true;
        recipient.read_at = new Date();
        await activity.save();
      }

      return activity;
    } catch (error) {
      logger.error('Error marking activity as read', { error: error.message });
      throw error;
    }
  }

  /**
   * Mark all activities as read for user
   * @param {string} userId - User ID
   * @param {string} workspaceId - Workspace ID (optional)
   * @returns {Promise<Object>} Result
   */
  async markAllAsRead(userId, workspaceId = null) {
    try {
      const query = {
        'recipients.user_id': userId,
        'recipients.read': false,
      };

      if (workspaceId) {
        query.workspace_id = workspaceId;
      }

      const result = await Activity.updateMany(
        query,
        {
          $set: {
            'recipients.$[elem].read': true,
            'recipients.$[elem].read_at': new Date(),
          },
        },
        {
          arrayFilters: [{ 'elem.user_id': userId, 'elem.read': false }],
        },
      );

      logger.info('Marked all activities as read', { userId, count: result.modifiedCount });
      return { success: true, count: result.modifiedCount };
    } catch (error) {
      logger.error('Error marking all as read', { error: error.message });
      throw error;
    }
  }

  /**
   * Get unread notification count
   * @param {string} userId - User ID
   * @param {string} workspaceId - Workspace ID (optional)
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(userId, workspaceId = null) {
    try {
      const query = {
        'recipients.user_id': userId,
        'recipients.read': false,
      };

      if (workspaceId) {
        query.workspace_id = workspaceId;
      }

      const count = await Activity.countDocuments(query);
      return count;
    } catch (error) {
      logger.error('Error getting unread count', { error: error.message });
      throw error;
    }
  }

  /**
   * Create notification for activity
   * @param {string} workspaceId - Workspace ID
   * @param {string} actorId - Actor user ID
   * @param {string} action - Action performed
   * @param {string} resourceType - Resource type
   * @param {string} resourceId - Resource ID
   * @param {Array} recipients - Array of recipient user IDs
   * @param {Object} details - Additional details
   * @returns {Promise<Object>} Created activity
   */
  async createNotification(workspaceId, actorId, action, resourceType, resourceId, recipients, details = {}) {
    try {
      const activityData = {
        workspace_id: workspaceId,
        actor_id: actorId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        recipients: recipients.map((userId) => ({
          user_id: userId,
          read: false,
        })),
        notification_sent: true,
        notification_channels: ['in-app'],
      };

      return await this.logActivity(activityData);
    } catch (error) {
      logger.error('Error creating notification', { error: error.message });
      throw error;
    }
  }

  /**
   * Get activity statistics
   * @param {string} workspaceId - Workspace ID
   * @param {Object} options - Options
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(workspaceId, options = {}) {
    try {
      const since = options.since || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default: last 7 days

      const query = {
        workspace_id: workspaceId,
        created_at: { $gte: since },
      };

      const activities = await Activity.find(query);

      const stats = {
        total: activities.length,
        by_action: {},
        by_resource: {},
        by_actor: {},
        most_active_users: [],
      };

      // Count by action
      activities.forEach((activity) => {
        stats.by_action[activity.action] = (stats.by_action[activity.action] || 0) + 1;
        stats.by_resource[activity.resource_type] = (stats.by_resource[activity.resource_type] || 0) + 1;
        stats.by_actor[activity.actor_id] = (stats.by_actor[activity.actor_id] || 0) + 1;
      });

      // Get most active users
      stats.most_active_users = Object.entries(stats.by_actor)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([userId, count]) => ({ user_id: userId, activity_count: count }));

      return stats;
    } catch (error) {
      logger.error('Error getting statistics', { error: error.message });
      throw error;
    }
  }

  /**
   * Filter activities by type
   * @param {string} workspaceId - Workspace ID
   * @param {string} filterType - Filter type
   * @param {Object} options - Options
   * @returns {Promise<Array>} Filtered activities
   */
  async filterActivities(workspaceId, filterType, options = {}) {
    try {
      const query = { workspace_id: workspaceId };

      switch (filterType) {
        case 'tasks':
          query.resource_type = 'task';
          break;
        case 'messages':
          query.resource_type = 'message';
          break;
        case 'kb_articles':
          query.resource_type = 'kb_article';
          break;
        case 'workspace_changes':
          query.resource_type = 'workspace';
          break;
        default:
          break;
      }

      const activities = await Activity.find(query)
        .sort({ created_at: -1 })
        .limit(options.limit || 50);

      return activities;
    } catch (error) {
      logger.error('Error filtering activities', { error: error.message });
      throw error;
    }
  }
}

module.exports = new ActivityService();
