/**
 * Workspace Service
 * Handles workspace creation, management, and analytics
 */

const Workspace = require('../models/Workspace');
const logger = require('../utils/logger');

class WorkspaceService {
  /**
   * Create a new workspace
   * @param {Object} workspaceData - Workspace data
   * @param {string} userId - User creating the workspace
   * @returns {Promise<Object>} Created workspace
   */
  async createWorkspace(workspaceData, userId) {
    try {
      logger.info('Creating new workspace', { name: workspaceData.name, userId });

      const workspace = new Workspace({
        ...workspaceData,
        owner: workspaceData.owner || userId,
        members: [
          {
            user_id: workspaceData.owner || userId,
            role: 'owner',
            joined_at: new Date(),
          },
          ...(workspaceData.members || []),
        ],
        analytics: {
          member_count: 1 + (workspaceData.members?.length || 0),
          task_count: 0,
          message_count: 0,
          last_activity_at: new Date(),
        },
      });

      await workspace.save();
      logger.info('Workspace created successfully', { id: workspace.id });

      return workspace;
    } catch (error) {
      logger.error('Error creating workspace', { error: error.message });
      throw error;
    }
  }

  /**
   * Get workspace by ID
   * @param {string} workspaceId - Workspace ID
   * @returns {Promise<Object>} Workspace
   */
  async getWorkspace(workspaceId) {
    try {
      const workspace = await Workspace.findOne({ id: workspaceId });

      if (!workspace) {
        throw new Error('Workspace not found');
      }

      return workspace;
    } catch (error) {
      logger.error('Error getting workspace', { error: error.message });
      throw error;
    }
  }

  /**
   * Update workspace
   * @param {string} workspaceId - Workspace ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated workspace
   */
  async updateWorkspace(workspaceId, updates) {
    try {
      logger.info('Updating workspace', { workspaceId });

      const workspace = await Workspace.findOne({ id: workspaceId });

      if (!workspace) {
        throw new Error('Workspace not found');
      }

      Object.assign(workspace, updates);
      workspace.analytics.last_activity_at = new Date();

      await workspace.save();
      logger.info('Workspace updated successfully', { id: workspace.id });

      return workspace;
    } catch (error) {
      logger.error('Error updating workspace', { error: error.message });
      throw error;
    }
  }

  /**
   * Add member to workspace
   * @param {string} workspaceId - Workspace ID
   * @param {Object} memberData - Member data
   * @returns {Promise<Object>} Updated workspace
   */
  async addMember(workspaceId, memberData) {
    try {
      logger.info('Adding member to workspace', { workspaceId, userId: memberData.user_id });

      const workspace = await Workspace.findOne({ id: workspaceId });

      if (!workspace) {
        throw new Error('Workspace not found');
      }

      // Check if user is already a member
      const existingMember = workspace.members.find((m) => m.user_id === memberData.user_id);
      if (existingMember) {
        throw new Error('User is already a member of this workspace');
      }

      workspace.members.push({
        user_id: memberData.user_id,
        role: memberData.role || 'member',
        joined_at: new Date(),
      });

      workspace.analytics.member_count = workspace.members.length;
      workspace.analytics.last_activity_at = new Date();

      await workspace.save();
      logger.info('Member added successfully', { workspaceId, userId: memberData.user_id });

      return workspace;
    } catch (error) {
      logger.error('Error adding member', { error: error.message });
      throw error;
    }
  }

  /**
   * Remove member from workspace
   * @param {string} workspaceId - Workspace ID
   * @param {string} userId - User ID to remove
   * @returns {Promise<Object>} Updated workspace
   */
  async removeMember(workspaceId, userId) {
    try {
      logger.info('Removing member from workspace', { workspaceId, userId });

      const workspace = await Workspace.findOne({ id: workspaceId });

      if (!workspace) {
        throw new Error('Workspace not found');
      }

      workspace.members = workspace.members.filter((m) => m.user_id !== userId);
      workspace.analytics.member_count = workspace.members.length;
      workspace.analytics.last_activity_at = new Date();

      await workspace.save();
      logger.info('Member removed successfully', { workspaceId, userId });

      return workspace;
    } catch (error) {
      logger.error('Error removing member', { error: error.message });
      throw error;
    }
  }

  /**
   * List workspaces for a user
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Workspaces
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
        .sort({ 'analytics.last_activity_at': -1 })
        .limit(filters.limit || 100);

      return workspaces;
    } catch (error) {
      logger.error('Error listing workspaces', { error: error.message });
      throw error;
    }
  }

  /**
   * Get workspace analytics
   * @param {string} workspaceId - Workspace ID
   * @returns {Promise<Object>} Analytics data
   */
  async getAnalytics(workspaceId) {
    try {
      const workspace = await Workspace.findOne({ id: workspaceId });

      if (!workspace) {
        throw new Error('Workspace not found');
      }

      return {
        member_count: workspace.analytics.member_count,
        task_count: workspace.analytics.task_count,
        message_count: workspace.analytics.message_count,
        last_activity_at: workspace.analytics.last_activity_at,
        created_at: workspace.created_at,
        age_days: Math.floor((Date.now() - workspace.created_at) / (1000 * 60 * 60 * 24)),
      };
    } catch (error) {
      logger.error('Error getting analytics', { error: error.message });
      throw error;
    }
  }

  /**
   * Archive workspace
   * @param {string} workspaceId - Workspace ID
   * @returns {Promise<Object>} Archived workspace
   */
  async archiveWorkspace(workspaceId) {
    try {
      logger.info('Archiving workspace', { workspaceId });

      const workspace = await Workspace.findOne({ id: workspaceId });

      if (!workspace) {
        throw new Error('Workspace not found');
      }

      workspace.status = 'archived';
      await workspace.save();

      logger.info('Workspace archived successfully', { workspaceId });
      return workspace;
    } catch (error) {
      logger.error('Error archiving workspace', { error: error.message });
      throw error;
    }
  }
}

module.exports = new WorkspaceService();
