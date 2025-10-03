/**
 * Article Controller
 * HTTP handlers for knowledge base operations
 */

const articleService = require('../services/articleService');
const logger = require('../utils/logger');

class ArticleController {
  async createArticle(req, res) {
    try {
      const userId = req.user?.id || req.body.user_id || 'test-user';
      const article = await articleService.createArticle(req.body, userId);
      res.status(201).json({ success: true, data: article });
    } catch (error) {
      logger.error('Create article failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getArticle(req, res) {
    try {
      const article = await articleService.getArticleById(req.params.id);
      res.json({ success: true, data: article });
    } catch (error) {
      logger.error('Get article failed', { error: error.message });
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async updateArticle(req, res) {
    try {
      const userId = req.user?.id || req.body.user_id || 'test-user';
      const article = await articleService.updateArticle(req.params.id, req.body, userId);
      res.json({ success: true, data: article });
    } catch (error) {
      logger.error('Update article failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteArticle(req, res) {
    try {
      const userId = req.user?.id || 'test-user';
      const article = await articleService.deleteArticle(req.params.id, userId);
      res.json({ success: true, data: article, message: 'Article archived' });
    } catch (error) {
      logger.error('Delete article failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async listArticles(req, res) {
    try {
      const filters = {
        workspace_id: req.query.workspace_id,
        category: req.query.category,
        status: req.query.status,
        author: req.query.author,
        limit: parseInt(req.query.limit, 10) || 100,
      };
      const articles = await articleService.listArticles(filters);
      res.json({ success: true, data: articles, count: articles.length });
    } catch (error) {
      logger.error('List articles failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async searchArticles(req, res) {
    try {
      const articles = await articleService.searchArticles(req.query);
      res.json({ success: true, data: articles, count: articles.length });
    } catch (error) {
      logger.error('Search articles failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async publishArticle(req, res) {
    try {
      const userId = req.user?.id || 'test-user';
      const article = await articleService.publishArticle(req.params.id, userId);
      res.json({ success: true, data: article, message: 'Article published' });
    } catch (error) {
      logger.error('Publish article failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async approveArticle(req, res) {
    try {
      const userId = req.user?.id || req.body.user_id || 'test-user';
      const article = await articleService.approveArticle(
        req.params.id,
        userId,
        req.body.approved,
        req.body.comments,
      );
      res.json({ success: true, data: article });
    } catch (error) {
      logger.error('Approve article failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new ArticleController();
