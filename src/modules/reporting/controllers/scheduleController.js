/**
 * Schedule Controller
 * Handles HTTP requests for report schedule operations
 */

const scheduleService = require('../services/scheduleService');
const logger = require('../utils/logger');

class ScheduleController {
  /**
   * Create a new report schedule
   * POST /api/v1/reports/schedules
   */
  async createSchedule(req, res) {
    try {
      const schedule = await scheduleService.createSchedule(req.body);

      res.status(201).json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      logger.error('Error in createSchedule controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get schedule by ID
   * GET /api/v1/reports/schedules/:id
   */
  async getSchedule(req, res) {
    try {
      const schedule = await scheduleService.getSchedule(req.params.id);

      res.json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      logger.error('Error in getSchedule controller', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update schedule
   * PUT /api/v1/reports/schedules/:id
   */
  async updateSchedule(req, res) {
    try {
      const schedule = await scheduleService.updateSchedule(req.params.id, req.body);

      res.json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      logger.error('Error in updateSchedule controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Delete schedule
   * DELETE /api/v1/reports/schedules/:id
   */
  async deleteSchedule(req, res) {
    try {
      await scheduleService.deleteSchedule(req.params.id);

      res.json({
        success: true,
        message: 'Schedule deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteSchedule controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * List schedules
   * GET /api/v1/reports/schedules
   */
  async listSchedules(req, res) {
    try {
      const filters = {
        enabled: req.query.enabled !== undefined ? req.query.enabled === 'true' : undefined,
        created_by: req.query.created_by,
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 20,
      };

      const result = await scheduleService.listSchedules(filters);

      res.json({
        success: true,
        data: result.schedules,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Error in listSchedules controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get schedule executions
   * GET /api/v1/reports/executions
   */
  async getExecutions(req, res) {
    try {
      // This would fetch from a separate execution log in production
      res.json({
        success: true,
        data: [],
        message: 'Execution history tracking not yet implemented',
      });
    } catch (error) {
      logger.error('Error in getExecutions controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new ScheduleController();
