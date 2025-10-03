/**
 * Metrics Controller
 * Handles HTTP requests for KPI and metrics operations
 */

const metricsService = require('../services/metricsService');
const logger = require('../utils/logger');

class MetricsController {
  /**
   * Create a new KPI
   * POST /api/v1/reports/metrics/kpis
   */
  async createKPI(req, res) {
    try {
      const kpi = await metricsService.createKPI(req.body);

      res.status(201).json({
        success: true,
        data: kpi,
      });
    } catch (error) {
      logger.error('Error in createKPI controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get KPI by ID
   * GET /api/v1/reports/metrics/kpis/:id
   */
  async getKPI(req, res) {
    try {
      const kpi = await metricsService.getKPI(req.params.id);

      res.json({
        success: true,
        data: kpi,
      });
    } catch (error) {
      logger.error('Error in getKPI controller', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update KPI
   * PUT /api/v1/reports/metrics/kpis/:id
   */
  async updateKPI(req, res) {
    try {
      const kpi = await metricsService.updateKPI(req.params.id, req.body);

      res.json({
        success: true,
        data: kpi,
      });
    } catch (error) {
      logger.error('Error in updateKPI controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Delete KPI
   * DELETE /api/v1/reports/metrics/kpis/:id
   */
  async deleteKPI(req, res) {
    try {
      await metricsService.deleteKPI(req.params.id);

      res.json({
        success: true,
        message: 'KPI deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteKPI controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * List KPIs
   * GET /api/v1/reports/metrics/kpis
   */
  async listKPIs(req, res) {
    try {
      const filters = {
        category: req.query.category,
        status: req.query.status,
        owner: req.query.owner,
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 20,
      };

      const result = await metricsService.listKPIs(filters);

      res.json({
        success: true,
        data: result.kpis,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Error in listKPIs controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Collect metric value
   * POST /api/v1/reports/metrics/kpis/:id/collect
   */
  async collectMetric(req, res) {
    try {
      const { value, metadata } = req.body;
      const kpi = await metricsService.collectMetric(req.params.id, value, metadata);

      res.json({
        success: true,
        data: kpi,
        message: 'Metric collected successfully',
      });
    } catch (error) {
      logger.error('Error in collectMetric controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get KPI history
   * GET /api/v1/reports/metrics/kpis/:id/history
   */
  async getKPIHistory(req, res) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: parseInt(req.query.limit, 10) || 100,
      };

      const history = await metricsService.getKPIHistory(req.params.id, filters);

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      logger.error('Error in getKPIHistory controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get predefined KPIs
   * GET /api/v1/reports/metrics/predefined
   */
  async getPredefinedKPIs(req, res) {
    try {
      const kpis = await metricsService.getPredefinedKPIs();

      res.json({
        success: true,
        data: kpis,
      });
    } catch (error) {
      logger.error('Error in getPredefinedKPIs controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get aggregate metrics
   * GET /api/v1/reports/metrics/aggregate
   */
  async getAggregateMetrics(req, res) {
    try {
      const { category } = req.query;

      if (!category) {
        return res.status(400).json({
          success: false,
          error: 'Category is required',
        });
      }

      const aggregate = await metricsService.getAggregateMetrics(category);

      res.json({
        success: true,
        data: aggregate,
      });
    } catch (error) {
      logger.error('Error in getAggregateMetrics controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new MetricsController();
