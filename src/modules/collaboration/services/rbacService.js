/**
 * RBAC Service
 * Handles role-based access control and permissions
 */

const Role = require('../models/Role');
const logger = require('../utils/logger');

class RBACService {
  /**
   * Create a new role
   * @param {Object} roleData - Role data
   * @returns {Promise<Object>} Created role
   */
  async createRole(roleData) {
    try {
      logger.info('Creating new role', { name: roleData.name });

      const role = new Role(roleData);
      await role.save();

      logger.info('Role created successfully', { id: role.id });
      return role;
    } catch (error) {
      logger.error('Error creating role', { error: error.message });
      throw error;
    }
  }

  /**
   * Get role by ID
   * @param {string} roleId - Role ID
   * @returns {Promise<Object>} Role
   */
  async getRole(roleId) {
    try {
      const role = await Role.findOne({ id: roleId, is_active: true });

      if (!role) {
        throw new Error('Role not found');
      }

      return role;
    } catch (error) {
      logger.error('Error getting role', { error: error.message });
      throw error;
    }
  }

  /**
   * List roles
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Roles
   */
  async listRoles(filters = {}) {
    try {
      const query = { is_active: true };

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.workspace_id) {
        query.$or = [
          { workspace_id: filters.workspace_id },
          { type: 'system' },
        ];
      }

      const roles = await Role.find(query).sort({ hierarchy_level: 1, name: 1 });
      return roles;
    } catch (error) {
      logger.error('Error listing roles', { error: error.message });
      throw error;
    }
  }

  /**
   * Update role
   * @param {string} roleId - Role ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated role
   */
  async updateRole(roleId, updates) {
    try {
      logger.info('Updating role', { roleId });

      const role = await Role.findOne({ id: roleId });

      if (!role) {
        throw new Error('Role not found');
      }

      if (role.type === 'system') {
        throw new Error('Cannot modify system roles');
      }

      Object.assign(role, updates);
      await role.save();

      logger.info('Role updated successfully', { id: role.id });
      return role;
    } catch (error) {
      logger.error('Error updating role', { error: error.message });
      throw error;
    }
  }

  /**
   * Delete role
   * @param {string} roleId - Role ID
   * @returns {Promise<Object>} Result
   */
  async deleteRole(roleId) {
    try {
      logger.info('Deleting role', { roleId });

      const role = await Role.findOne({ id: roleId });

      if (!role) {
        throw new Error('Role not found');
      }

      if (role.type === 'system') {
        throw new Error('Cannot delete system roles');
      }

      role.is_active = false;
      await role.save();

      logger.info('Role deleted successfully', { roleId });
      return { success: true, message: 'Role deleted' };
    } catch (error) {
      logger.error('Error deleting role', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if user has permission
   * @param {string} userId - User ID
   * @param {string} resource - Resource type
   * @param {string} action - Action to check
   * @returns {Promise<boolean>} Has permission
   */
  async checkPermission(userId, resource, action) {
    try {
      // In a real implementation, this would fetch user's roles and check permissions
      // For now, we'll implement a simple check

      logger.info('Checking permission', { userId, resource, action });

      // This is a simplified implementation
      // In production, you would:
      // 1. Get all roles assigned to the user
      // 2. Check each role's permissions
      // 3. Consider role hierarchy and inheritance
      // 4. Evaluate conditions if present

      return true; // Simplified for now
    } catch (error) {
      logger.error('Error checking permission', { error: error.message });
      return false;
    }
  }

  /**
   * Create predefined system roles
   * @param {string} workspaceId - Workspace ID (optional)
   * @returns {Promise<Array>} Created roles
   */
  async createSystemRoles(workspaceId = null) {
    try {
      logger.info('Creating system roles', { workspaceId });

      const systemRoles = [
        {
          name: 'Admin',
          description: 'Full administrative access',
          type: 'system',
          hierarchy_level: 100,
          workspace_id: workspaceId,
          permissions: [
            {
              resource: 'all',
              actions: ['create', 'read', 'update', 'delete', 'execute', 'share', 'admin'],
            },
          ],
        },
        {
          name: 'Member',
          description: 'Standard member access',
          type: 'system',
          hierarchy_level: 50,
          workspace_id: workspaceId,
          permissions: [
            {
              resource: 'task',
              actions: ['create', 'read', 'update'],
            },
            {
              resource: 'message',
              actions: ['create', 'read'],
            },
            {
              resource: 'kb_article',
              actions: ['read'],
            },
          ],
        },
        {
          name: 'Viewer',
          description: 'Read-only access',
          type: 'system',
          hierarchy_level: 10,
          workspace_id: workspaceId,
          permissions: [
            {
              resource: 'all',
              actions: ['read'],
            },
          ],
        },
      ];

      const rolePromises = systemRoles.map(async (roleData) => {
        const existingRole = await Role.findOne({
          name: roleData.name,
          workspace_id: workspaceId,
          type: 'system',
        });

        if (!existingRole) {
          const role = new Role(roleData);
          await role.save();
          return role;
        }
        return null;
      });

      const results = await Promise.all(rolePromises);
      const roles = results.filter((role) => role !== null);

      logger.info('System roles created', { count: roles.length });
      return roles;
    } catch (error) {
      logger.error('Error creating system roles', { error: error.message });
      throw error;
    }
  }
}

module.exports = new RBACService();
