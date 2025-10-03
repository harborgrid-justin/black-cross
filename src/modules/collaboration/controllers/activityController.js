/**
 * Activity Controller
 * HTTP handlers for activity feed operations
 */

const activityService = require('../services/activityService');
const logger = require('../utils/logger');

class ActivityController {
  async getWorkspaceActivities(req, res) {
    try {
      const options = {
        entity_type: req.query.entity_type,
        actor_id: req.query.actor_id,
        action: req.query.action,
        limit: parseInt(req.query.limit, 10) || 100,
      };
      const activities = await activityService.getWorkspaceActivities(req.params.workspaceId, options);
      res.json({ success: true, data: activities, count: activities.length });
    } catch (error) {
      logger.error('Get workspace activities failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getUserActivities(req, res) {
    try {
      const userId = req.user?.id || req.query.user_id || 'test-user';
      const workspaceIds = req.query.workspace_ids
        ? req.query.workspace_ids.split(',')
        : [];
      const options = {
        entity_type: req.query.entity_type,
        limit: parseInt(req.query.limit, 10) || 100,
      };
      const activities = await activityService.getUserActivities(userId, workspaceIds, options);
      res.json({ success: true, data: activities, count: activities.length });
    } catch (error) {
      logger.error('Get user activities failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getEntityActivities(req, res) {
    try {
      const options = {
        limit: parseInt(req.query.limit, 10) || 50,
      };
      const activities = await activityService.getEntityActivities(
        req.params.entityType,
        req.params.entityId,
        options,
      );
      res.json({ success: true, data: activities, count: activities.length });
    } catch (error) {
      logger.error('Get entity activities failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getStatistics(req, res) {
    try {
      const defaultStart = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const startDate = req.query.start_date
        ? new Date(req.query.start_date)
        : new Date(defaultStart);
      const endDate = req.query.end_date ? new Date(req.query.end_date) : new Date();
      const stats = await activityService.getActivityStatistics(
        req.params.workspaceId,
        startDate,
        endDate,
      );
      res.json({ success: true, data: stats });
    } catch (error) {
      logger.error('Get activity statistics failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new ActivityController();
