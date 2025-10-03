/**
 * Role Controller
 * HTTP handlers for RBAC operations
 */

const rbacService = require('../services/rbacService');
const logger = require('../utils/logger');

class RoleController {
  async createRole(req, res) {
    try {
      const role = await rbacService.createRole(req.body);
      res.status(201).json({ success: true, data: role });
    } catch (error) {
      logger.error('Create role failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getRole(req, res) {
    try {
      const role = await rbacService.getRoleById(req.params.id);
      res.json({ success: true, data: role });
    } catch (error) {
      logger.error('Get role failed', { error: error.message });
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async updateRole(req, res) {
    try {
      const role = await rbacService.updateRole(req.params.id, req.body);
      res.json({ success: true, data: role });
    } catch (error) {
      logger.error('Update role failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteRole(req, res) {
    try {
      const role = await rbacService.deleteRole(req.params.id);
      res.json({ success: true, data: role, message: 'Role deactivated' });
    } catch (error) {
      logger.error('Delete role failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async listRoles(req, res) {
    try {
      const filters = {
        workspace_id: req.query.workspace_id,
        type: req.query.type,
      };
      const roles = await rbacService.listRoles(filters);
      res.json({ success: true, data: roles, count: roles.length });
    } catch (error) {
      logger.error('List roles failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async assignRole(req, res) {
    try {
      const result = await rbacService.assignRole(
        req.params.userId,
        req.body.role_id,
        req.body.workspace_id,
      );
      res.json({ success: true, data: result, message: 'Role assigned' });
    } catch (error) {
      logger.error('Assign role failed', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new RoleController();
