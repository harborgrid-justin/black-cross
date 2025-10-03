/**
 * Workspace Management Service
 * Business logic for workspace operations
 */

const Workspace = require('../models/Workspace');
const logger = require('../utils/logger');
const activityService = require('./activityService');

class WorkspaceService {
  /**
   * Create a new workspace
   */
  async createWorkspace(data, userId) {
    try {
      const workspace = new Workspace({
        ...data,
        owner: userId,
        members: [{ user_id: userId, role: 'owner' }],
      });

      await workspace.save();

      // Log activity
      await activityService.logActivity({
        actor_id: userId,
        action: 'created',
        entity_type: 'workspace',
        entity_id: workspace.id,
        workspace_id: workspace.id,
        details: { workspace_name: workspace.name },
      });

      logger.info('Workspace created', { workspace_id: workspace.id, user_id: userId });
      return workspace;
    } catch (error) {
      logger.error('Failed to create workspace', { error: error.message, user_id: userId });
      throw error;
    }
  }

  /**
   * Get workspace by ID
   */
  async getWorkspaceById(workspaceId) {
    try {
      const workspace = await Workspace.findOne({ id: workspaceId });
      if (!workspace) {
        throw new Error('Workspace not found');
      }
      return workspace;
    } catch (error) {
      logger.error('Failed to get workspace', { error: error.message, workspace_id: workspaceId });
      throw error;
    }
  }

  /**
   * Update workspace
   */
  async updateWorkspace(workspaceId, updates, userId) {
    try {
      const workspace = await Workspace.findOne({ id: workspaceId });
      if (!workspace) {
        throw new Error('Workspace not found');
      }

      Object.assign(workspace, updates);
      await workspace.save();

      await activityService.logActivity({
        actor_id: userId,
        action: 'updated',
        entity_type: 'workspace',
        entity_id: workspace.id,
        workspace_id: workspace.id,
        details: { updates },
      });

      logger.info('Workspace updated', { workspace_id: workspaceId, user_id: userId });
      return workspace;
    } catch (error) {
      logger.error('Failed to update workspace', { error: error.message, workspace_id: workspaceId });
      throw error;
    }
  }

  /**
   * Delete/archive workspace
   */
  async deleteWorkspace(workspaceId, userId) {
    try {
      const workspace = await Workspace.findOne({ id: workspaceId });
      if (!workspace) {
        throw new Error('Workspace not found');
      }

      workspace.status = 'archived';
      workspace.archived_at = new Date();
      await workspace.save();

      await activityService.logActivity({
        actor_id: userId,
        action: 'deleted',
        entity_type: 'workspace',
        entity_id: workspace.id,
        workspace_id: workspace.id,
        details: { workspace_name: workspace.name },
      });

      logger.info('Workspace archived', { workspace_id: workspaceId, user_id: userId });
      return workspace;
    } catch (error) {
      logger.error('Failed to archive workspace', { error: error.message, workspace_id: workspaceId });
      throw error;
    }
  }

  /**
   * List workspaces for user
   */
  async listWorkspaces(userId, filters = {}) {
    try {
      const query = {
        'members.user_id': userId,
        status: filters.status || 'active',
      };

      if (filters.type) {
        query.type = filters.type;
      }

      const workspaces = await Workspace.find(query)
        .sort({ created_at: -1 })
        .limit(filters.limit || 100);

      return workspaces;
    } catch (error) {
      logger.error('Failed to list workspaces', { error: error.message, user_id: userId });
      throw error;
    }
  }

  /**
   * Add member to workspace
   */
  async addMember(workspaceId, memberData, userId) {
    try {
      const workspace = await Workspace.findOne({ id: workspaceId });
      if (!workspace) {
        throw new Error('Workspace not found');
      }

      const existingMember = workspace.members.find((m) => m.user_id === memberData.user_id);
      if (existingMember) {
        throw new Error('User is already a member');
      }

      workspace.members.push(memberData);
      await workspace.save();

      await activityService.logActivity({
        actor_id: userId,
        action: 'joined',
        entity_type: 'workspace',
        entity_id: workspace.id,
        workspace_id: workspace.id,
        details: { member_id: memberData.user_id, role: memberData.role },
      });

      logger.info('Member added to workspace', {
        workspace_id: workspaceId,
        member_id: memberData.user_id,
      });
      return workspace;
    } catch (error) {
      logger.error('Failed to add member', { error: error.message, workspace_id: workspaceId });
      throw error;
    }
  }

  /**
   * Remove member from workspace
   */
  async removeMember(workspaceId, memberId, userId) {
    try {
      const workspace = await Workspace.findOne({ id: workspaceId });
      if (!workspace) {
        throw new Error('Workspace not found');
      }

      workspace.members = workspace.members.filter((m) => m.user_id !== memberId);
      await workspace.save();

      await activityService.logActivity({
        actor_id: userId,
        action: 'left',
        entity_type: 'workspace',
        entity_id: workspace.id,
        workspace_id: workspace.id,
        details: { member_id: memberId },
      });

      logger.info('Member removed from workspace', { workspace_id: workspaceId, member_id: memberId });
      return workspace;
    } catch (error) {
      logger.error('Failed to remove member', { error: error.message, workspace_id: workspaceId });
      throw error;
    }
  }

  /**
   * Check if user has access to workspace
   */
  async checkAccess(workspaceId, userId) {
    try {
      const workspace = await Workspace.findOne({
        id: workspaceId,
        'members.user_id': userId,
      });

      return !!workspace;
    } catch (error) {
      logger.error('Failed to check workspace access', {
        error: error.message,
        workspace_id: workspaceId,
      });
      return false;
    }
  }
}

module.exports = new WorkspaceService();
