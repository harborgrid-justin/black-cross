/**
 * Message Controller
 * HTTP handlers for messaging operations
 */

const messageService = require('../services/messageService');
const logger = require('../utils/logger');

class MessageController {
  async createChannel(req, res) {
    try {
      const userId = req.user?.id || req.body.user_id || 'test-user';
      const channel = await messageService.createChannel(req.body, userId);
      res.status(201).json({ success: true, data: channel });
    } catch (error) {
      logger.error('Create channel failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getChannel(req, res) {
    try {
      const channel = await messageService.getChannelById(req.params.id);
      res.json({ success: true, data: channel });
    } catch (error) {
      logger.error('Get channel failed', { error: error.message });
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async listChannels(req, res) {
    try {
      const userId = req.user?.id || req.query.user_id || 'test-user';
      const channels = await messageService.listChannels(userId, req.query.workspace_id);
      res.json({ success: true, data: channels, count: channels.length });
    } catch (error) {
      logger.error('List channels failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async sendMessage(req, res) {
    try {
      const userId = req.user?.id || req.body.user_id || 'test-user';
      const message = await messageService.sendMessage(req.body, userId);
      res.status(201).json({ success: true, data: message });
    } catch (error) {
      logger.error('Send message failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getMessages(req, res) {
    try {
      const userId = req.user?.id || req.query.user_id || 'test-user';
      const options = {
        thread_id: req.query.thread_id,
        limit: parseInt(req.query.limit, 10) || 50,
      };
      const messages = await messageService.getMessages(req.params.channelId, userId, options);
      res.json({ success: true, data: messages, count: messages.length });
    } catch (error) {
      logger.error('Get messages failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateMessage(req, res) {
    try {
      const userId = req.user?.id || req.body.user_id || 'test-user';
      const message = await messageService.updateMessage(req.params.id, req.body.content, userId);
      res.json({ success: true, data: message });
    } catch (error) {
      logger.error('Update message failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteMessage(req, res) {
    try {
      const userId = req.user?.id || 'test-user';
      const message = await messageService.deleteMessage(req.params.id, userId);
      res.json({ success: true, data: message, message: 'Message deleted' });
    } catch (error) {
      logger.error('Delete message failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async addReaction(req, res) {
    try {
      const userId = req.user?.id || req.body.user_id || 'test-user';
      const message = await messageService.addReaction(req.params.id, req.body.emoji, userId);
      res.json({ success: true, data: message });
    } catch (error) {
      logger.error('Add reaction failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async searchMessages(req, res) {
    try {
      const userId = req.user?.id || req.query.user_id || 'test-user';
      const messages = await messageService.searchMessages(
        req.query.query,
        userId,
        req.query.workspace_id,
      );
      res.json({ success: true, data: messages, count: messages.length });
    } catch (error) {
      logger.error('Search messages failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new MessageController();
