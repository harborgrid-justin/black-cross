/**
 * Integration Controller
 * Handles HTTP requests for integration operations
 */

import integrationService from '../services/integrationService';
import logger from '../utils/logger';

class IntegrationController {
  /**
   * Create integration
   * POST /api/v1/integrations
   */
  async createIntegration(req, res) {
    try {
      const integration = await integrationService.createIntegration(req.body);
      res.status(201).json({
        success: true,
        data: integration,
      });
    } catch (error) {
      logger.error('Error in createIntegration controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update integration
   * PUT /api/v1/integrations/:id
   */
  async updateIntegration(req, res) {
    try {
      const integration = await integrationService.updateIntegration(req.params.id, req.body);
      res.json({
        success: true,
        data: integration,
      });
    } catch (error) {
      logger.error('Error in updateIntegration controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Delete integration
   * DELETE /api/v1/integrations/:id
   */
  async deleteIntegration(req, res) {
    try {
      const result = await integrationService.deleteIntegration(req.params.id);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in deleteIntegration controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * List integrations
   * GET /api/v1/integrations
   */
  async listIntegrations(req, res) {
    try {
      const filters = {
        type: req.query.type,
        status: req.query.status,
        vendor: req.query.vendor,
        limit: parseInt(req.query.limit, 10) || 100,
      };

      const integrations = await integrationService.listIntegrations(filters);
      res.json({
        success: true,
        data: integrations,
        count: integrations.length,
      });
    } catch (error) {
      logger.error('Error in listIntegrations controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get integration by ID
   * GET /api/v1/integrations/:id
   */
  async getIntegration(req, res) {
    try {
      const integration = await integrationService.getIntegration(req.params.id);
      res.json({
        success: true,
        data: integration,
      });
    } catch (error) {
      logger.error('Error in getIntegration controller', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Test integration
   * POST /api/v1/integrations/:id/test
   */
  async testIntegration(req, res) {
    try {
      const result = await integrationService.testIntegration(req.params.id, req.body);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in testIntegration controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get integration types
   * GET /api/v1/integrations/types
   */
  async getIntegrationTypes(req, res) {
    try {
      const types = integrationService.getIntegrationTypes();
      res.json({
        success: true,
        data: types,
      });
    } catch (error) {
      logger.error('Error in getIntegrationTypes controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get integration statistics
   * GET /api/v1/integrations/statistics
   */
  async getStatistics(req, res) {
    try {
      const statistics = await integrationService.getStatistics();
      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      logger.error('Error in getStatistics controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export default new IntegrationController();

