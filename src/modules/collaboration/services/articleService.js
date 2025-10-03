/**
 * Knowledge Base Article Service
 * Business logic for KB operations
 */

const Article = require('../models/Article');
const logger = require('../utils/logger');
const activityService = require('./activityService');

class ArticleService {
  /**
   * Create a new article
   */
  async createArticle(data, userId) {
    try {
      const article = new Article({
        ...data,
        author: userId,
      });

      await article.save();

      await activityService.logActivity({
        actor_id: userId,
        action: 'created',
        entity_type: 'article',
        entity_id: article.id,
        workspace_id: article.workspace_id,
        details: { article_title: article.title },
      });

      logger.info('Article created', { article_id: article.id, user_id: userId });
      return article;
    } catch (error) {
      logger.error('Failed to create article', { error: error.message, user_id: userId });
      throw error;
    }
  }

  /**
   * Get article by ID
   */
  async getArticleById(articleId) {
    try {
      const article = await Article.findOne({ id: articleId });
      if (!article) {
        throw new Error('Article not found');
      }

      // Increment view count
      article.views += 1;
      await article.save();

      return article;
    } catch (error) {
      logger.error('Failed to get article', { error: error.message, article_id: articleId });
      throw error;
    }
  }

  /**
   * Update article
   */
  async updateArticle(articleId, updates, userId) {
    try {
      const article = await Article.findOne({ id: articleId });
      if (!article) {
        throw new Error('Article not found');
      }

      // Save version history
      if (updates.content && updates.content !== article.content) {
        article.versions.push({
          version: article.version,
          content: article.content,
          edited_by: userId,
          edited_at: new Date(),
          change_summary: updates.change_summary || 'Content updated',
        });
        article.version += 1;
      }

      Object.assign(article, updates);
      await article.save();

      await activityService.logActivity({
        actor_id: userId,
        action: 'updated',
        entity_type: 'article',
        entity_id: article.id,
        workspace_id: article.workspace_id,
        details: { updates },
      });

      logger.info('Article updated', { article_id: articleId, user_id: userId });
      return article;
    } catch (error) {
      logger.error('Failed to update article', { error: error.message, article_id: articleId });
      throw error;
    }
  }

  /**
   * Delete article
   */
  async deleteArticle(articleId, userId) {
    try {
      const article = await Article.findOne({ id: articleId });
      if (!article) {
        throw new Error('Article not found');
      }

      article.status = 'archived';
      await article.save();

      await activityService.logActivity({
        actor_id: userId,
        action: 'deleted',
        entity_type: 'article',
        entity_id: article.id,
        workspace_id: article.workspace_id,
        details: { article_title: article.title },
      });

      logger.info('Article archived', { article_id: articleId, user_id: userId });
      return article;
    } catch (error) {
      logger.error('Failed to archive article', { error: error.message, article_id: articleId });
      throw error;
    }
  }

  /**
   * Search articles
   */
  async searchArticles(query) {
    try {
      const searchQuery = {
        status: 'published',
      };

      if (query.query) {
        searchQuery.$text = { $search: query.query };
      }

      if (query.category) {
        searchQuery.category = query.category;
      }

      if (query.tags && query.tags.length > 0) {
        searchQuery.tags = { $in: query.tags };
      }

      if (query.workspace_id) {
        searchQuery.workspace_id = query.workspace_id;
      }

      const articles = await Article.find(searchQuery)
        .sort({ views: -1, created_at: -1 })
        .limit(query.limit || 50);

      return articles;
    } catch (error) {
      logger.error('Failed to search articles', { error: error.message });
      throw error;
    }
  }

  /**
   * List articles
   */
  async listArticles(filters = {}) {
    try {
      const query = {};

      if (filters.workspace_id) {
        query.workspace_id = filters.workspace_id;
      }

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.status) {
        query.status = filters.status;
      } else {
        query.status = 'published';
      }

      if (filters.author) {
        query.author = filters.author;
      }

      const articles = await Article.find(query)
        .sort({ created_at: -1 })
        .limit(filters.limit || 100);

      return articles;
    } catch (error) {
      logger.error('Failed to list articles', { error: error.message });
      throw error;
    }
  }

  /**
   * Publish article
   */
  async publishArticle(articleId, userId) {
    try {
      const article = await Article.findOne({ id: articleId });
      if (!article) {
        throw new Error('Article not found');
      }

      if (article.approval.required) {
        const allApproved = article.approval.approvers.every((a) => a.approved === true);
        if (!allApproved) {
          throw new Error('Article requires approval before publishing');
        }
      }

      article.status = 'published';
      article.published_at = new Date();
      await article.save();

      await activityService.logActivity({
        actor_id: userId,
        action: 'updated',
        entity_type: 'article',
        entity_id: article.id,
        workspace_id: article.workspace_id,
        details: { action: 'published' },
      });

      logger.info('Article published', { article_id: articleId, user_id: userId });
      return article;
    } catch (error) {
      logger.error('Failed to publish article', { error: error.message, article_id: articleId });
      throw error;
    }
  }

  /**
   * Approve article
   */
  async approveArticle(articleId, userId, approved, comments) {
    try {
      const article = await Article.findOne({ id: articleId });
      if (!article) {
        throw new Error('Article not found');
      }

      const approver = article.approval.approvers.find((a) => a.user_id === userId);
      if (!approver) {
        throw new Error('User is not an approver for this article');
      }

      approver.approved = approved;
      approver.approved_at = new Date();
      approver.comments = comments;

      await article.save();

      logger.info('Article approval recorded', { article_id: articleId, user_id: userId, approved });
      return article;
    } catch (error) {
      logger.error('Failed to approve article', { error: error.message, article_id: articleId });
      throw error;
    }
  }
}

module.exports = new ArticleService();
