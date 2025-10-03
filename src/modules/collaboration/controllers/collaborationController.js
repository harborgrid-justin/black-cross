/**
 * Collaboration Controller
 * HTTP handlers for real-time collaboration operations
 */

const collaborationService = require('../services/collaborationService');
const logger = require('../utils/logger');

class CollaborationController {
  async joinSession(req, res) {
    try {
      const userId = req.user?.id || req.body.user_id || 'test-user';
      const session = await collaborationService.joinSession(
        req.body.entity_type,
        req.body.entity_id,
        userId,
        req.body.workspace_id,
        req.body.socket_id,
      );
      res.json({ success: true, data: session });
    } catch (error) {
      logger.error('Join session failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async leaveSession(req, res) {
    try {
      const userId = req.user?.id || req.body.user_id || 'test-user';
      const session = await collaborationService.leaveSession(req.params.id, userId);
      res.json({ success: true, data: session });
    } catch (error) {
      logger.error('Leave session failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getSession(req, res) {
    try {
      const session = await collaborationService.getActiveSession(
        req.query.entity_type,
        req.query.entity_id,
      );
      res.json({ success: true, data: session });
    } catch (error) {
      logger.error('Get session failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async listSessions(req, res) {
    try {
      const sessions = await collaborationService.listSessions(req.query.workspace_id);
      res.json({ success: true, data: sessions, count: sessions.length });
    } catch (error) {
      logger.error('List sessions failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new CollaborationController();
