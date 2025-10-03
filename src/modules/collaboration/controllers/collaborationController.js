/**
 * Collaboration Controller
 * Handles HTTP requests for collaboration session operations
 */

const rbacService = require('../services/rbacService');
const collaborationService = require('../services/collaborationService');
const knowledgeService = require('../services/knowledgeService');
const messagingService = require('../services/messagingService');
const activityService = require('../services/activityService');
const logger = require('../utils/logger');

class CollaborationController {
  // RBAC endpoints
  async createRole(req, res) {
    try {
      const role = await rbacService.createRole(req.body);
      res.status(201).json({ success: true, data: role });
    } catch (error) {
      logger.error('Error in createRole', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getRole(req, res) {
    try {
      const role = await rbacService.getRole(req.params.id);
      res.json({ success: true, data: role });
    } catch (error) {
      logger.error('Error in getRole', { error: error.message });
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async listRoles(req, res) {
    try {
      const filters = {
        type: req.query.type,
        workspace_id: req.query.workspace_id,
      };
      const roles = await rbacService.listRoles(filters);
      res.json({ success: true, data: roles, count: roles.length });
    } catch (error) {
      logger.error('Error in listRoles', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async assignRole(req, res) {
    try {
      // This would integrate with user management
      res.json({ success: true, message: 'Role assigned successfully' });
    } catch (error) {
      logger.error('Error in assignRole', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Collaboration session endpoints
  async startSession(req, res) {
    try {
      const userId = req.user?.id || 'system';
      const session = await collaborationService.startSession(req.body, userId);
      res.status(201).json({ success: true, data: session });
    } catch (error) {
      logger.error('Error in startSession', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getSession(req, res) {
    try {
      const session = await collaborationService.getSession(req.params.id);
      res.json({ success: true, data: session });
    } catch (error) {
      logger.error('Error in getSession', { error: error.message });
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async listSessions(req, res) {
    try {
      const sessions = await collaborationService.getActiveSessions(req.query.workspace_id);
      res.json({ success: true, data: sessions, count: sessions.length });
    } catch (error) {
      logger.error('Error in listSessions', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async joinSession(req, res) {
    try {
      const userId = req.user?.id || 'system';
      const session = await collaborationService.joinSession(req.params.id, userId);
      res.json({ success: true, data: session });
    } catch (error) {
      logger.error('Error in joinSession', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async leaveSession(req, res) {
    try {
      const userId = req.user?.id || 'system';
      const session = await collaborationService.leaveSession(req.params.id, userId);
      res.json({ success: true, data: session });
    } catch (error) {
      logger.error('Error in leaveSession', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Knowledge Base endpoints
  async createArticle(req, res) {
    try {
      const userId = req.user?.id || 'system';
      const article = await knowledgeService.createArticle(req.body, userId);

      await activityService.logActivity({
        workspace_id: article.workspace_id,
        actor_id: userId,
        action: 'kb.article.created',
        resource_type: 'kb_article',
        resource_id: article.id,
        details: { title: article.title },
      });

      res.status(201).json({ success: true, data: article });
    } catch (error) {
      logger.error('Error in createArticle', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getArticle(req, res) {
    try {
      const article = await knowledgeService.getArticle(req.params.id);
      res.json({ success: true, data: article });
    } catch (error) {
      logger.error('Error in getArticle', { error: error.message });
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async updateArticle(req, res) {
    try {
      const userId = req.user?.id || 'system';
      const article = await knowledgeService.updateArticle(req.params.id, req.body, userId);
      res.json({ success: true, data: article });
    } catch (error) {
      logger.error('Error in updateArticle', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async searchKnowledgeBase(req, res) {
    try {
      const articles = await knowledgeService.searchArticles(req.query);
      res.json({ success: true, data: articles, count: articles.length });
    } catch (error) {
      logger.error('Error in searchKnowledgeBase', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async publishArticle(req, res) {
    try {
      const article = await knowledgeService.publishArticle(req.params.id);
      res.json({ success: true, data: article });
    } catch (error) {
      logger.error('Error in publishArticle', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Messaging endpoints
  async sendMessage(req, res) {
    try {
      const userId = req.user?.id || 'system';
      const message = await messagingService.sendMessage(req.body, userId);
      res.status(201).json({ success: true, data: message });
    } catch (error) {
      logger.error('Error in sendMessage', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getMessages(req, res) {
    try {
      const options = {
        thread_id: req.query.thread_id,
        since: req.query.since,
        limit: parseInt(req.query.limit, 10) || 50,
        order: req.query.order,
      };
      const messages = await messagingService.getMessages(req.params.channelId, options);
      res.json({ success: true, data: messages, count: messages.length });
    } catch (error) {
      logger.error('Error in getMessages', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteMessage(req, res) {
    try {
      const userId = req.user?.id || 'system';
      const result = await messagingService.deleteMessage(req.params.id, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('Error in deleteMessage', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async addReaction(req, res) {
    try {
      const userId = req.user?.id || 'system';
      const message = await messagingService.addReaction(req.params.id, userId, req.body.emoji);
      res.json({ success: true, data: message });
    } catch (error) {
      logger.error('Error in addReaction', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Activity and Notification endpoints
  async getActivities(req, res) {
    try {
      const options = {
        action: req.query.action,
        resource_type: req.query.resource_type,
        actor_id: req.query.actor_id,
        since: req.query.since,
        limit: parseInt(req.query.limit, 10) || 100,
      };
      const activities = await activityService.getActivities(req.query.workspace_id, options);
      res.json({ success: true, data: activities, count: activities.length });
    } catch (error) {
      logger.error('Error in getActivities', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getPersonalFeed(req, res) {
    try {
      const userId = req.user?.id || req.query.user_id;
      const options = {
        unread_only: req.query.unread_only === 'true',
        limit: parseInt(req.query.limit, 10) || 50,
      };
      const activities = await activityService.getPersonalFeed(userId, req.query.workspace_id, options);
      res.json({ success: true, data: activities, count: activities.length });
    } catch (error) {
      logger.error('Error in getPersonalFeed', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async markActivityAsRead(req, res) {
    try {
      const userId = req.user?.id || 'system';
      const activity = await activityService.markAsRead(req.params.id, userId);
      res.json({ success: true, data: activity });
    } catch (error) {
      logger.error('Error in markActivityAsRead', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateNotificationPreferences(req, res) {
    try {
      // This would integrate with user preferences management
      res.json({ success: true, message: 'Notification preferences updated' });
    } catch (error) {
      logger.error('Error in updateNotificationPreferences', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getUnreadCount(req, res) {
    try {
      const userId = req.user?.id || req.query.user_id;
      const count = await activityService.getUnreadCount(userId, req.query.workspace_id);
      res.json({ success: true, data: { unread_count: count } });
    } catch (error) {
      logger.error('Error in getUnreadCount', { error: error.message });
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new CollaborationController();
