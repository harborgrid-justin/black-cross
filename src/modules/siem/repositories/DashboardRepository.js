/**
 * Dashboard Repository
 * 
 * Handles data persistence for dashboards
 */

const Dashboard = require('../models/Dashboard');

class DashboardRepository {
  constructor() {
    this.dashboards = new Map();
  }

  /**
   * Create new dashboard
   */
  async create(dashboardData) {
    const dashboard = new Dashboard(dashboardData);
    this.dashboards.set(dashboard.id, dashboard);
    return dashboard;
  }

  /**
   * Find dashboard by ID
   */
  async findById(id) {
    return this.dashboards.get(id) || null;
  }

  /**
   * Find all dashboards
   */
  async findAll(filters = {}) {
    let dashboards = Array.from(this.dashboards.values());

    if (filters.type) {
      dashboards = dashboards.filter(d => d.type === filters.type);
    }

    if (filters.owner) {
      dashboards = dashboards.filter(d => d.owner === filters.owner);
    }

    if (filters.shared !== undefined) {
      dashboards = dashboards.filter(d => d.shared === filters.shared);
    }

    return dashboards;
  }

  /**
   * Find dashboards by owner
   */
  async findByOwner(owner) {
    return Array.from(this.dashboards.values()).filter(d => d.owner === owner);
  }

  /**
   * Find shared dashboards
   */
  async findShared(userId) {
    return Array.from(this.dashboards.values()).filter(d => 
      d.shared && (d.shared_with.includes(userId) || d.shared_with.length === 0)
    );
  }

  /**
   * Update dashboard
   */
  async update(id, updates) {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) return null;

    Object.assign(dashboard, updates);
    dashboard.updated_at = new Date();
    this.dashboards.set(id, dashboard);
    return dashboard;
  }

  /**
   * Delete dashboard
   */
  async delete(id) {
    return this.dashboards.delete(id);
  }

  /**
   * Clear all dashboards (for testing)
   */
  async clear() {
    this.dashboards.clear();
  }
}

module.exports = new DashboardRepository();
