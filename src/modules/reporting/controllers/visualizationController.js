/**
 * Visualization Controller
 * Handles HTTP requests for visualization operations
 */

const visualizationService = require('../services/visualizationService');
const logger = require('../utils/logger');

class VisualizationController {
  /**
   * Create a new visualization
   * POST /api/v1/reports/visualizations
   */
  async createVisualization(req, res) {
    try {
      const visualization = await visualizationService.createVisualization(req.body);

      res.status(201).json({
        success: true,
        data: visualization,
      });
    } catch (error) {
      logger.error('Error in createVisualization controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get visualization by ID
   * GET /api/v1/reports/visualizations/:id
   */
  async getVisualization(req, res) {
    try {
      const visualization = await visualizationService.getVisualization(req.params.id);

      res.json({
        success: true,
        data: visualization,
      });
    } catch (error) {
      logger.error('Error in getVisualization controller', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Render visualization
   * POST /api/v1/reports/visualizations/render
   */
  async renderVisualization(req, res) {
    try {
      const { visualization_id, parameters } = req.body;

      if (!visualization_id) {
        return res.status(400).json({
          success: false,
          error: 'visualization_id is required',
        });
      }

      const rendered = await visualizationService.renderVisualization(
        visualization_id,
        parameters,
      );

      res.json({
        success: true,
        data: rendered,
      });
    } catch (error) {
      logger.error('Error in renderVisualization controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update visualization
   * PUT /api/v1/reports/visualizations/:id
   */
  async updateVisualization(req, res) {
    try {
      const visualization = await visualizationService.updateVisualization(
        req.params.id,
        req.body,
      );

      res.json({
        success: true,
        data: visualization,
      });
    } catch (error) {
      logger.error('Error in updateVisualization controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Delete visualization
   * DELETE /api/v1/reports/visualizations/:id
   */
  async deleteVisualization(req, res) {
    try {
      const result = await visualizationService.deleteVisualization(req.params.id);

      res.json({
        success: true,
        message: 'Visualization deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteVisualization controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * List visualizations
   * GET /api/v1/reports/visualizations
   */
  async listVisualizations(req, res) {
    try {
      const filters = {
        type: req.query.type,
        status: req.query.status,
        created_by: req.query.created_by,
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 20,
      };

      const result = await visualizationService.listVisualizations(filters);

      res.json({
        success: true,
        data: result.visualizations,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Error in listVisualizations controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new VisualizationController();
