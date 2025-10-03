/**
 * Activity Feed Service
 * Business logic for activity tracking
 */

const Activity = require('../models/Activity');
const logger = require('../utils/logger');

class ActivityService {
  /**
   * Log an activity
   */
  async logActivity(data) {
    try {
      const activity = new Activity(data);
      await activity.save();

      logger.debug('Activity logged', { activity_id: activity.id, action: data.action });
      return activity;
    } catch (error) {
      logger.error('Failed to log activity', { error: error.message });
      // Don't throw - activity logging should not break the main operation
      return null;
    }
  }

  /**
   * Get activities for workspace
   */
  async getWorkspaceActivities(workspaceId, options = {}) {
    try {
      const query = { workspace_id: workspaceId };

      if (options.entity_type) {
        query.entity_type = options.entity_type;
      }

      if (options.actor_id) {
        query.actor_id = options.actor_id;
      }

      if (options.action) {
        query.action = options.action;
      }

      const activities = await Activity.find(query)
        .sort({ created_at: -1 })
        .limit(options.limit || 100);

      return activities;
    } catch (error) {
      logger.error('Failed to get workspace activities', {
        error: error.message,
        workspace_id: workspaceId,
      });
      throw error;
    }
  }

  /**
   * Get activities for user (personalized feed)
   */
  async getUserActivities(userId, workspaceIds = [], options = {}) {
    try {
      const query = {
        $or: [
          { actor_id: userId },
          { workspace_id: { $in: workspaceIds } },
        ],
      };

      if (options.entity_type) {
        query.entity_type = options.entity_type;
      }

      const activities = await Activity.find(query)
        .sort({ created_at: -1 })
        .limit(options.limit || 100);

      return activities;
    } catch (error) {
      logger.error('Failed to get user activities', { error: error.message, user_id: userId });
      throw error;
    }
  }

  /**
   * Get activities for entity
   */
  async getEntityActivities(entityType, entityId, options = {}) {
    try {
      const query = {
        entity_type: entityType,
        entity_id: entityId,
      };

      const activities = await Activity.find(query)
        .sort({ created_at: -1 })
        .limit(options.limit || 50);

      return activities;
    } catch (error) {
      logger.error('Failed to get entity activities', {
        error: error.message,
        entity_type: entityType,
        entity_id: entityId,
      });
      throw error;
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStatistics(workspaceId, startDate, endDate) {
    try {
      const query = {
        workspace_id: workspaceId,
        created_at: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      const stats = await Activity.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              action: '$action',
              entity_type: '$entity_type',
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.entity_type',
            actions: {
              $push: {
                action: '$_id.action',
                count: '$count',
              },
            },
            total: { $sum: '$count' },
          },
        },
      ]);

      return stats;
    } catch (error) {
      logger.error('Failed to get activity statistics', {
        error: error.message,
        workspace_id: workspaceId,
      });
      throw error;
    }
  }

  /**
   * Clean old activities (retention policy)
   */
  async cleanOldActivities(retentionDays = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await Activity.deleteMany({
        created_at: { $lt: cutoffDate },
      });

      logger.info('Old activities cleaned', { deleted_count: result.deletedCount });
      return result.deletedCount;
    } catch (error) {
      logger.error('Failed to clean old activities', { error: error.message });
      throw error;
    }
  }
}

module.exports = new ActivityService();
