/**
 * Workspace Controller
 * HTTP handlers for workspace operations
 */

const workspaceService = require('../services/workspaceService');
const logger = require('../utils/logger');

class WorkspaceController {
  /**
   * Create workspace
   */
  async createWorkspace(req, res) {
    try {
      const userId = req.user?.id || req.body.user_id || 'test-user';
      const workspace = await workspaceService.createWorkspace(req.body, userId);

      res.status(201).json({
        success: true,
        data: workspace,
      });
    } catch (error) {
      logger.error('Create workspace failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get workspace by ID
   */
  async getWorkspace(req, res) {
    try {
      const workspace = await workspaceService.getWorkspaceById(req.params.id);

      res.json({
        success: true,
        data: workspace,
      });
    } catch (error) {
      logger.error('Get workspace failed', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update workspace
   */
  async updateWorkspace(req, res) {
    try {
      const userId = req.user?.id || req.body.user_id || 'test-user';
      const workspace = await workspaceService.updateWorkspace(req.params.id, req.body, userId);

      res.json({
        success: true,
        data: workspace,
      });
    } catch (error) {
      logger.error('Update workspace failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Delete workspace
   */
  async deleteWorkspace(req, res) {
    try {
      const userId = req.user?.id || 'test-user';
      const workspace = await workspaceService.deleteWorkspace(req.params.id, userId);

      res.json({
        success: true,
        data: workspace,
        message: 'Workspace archived successfully',
      });
    } catch (error) {
      logger.error('Delete workspace failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * List workspaces
   */
  async listWorkspaces(req, res) {
    try {
      const userId = req.user?.id || req.query.user_id || 'test-user';
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
      logger.error('List workspaces failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Add member to workspace
   */
  async addMember(req, res) {
    try {
      const userId = req.user?.id || 'test-user';
      const workspace = await workspaceService.addMember(req.params.id, req.body, userId);

      res.json({
        success: true,
        data: workspace,
        message: 'Member added successfully',
      });
    } catch (error) {
      logger.error('Add member failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Remove member from workspace
   */
  async removeMember(req, res) {
    try {
      const userId = req.user?.id || 'test-user';
      const workspace = await workspaceService.removeMember(
        req.params.id,
        req.params.memberId,
        userId,
      );

      res.json({
        success: true,
        data: workspace,
        message: 'Member removed successfully',
      });
    } catch (error) {
      logger.error('Remove member failed', { error: error.message });
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new WorkspaceController();
