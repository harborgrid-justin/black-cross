/**
 * Export Controller
 * Handles HTTP requests for export operations
 */

const exportService = require('../services/exportService');
const logger = require('../utils/logger');

class ExportController {
  /**
   * Create export for a report
   * POST /api/v1/reports/:id/export
   */
  async createExport(req, res) {
    try {
      const { format } = req.body;
      const userId = req.body.user_id || 'system';

      if (!format) {
        return res.status(400).json({
          success: false,
          error: 'format is required',
        });
      }

      const exportRecord = await exportService.createExport(
        req.params.id,
        format,
        userId,
      );

      res.status(201).json({
        success: true,
        data: exportRecord,
        message: 'Export created successfully',
      });
    } catch (error) {
      logger.error('Error in createExport controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get export by ID
   * GET /api/v1/reports/exports/:id
   */
  async getExport(req, res) {
    try {
      const exportRecord = await exportService.getExport(req.params.id);

      res.json({
        success: true,
        data: exportRecord,
      });
    } catch (error) {
      logger.error('Error in getExport controller', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Download export file
   * GET /api/v1/reports/exports/:id/download
   */
  async downloadExport(req, res) {
    try {
      const fileInfo = await exportService.downloadExport(req.params.id);

      res.json({
        success: true,
        data: fileInfo,
        message: 'Export ready for download',
      });
    } catch (error) {
      logger.error('Error in downloadExport controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * List exports
   * GET /api/v1/reports/exports
   */
  async listExports(req, res) {
    try {
      const filters = {
        report_id: req.query.report_id,
        status: req.query.status,
        format: req.query.format,
        created_by: req.query.created_by,
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 20,
      };

      const result = await exportService.listExports(filters);

      res.json({
        success: true,
        data: result.exports,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Error in listExports controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Delete export
   * DELETE /api/v1/reports/exports/:id
   */
  async deleteExport(req, res) {
    try {
      await exportService.deleteExport(req.params.id);

      res.json({
        success: true,
        message: 'Export deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteExport controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new ExportController();
