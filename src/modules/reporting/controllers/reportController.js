/**
 * Report Controller
 * Handles HTTP requests for report operations
 */

const reportService = require('../services/reportService');
const logger = require('../utils/logger');

class ReportController {
  /**
   * Create a new report
   * POST /api/v1/reports
   */
  async createReport(req, res) {
    try {
      const report = await reportService.createReport(req.body);

      res.status(201).json({
        success: true,
        data: report,
      });
    } catch (error) {
      logger.error('Error in createReport controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Generate report from template
   * POST /api/v1/reports/generate
   */
  async generateReport(req, res) {
    try {
      const { template_id, parameters, format } = req.body;
      const userId = req.body.user_id || 'system';

      const report = await reportService.generateReport(
        template_id,
        { ...parameters, format },
        userId,
      );

      res.status(201).json({
        success: true,
        data: report,
        message: 'Report generation initiated',
      });
    } catch (error) {
      logger.error('Error in generateReport controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get report by ID
   * GET /api/v1/reports/:id
   */
  async getReport(req, res) {
    try {
      const report = await reportService.getReport(req.params.id);

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      logger.error('Error in getReport controller', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * List reports
   * GET /api/v1/reports
   */
  async listReports(req, res) {
    try {
      const filters = {
        type: req.query.type,
        status: req.query.status,
        created_by: req.query.created_by,
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 20,
      };

      const result = await reportService.listReports(filters);

      res.json({
        success: true,
        data: result.reports,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Error in listReports controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Delete report
   * DELETE /api/v1/reports/:id
   */
  async deleteReport(req, res) {
    try {
      const result = await reportService.deleteReport(req.params.id);

      res.json({
        success: true,
        message: 'Report deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteReport controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new ReportController();
