/**
 * Knowledge Base Service
 * Handles knowledge article creation, versioning, and search
 */

const KnowledgeArticle = require('../models/KnowledgeArticle');
const logger = require('../utils/logger');

class KnowledgeService {
  /**
   * Create a new knowledge article
   * @param {Object} articleData - Article data
   * @param {string} userId - User creating the article
   * @returns {Promise<Object>} Created article
   */
  async createArticle(articleData, userId) {
    try {
      logger.info('Creating new article', { title: articleData.title, workspace: articleData.workspace_id });

      const article = new KnowledgeArticle({
        ...articleData,
        author_id: articleData.author_id || userId,
        version: 1,
      });

      await article.save();
      logger.info('Article created successfully', { id: article.id });

      return article;
    } catch (error) {
      logger.error('Error creating article', { error: error.message });
      throw error;
    }
  }

  /**
   * Get article by ID
   * @param {string} articleId - Article ID
   * @returns {Promise<Object>} Article
   */
  async getArticle(articleId) {
    try {
      const article = await KnowledgeArticle.findOne({ id: articleId });

      if (!article) {
        throw new Error('Article not found');
      }

      // Increment view count
      article.analytics.view_count += 1;
      article.analytics.last_viewed_at = new Date();
      await article.save();

      return article;
    } catch (error) {
      logger.error('Error getting article', { error: error.message });
      throw error;
    }
  }

  /**
   * Update article
   * @param {string} articleId - Article ID
   * @param {Object} updates - Update data
   * @param {string} userId - User updating the article
   * @returns {Promise<Object>} Updated article
   */
  async updateArticle(articleId, updates, userId) {
    try {
      logger.info('Updating article', { articleId });

      const article = await KnowledgeArticle.findOne({ id: articleId });

      if (!article) {
        throw new Error('Article not found');
      }

      // Save version history if content changed
      if (updates.content && updates.content !== article.content) {
        article.version_history.push({
          version: article.version,
          content: article.content,
          edited_by: userId,
          edited_at: new Date(),
          change_summary: updates.change_summary || 'Updated content',
        });
        article.version += 1;
      }

      Object.assign(article, updates);
      await article.save();

      logger.info('Article updated successfully', { id: article.id });
      return article;
    } catch (error) {
      logger.error('Error updating article', { error: error.message });
      throw error;
    }
  }

  /**
   * Publish article
   * @param {string} articleId - Article ID
   * @returns {Promise<Object>} Published article
   */
  async publishArticle(articleId) {
    try {
      logger.info('Publishing article', { articleId });

      const article = await KnowledgeArticle.findOne({ id: articleId });

      if (!article) {
        throw new Error('Article not found');
      }

      // Check if approval is required
      if (article.approval_workflow?.required) {
        const allApproved = article.approval_workflow.approvers.every(
          (a) => a.status === 'approved',
        );

        if (!allApproved) {
          throw new Error('Article requires approval before publishing');
        }
      }

      article.status = 'published';
      article.published_at = new Date();
      await article.save();

      logger.info('Article published successfully', { articleId });
      return article;
    } catch (error) {
      logger.error('Error publishing article', { error: error.message });
      throw error;
    }
  }

  /**
   * Search articles
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Array>} Search results
   */
  async searchArticles(searchParams) {
    try {
      const query = {};

      if (searchParams.workspace_id) {
        query.workspace_id = searchParams.workspace_id;
      }

      if (searchParams.category) {
        query.category = searchParams.category;
      }

      if (searchParams.tags && searchParams.tags.length > 0) {
        query.tags = { $in: searchParams.tags };
      }

      if (searchParams.status) {
        query.status = searchParams.status;
      } else {
        query.status = 'published'; // Default to published articles
      }

      if (searchParams.query) {
        query.$text = { $search: searchParams.query };
      }

      const articles = await KnowledgeArticle.find(query)
        .select('-content -version_history')
        .sort({ 'analytics.view_count': -1, created_at: -1 })
        .limit(searchParams.limit || 20);

      return articles;
    } catch (error) {
      logger.error('Error searching articles', { error: error.message });
      throw error;
    }
  }

  /**
   * List articles
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Articles
   */
  async listArticles(filters = {}) {
    try {
      const query = {};

      if (filters.workspace_id) {
        query.workspace_id = filters.workspace_id;
      }

      if (filters.author_id) {
        query.author_id = filters.author_id;
      }

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      const articles = await KnowledgeArticle.find(query)
        .select('-content -version_history')
        .sort({ created_at: -1 })
        .limit(filters.limit || 50);

      return articles;
    } catch (error) {
      logger.error('Error listing articles', { error: error.message });
      throw error;
    }
  }

  /**
   * Get article categories
   * @param {string} workspaceId - Workspace ID
   * @returns {Promise<Array>} Categories
   */
  async getCategories(workspaceId) {
    try {
      const categories = await KnowledgeArticle.distinct('category', {
        workspace_id: workspaceId,
        status: 'published',
      });

      return categories;
    } catch (error) {
      logger.error('Error getting categories', { error: error.message });
      throw error;
    }
  }

  /**
   * Mark article as helpful
   * @param {string} articleId - Article ID
   * @returns {Promise<Object>} Updated article
   */
  async markHelpful(articleId) {
    try {
      const article = await KnowledgeArticle.findOne({ id: articleId });

      if (!article) {
        throw new Error('Article not found');
      }

      article.analytics.helpful_count += 1;
      await article.save();

      return article;
    } catch (error) {
      logger.error('Error marking article as helpful', { error: error.message });
      throw error;
    }
  }

  /**
   * Get article version history
   * @param {string} articleId - Article ID
   * @returns {Promise<Array>} Version history
   */
  async getVersionHistory(articleId) {
    try {
      const article = await KnowledgeArticle.findOne({ id: articleId })
        .select('version_history version');

      if (!article) {
        throw new Error('Article not found');
      }

      return article.version_history;
    } catch (error) {
      logger.error('Error getting version history', { error: error.message });
      throw error;
    }
  }

  /**
   * Approve article
   * @param {string} articleId - Article ID
   * @param {string} userId - User ID of approver
   * @param {boolean} approved - Approval status
   * @param {string} comment - Optional comment
   * @returns {Promise<Object>} Updated article
   */
  async approveArticle(articleId, userId, approved, comment = '') {
    try {
      logger.info('Approving article', { articleId, userId, approved });

      const article = await KnowledgeArticle.findOne({ id: articleId });

      if (!article) {
        throw new Error('Article not found');
      }

      const approver = article.approval_workflow?.approvers?.find(
        (a) => a.user_id === userId,
      );

      if (!approver) {
        throw new Error('User is not an approver for this article');
      }

      approver.status = approved ? 'approved' : 'rejected';
      approver.comment = comment;
      approver.timestamp = new Date();

      await article.save();
      logger.info('Article approval updated', { articleId, approved });

      return article;
    } catch (error) {
      logger.error('Error approving article', { error: error.message });
      throw error;
    }
  }
}

module.exports = new KnowledgeService();
