/**
 * Playbook Controller
 * Handles HTTP requests for playbook operations
 */

import libraryService from '../services/libraryService';
import playbookService from '../services/playbookService';
import executionService from '../services/executionService';
import decisionService from '../services/decisionService';
import testingService from '../services/testingService';
import metricsService from '../services/metricsService';
import logger from '../utils/logger';

class PlaybookController {
  /**
   * Get pre-built playbooks library
   * GET /api/v1/playbooks/library
   */
  async getLibrary(req, res) {
    try {
      const filters = {
        category: req.query.category,
        search: req.query.search,
        tags: req.query.tags ? req.query.tags.split(',') : undefined,
        limit: parseInt(req.query.limit, 10) || 100,
      };

      const playbooks = await libraryService.getLibrary(filters);
      res.json({
        success: true,
        data: playbooks,
        count: playbooks.length,
      });
    } catch (error) {
      logger.error('Error in getLibrary controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get playbook by ID
   * GET /api/v1/playbooks/:id
   */
  async getPlaybook(req, res) {
    try {
      const playbook = await libraryService.getPlaybook(req.params.id);
      res.json({
        success: true,
        data: playbook,
      });
    } catch (error) {
      logger.error('Error in getPlaybook controller', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Create custom playbook
   * POST /api/v1/playbooks
   */
  async createPlaybook(req, res) {
    try {
      const playbook = await playbookService.createPlaybook(req.body);
      res.status(201).json({
        success: true,
        data: playbook,
      });
    } catch (error) {
      logger.error('Error in createPlaybook controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update playbook
   * PUT /api/v1/playbooks/:id
   */
  async updatePlaybook(req, res) {
    try {
      const playbook = await playbookService.updatePlaybook(req.params.id, req.body);
      res.json({
        success: true,
        data: playbook,
      });
    } catch (error) {
      logger.error('Error in updatePlaybook controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Delete playbook
   * DELETE /api/v1/playbooks/:id
   */
  async deletePlaybook(req, res) {
    try {
      const result = await playbookService.deletePlaybook(req.params.id);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in deletePlaybook controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Clone playbook
   * POST /api/v1/playbooks/:id/clone
   */
  async clonePlaybook(req, res) {
    try {
      const playbook = await playbookService.clonePlaybook(req.params.id, req.body);
      res.status(201).json({
        success: true,
        data: playbook,
      });
    } catch (error) {
      logger.error('Error in clonePlaybook controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * List playbooks
   * GET /api/v1/playbooks
   */
  async listPlaybooks(req, res) {
    try {
      const filters = {
        author: req.query.author,
        status: req.query.status,
        category: req.query.category,
        is_prebuilt: req.query.is_prebuilt !== undefined
          ? req.query.is_prebuilt === 'true' : undefined,
        search: req.query.search,
        limit: parseInt(req.query.limit, 10) || 100,
      };

      const playbooks = await playbookService.listPlaybooks(filters);
      res.json({
        success: true,
        data: playbooks,
        count: playbooks.length,
      });
    } catch (error) {
      logger.error('Error in listPlaybooks controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Execute playbook
   * POST /api/v1/playbooks/:id/execute
   */
  async executePlaybook(req, res) {
    try {
      const execution = await executionService.executePlaybook(req.params.id, req.body);
      res.status(201).json({
        success: true,
        data: execution,
      });
    } catch (error) {
      logger.error('Error in executePlaybook controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get execution details
   * GET /api/v1/playbooks/executions/:id
   */
  async getExecution(req, res) {
    try {
      const execution = await executionService.getExecution(req.params.id);
      res.json({
        success: true,
        data: execution,
      });
    } catch (error) {
      logger.error('Error in getExecution controller', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * List executions
   * GET /api/v1/playbooks/executions
   */
  async listExecutions(req, res) {
    try {
      const filters = {
        playbook_id: req.query.playbook_id,
        status: req.query.status,
        execution_mode: req.query.execution_mode,
        from_date: req.query.from_date,
        limit: parseInt(req.query.limit, 10) || 100,
      };

      const executions = await executionService.listExecutions(filters);
      res.json({
        success: true,
        data: executions,
        count: executions.length,
      });
    } catch (error) {
      logger.error('Error in listExecutions controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Cancel execution
   * POST /api/v1/playbooks/executions/:id/cancel
   */
  async cancelExecution(req, res) {
    try {
      const execution = await executionService.cancelExecution(req.params.id);
      res.json({
        success: true,
        data: execution,
      });
    } catch (error) {
      logger.error('Error in cancelExecution controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Approve execution
   * POST /api/v1/playbooks/executions/:id/approve
   */
  async approveExecution(req, res) {
    try {
      const execution = await executionService.approveExecution(req.params.id, req.body);
      res.json({
        success: true,
        data: execution,
      });
    } catch (error) {
      logger.error('Error in approveExecution controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Add decision to playbook
   * POST /api/v1/playbooks/:id/decisions
   */
  async addDecision(req, res) {
    try {
      const playbook = await decisionService.addDecision(req.params.id, req.body);
      res.json({
        success: true,
        data: playbook,
      });
    } catch (error) {
      logger.error('Error in addDecision controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get execution paths
   * GET /api/v1/playbooks/:id/paths
   */
  async getExecutionPaths(req, res) {
    try {
      const context = req.body || {};
      const paths = await decisionService.getExecutionPaths(req.params.id, context);
      res.json({
        success: true,
        data: paths,
      });
    } catch (error) {
      logger.error('Error in getExecutionPaths controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Test playbook
   * POST /api/v1/playbooks/:id/test
   */
  async testPlaybook(req, res) {
    try {
      const test = await testingService.testPlaybook(req.params.id, req.body);
      res.status(201).json({
        success: true,
        data: test,
      });
    } catch (error) {
      logger.error('Error in testPlaybook controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get test results
   * GET /api/v1/playbooks/:id/test-results
   */
  async getTestResults(req, res) {
    try {
      const tests = await testingService.listTests(req.params.id);
      res.json({
        success: true,
        data: tests,
        count: tests.length,
      });
    } catch (error) {
      logger.error('Error in getTestResults controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get playbook metrics
   * GET /api/v1/playbooks/:id/metrics
   */
  async getMetrics(req, res) {
    try {
      const options = {
        days: parseInt(req.query.days, 10) || 30,
      };

      const metrics = await metricsService.getPlaybookMetrics(req.params.id, options);
      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      logger.error('Error in getMetrics controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get overall analytics
   * GET /api/v1/playbooks/analytics
   */
  async getAnalytics(req, res) {
    try {
      const filters = {
        category: req.query.category,
        status: req.query.status,
      };

      const analytics = await metricsService.getAnalytics(filters);
      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      logger.error('Error in getAnalytics controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Import playbook
   * POST /api/v1/playbooks/import
   */
  async importPlaybook(req, res) {
    try {
      const options = {
        author: req.body.author,
        overwrite: req.body.overwrite,
      };

      const playbook = await playbookService.importPlaybook(req.body.playbook, options);
      res.status(201).json({
        success: true,
        data: playbook,
      });
    } catch (error) {
      logger.error('Error in importPlaybook controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Export playbook
   * GET /api/v1/playbooks/:id/export
   */
  async exportPlaybook(req, res) {
    try {
      const playbookData = await playbookService.exportPlaybook(req.params.id);
      res.json({
        success: true,
        data: playbookData,
      });
    } catch (error) {
      logger.error('Error in exportPlaybook controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get playbook categories
   * GET /api/v1/playbooks/categories
   */
  async getCategories(req, res) {
    try {
      const categories = await libraryService.getCategories();
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      logger.error('Error in getCategories controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export default new PlaybookController();
