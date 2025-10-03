/**
 * Dashboard Controller
 * Handles HTTP requests for dashboard operations
 */

const dashboardService = require('../services/dashboardService');
const logger = require('../utils/logger');

class DashboardController {
  /**
   * Create a new dashboard
   * POST /api/v1/reports/dashboards
   */
  async createDashboard(req, res) {
    try {
      const dashboard = await dashboardService.createDashboard(req.body);

      res.status(201).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      logger.error('Error in createDashboard controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get executive dashboard
   * GET /api/v1/reports/dashboards/executive
   */
  async getExecutiveDashboard(req, res) {
    try {
      const userId = req.query.user_id || 'system';
      const dashboard = await dashboardService.getExecutiveDashboard(userId);

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      logger.error('Error in getExecutiveDashboard controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get dashboard by ID
   * GET /api/v1/reports/dashboards/:id
   */
  async getDashboard(req, res) {
    try {
      const dashboard = await dashboardService.getDashboard(req.params.id);
      const populatedDashboard = await dashboardService.populateDashboardData(dashboard);

      res.json({
        success: true,
        data: populatedDashboard,
      });
    } catch (error) {
      logger.error('Error in getDashboard controller', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update dashboard
   * PUT /api/v1/reports/dashboards/:id
   */
  async updateDashboard(req, res) {
    try {
      const dashboard = await dashboardService.updateDashboard(req.params.id, req.body);

      res.json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      logger.error('Error in updateDashboard controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Delete dashboard
   * DELETE /api/v1/reports/dashboards/:id
   */
  async deleteDashboard(req, res) {
    try {
      const result = await dashboardService.deleteDashboard(req.params.id);

      res.json({
        success: true,
        message: 'Dashboard deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteDashboard controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * List dashboards
   * GET /api/v1/reports/dashboards
   */
  async listDashboards(req, res) {
    try {
      const filters = {
        type: req.query.type,
        owner: req.query.owner,
        status: req.query.status,
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 20,
      };

      const result = await dashboardService.listDashboards(filters);

      res.json({
        success: true,
        data: result.dashboards,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Error in listDashboards controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Add widget to dashboard
   * POST /api/v1/reports/dashboards/:id/widgets
   */
  async addWidget(req, res) {
    try {
      const dashboard = await dashboardService.addWidget(req.params.id, req.body);

      res.status(201).json({
        success: true,
        data: dashboard,
        message: 'Widget added successfully',
      });
    } catch (error) {
      logger.error('Error in addWidget controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new DashboardController();
