/**
 * Workspace Controller
 * Handles HTTP requests for workspace operations
 */

const workspaceService = require('../services/workspaceService');
const logger = require('../utils/logger');

class WorkspaceController {
  /**
   * Create workspace
   * POST /api/v1/collaboration/workspaces
   */
  async createWorkspace(req, res) {
    try {
      const userId = req.user?.id || 'system';
      const workspace = await workspaceService.createWorkspace(req.body, userId);
      res.status(201).json({
        success: true,
        data: workspace,
      });
    } catch (error) {
      logger.error('Error in createWorkspace controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get workspace
   * GET /api/v1/collaboration/workspaces/:id
   */
  async getWorkspace(req, res) {
    try {
      const workspace = await workspaceService.getWorkspace(req.params.id);
      res.json({
        success: true,
        data: workspace,
      });
    } catch (error) {
      logger.error('Error in getWorkspace controller', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update workspace
   * PUT /api/v1/collaboration/workspaces/:id
   */
  async updateWorkspace(req, res) {
    try {
      const workspace = await workspaceService.updateWorkspace(req.params.id, req.body);
      res.json({
        success: true,
        data: workspace,
      });
    } catch (error) {
      logger.error('Error in updateWorkspace controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Add member to workspace
   * POST /api/v1/collaboration/workspaces/:id/members
   */
  async addMember(req, res) {
    try {
      const workspace = await workspaceService.addMember(req.params.id, req.body);
      res.json({
        success: true,
        data: workspace,
      });
    } catch (error) {
      logger.error('Error in addMember controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Remove member from workspace
   * DELETE /api/v1/collaboration/workspaces/:id/members/:userId
   */
  async removeMember(req, res) {
    try {
      const workspace = await workspaceService.removeMember(req.params.id, req.params.userId);
      res.json({
        success: true,
        data: workspace,
      });
    } catch (error) {
      logger.error('Error in removeMember controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * List workspaces
   * GET /api/v1/collaboration/workspaces
   */
  async listWorkspaces(req, res) {
    try {
      const userId = req.user?.id || req.query.user_id;
      const filters = {
        type: req.query.type,
        status: req.query.status,
        limit: parseInt(req.query.limit, 10) || 100,
      };

      const workspaces = await workspaceService.listWorkspaces(userId, filters);
      res.json({
        success: true,
        data: workspaces,
        count: workspaces.length,
      });
    } catch (error) {
      logger.error('Error in listWorkspaces controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get workspace analytics
   * GET /api/v1/collaboration/workspaces/:id/analytics
   */
  async getAnalytics(req, res) {
    try {
      const analytics = await workspaceService.getAnalytics(req.params.id);
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
   * Archive workspace
   * POST /api/v1/collaboration/workspaces/:id/archive
   */
  async archiveWorkspace(req, res) {
    try {
      const workspace = await workspaceService.archiveWorkspace(req.params.id);
      res.json({
        success: true,
        data: workspace,
      });
    } catch (error) {
      logger.error('Error in archiveWorkspace controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new WorkspaceController();
