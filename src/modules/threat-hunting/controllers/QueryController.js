/**
 * Query Controller
 * Handles HTTP requests for query operations
 */

const QueryService = require('../services/QueryService');

class QueryController {
  /**
   * Execute a hunt query
   * POST /api/v1/hunting/query
   */
  async executeQuery(req, res) {
    try {
      const userId = req.user?.id || 'anonymous';
      const result = await QueryService.executeQuery(req.body, userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to execute query',
        message: error.message,
      });
    }
  }

  /**
   * Save a query
   * POST /api/v1/hunting/queries
   */
  async saveQuery(req, res) {
    try {
      const userId = req.user?.id || 'anonymous';
      const query = await QueryService.saveQuery(req.body, userId);
      res.status(201).json(query);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to save query',
        message: error.message,
      });
    }
  }

  /**
   * List queries
   * GET /api/v1/hunting/queries
   */
  async listQueries(req, res) {
    try {
      const filters = {
        status: req.query.status,
        createdBy: req.query.createdBy,
        tags: req.query.tags ? req.query.tags.split(',') : undefined,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
      };
      const queries = await QueryService.listQueries(filters);
      res.json({ queries, total: queries.length });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to list queries',
        message: error.message,
      });
    }
  }

  /**
   * Get a specific query
   * GET /api/v1/hunting/queries/:id
   */
  async getQuery(req, res) {
    try {
      const query = await QueryService.getQuery(req.params.id);
      res.json(query);
    } catch (error) {
      res.status(404).json({
        error: 'Query not found',
        message: error.message,
      });
    }
  }

  /**
   * Update a query
   * PUT /api/v1/hunting/queries/:id
   */
  async updateQuery(req, res) {
    try {
      const userId = req.user?.id || 'anonymous';
      const query = await QueryService.updateQuery(req.params.id, req.body, userId);
      res.json(query);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update query',
        message: error.message,
      });
    }
  }

  /**
   * Delete a query
   * DELETE /api/v1/hunting/queries/:id
   */
  async deleteQuery(req, res) {
    try {
      const userId = req.user?.id || 'anonymous';
      await QueryService.deleteQuery(req.params.id, userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        error: 'Failed to delete query',
        message: error.message,
      });
    }
  }

  /**
   * Get query templates
   * GET /api/v1/hunting/query-templates
   */
  async getTemplates(req, res) {
    try {
      const templates = await QueryService.getTemplates();
      res.json({ templates, total: templates.length });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get templates',
        message: error.message,
      });
    }
  }
}

module.exports = new QueryController();
