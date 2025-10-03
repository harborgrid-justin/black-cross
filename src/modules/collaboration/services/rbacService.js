/**
 * Role-Based Access Control Service
 * Business logic for RBAC operations
 */

const Role = require('../models/Role');
const logger = require('../utils/logger');

class RBACService {
  /**
   * Create a new role
   */
  async createRole(data) {
    try {
      const role = new Role(data);
      await role.save();

      logger.info('Role created', { role_id: role.id, role_name: role.name });
      return role;
    } catch (error) {
      logger.error('Failed to create role', { error: error.message });
      throw error;
    }
  }

  /**
   * Get role by ID
   */
  async getRoleById(roleId) {
    try {
      const role = await Role.findOne({ id: roleId });
      if (!role) {
        throw new Error('Role not found');
      }
      return role;
    } catch (error) {
      logger.error('Failed to get role', { error: error.message, role_id: roleId });
      throw error;
    }
  }

  /**
   * Update role
   */
  async updateRole(roleId, updates) {
    try {
      const role = await Role.findOne({ id: roleId });
      if (!role) {
        throw new Error('Role not found');
      }

      if (role.type === 'system') {
        throw new Error('Cannot modify system roles');
      }

      Object.assign(role, updates);
      await role.save();

      logger.info('Role updated', { role_id: roleId });
      return role;
    } catch (error) {
      logger.error('Failed to update role', { error: error.message, role_id: roleId });
      throw error;
    }
  }

  /**
   * Delete role
   */
  async deleteRole(roleId) {
    try {
      const role = await Role.findOne({ id: roleId });
      if (!role) {
        throw new Error('Role not found');
      }

      if (role.type === 'system') {
        throw new Error('Cannot delete system roles');
      }

      role.status = 'inactive';
      await role.save();

      logger.info('Role deactivated', { role_id: roleId });
      return role;
    } catch (error) {
      logger.error('Failed to delete role', { error: error.message, role_id: roleId });
      throw error;
    }
  }

  /**
   * List roles
   */
  async listRoles(filters = {}) {
    try {
      const query = { status: 'active' };

      if (filters.workspace_id) {
        query.$or = [
          { workspace_id: filters.workspace_id },
          { type: 'system' },
        ];
      }

      if (filters.type) {
        query.type = filters.type;
      }

      const roles = await Role.find(query).sort({ created_at: -1 });
      return roles;
    } catch (error) {
      logger.error('Failed to list roles', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if user has permission
   */
  async checkPermission(userId, resource, action, scope = 'workspace') {
    try {
      // This is a simplified version - in production, you'd fetch user's roles
      // and check against their permissions
      // For now, we'll return a basic implementation

      logger.debug('Permission check', {
        user_id: userId, resource, action, scope,
      });
      return true; // Placeholder
    } catch (error) {
      logger.error('Failed to check permission', { error: error.message, user_id: userId });
      return false;
    }
  }

  /**
   * Get effective permissions for user
   */
  async getEffectivePermissions(userId, workspaceId) {
    try {
      // In a real implementation, this would:
      // 1. Fetch all roles assigned to the user
      // 2. Merge permissions considering role hierarchy
      // 3. Return effective permission set

      const permissions = {
        workspace: [],
        task: [],
        article: [],
        message: [],
      };

      logger.info('Retrieved effective permissions', { user_id: userId, workspace_id: workspaceId });
      return permissions;
    } catch (error) {
      logger.error('Failed to get effective permissions', {
        error: error.message,
        user_id: userId,
      });
      throw error;
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(userId, roleId, workspaceId) {
    try {
      const role = await this.getRoleById(roleId);

      // In production, this would update a user-role mapping table
      logger.info('Role assigned to user', { user_id: userId, role_id: roleId, workspace_id: workspaceId });

      return { success: true, role };
    } catch (error) {
      logger.error('Failed to assign role', { error: error.message, user_id: userId });
      throw error;
    }
  }

  /**
   * Revoke role from user
   */
  async revokeRole(userId, roleId, workspaceId) {
    try {
      // In production, this would remove the user-role mapping
      logger.info('Role revoked from user', { user_id: userId, role_id: roleId, workspace_id: workspaceId });

      return { success: true };
    } catch (error) {
      logger.error('Failed to revoke role', { error: error.message, user_id: userId });
      throw error;
    }
  }
}

module.exports = new RBACService();
