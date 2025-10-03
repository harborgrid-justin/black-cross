/**
 * Template Controller
 * Handles HTTP requests for report template operations
 */

const templateService = require('../services/templateService');
const logger = require('../utils/logger');

class TemplateController {
  /**
   * Create a new report template
   * POST /api/v1/reports/templates
   */
  async createTemplate(req, res) {
    try {
      const template = await templateService.createTemplate(req.body);

      res.status(201).json({
        success: true,
        data: template,
      });
    } catch (error) {
      logger.error('Error in createTemplate controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get template by ID
   * GET /api/v1/reports/templates/:id
   */
  async getTemplate(req, res) {
    try {
      const template = await templateService.getTemplate(req.params.id);

      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      logger.error('Error in getTemplate controller', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update template
   * PUT /api/v1/reports/templates/:id
   */
  async updateTemplate(req, res) {
    try {
      const template = await templateService.updateTemplate(req.params.id, req.body);

      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      logger.error('Error in updateTemplate controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Delete template
   * DELETE /api/v1/reports/templates/:id
   */
  async deleteTemplate(req, res) {
    try {
      const result = await templateService.deleteTemplate(req.params.id);

      res.json({
        success: true,
        message: 'Template deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteTemplate controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * List templates
   * GET /api/v1/reports/templates
   */
  async listTemplates(req, res) {
    try {
      const filters = {
        type: req.query.type,
        status: req.query.status,
        created_by: req.query.created_by,
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 20,
      };

      const result = await templateService.listTemplates(filters);

      res.json({
        success: true,
        data: result.templates,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Error in listTemplates controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Clone template
   * POST /api/v1/reports/templates/:id/clone
   */
  async cloneTemplate(req, res) {
    try {
      const { name } = req.body;
      const userId = req.body.user_id || 'system';

      const template = await templateService.cloneTemplate(req.params.id, name, userId);

      res.status(201).json({
        success: true,
        data: template,
        message: 'Template cloned successfully',
      });
    } catch (error) {
      logger.error('Error in cloneTemplate controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new TemplateController();
