/**
 * Alert Repository
 * 
 * Handles data persistence for alerts
 */

const Alert = require('../models/Alert');

class AlertRepository {
  constructor() {
    this.alerts = new Map();
  }

  /**
   * Create new alert
   */
  async create(alertData) {
    const alert = new Alert(alertData);
    this.alerts.set(alert.id, alert);
    return alert;
  }

  /**
   * Find alert by ID
   */
  async findById(id) {
    return this.alerts.get(id) || null;
  }

  /**
   * Find alerts with filters
   */
  async find(filters = {}) {
    let alerts = Array.from(this.alerts.values());

    if (filters.status) {
      alerts = alerts.filter(a => a.status === filters.status);
    }

    if (filters.severity) {
      alerts = alerts.filter(a => a.severity === filters.severity);
    }

    if (filters.priority) {
      alerts = alerts.filter(a => a.priority === filters.priority);
    }

    if (filters.assigned_to) {
      alerts = alerts.filter(a => a.assigned_to === filters.assigned_to);
    }

    if (filters.suppressed !== undefined) {
      alerts = alerts.filter(a => a.suppressed === filters.suppressed);
    }

    // Sort by created_at descending by default
    alerts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedAlerts = alerts.slice(startIndex, endIndex);

    return {
      data: paginatedAlerts,
      pagination: {
        page,
        limit,
        total: alerts.length,
        pages: Math.ceil(alerts.length / limit)
      }
    };
  }

  /**
   * Update alert
   */
  async update(id, updates) {
    const alert = this.alerts.get(id);
    if (!alert) return null;

    Object.assign(alert, updates);
    alert.updated_at = new Date();
    this.alerts.set(id, alert);
    return alert;
  }

  /**
   * Delete alert
   */
  async delete(id) {
    return this.alerts.delete(id);
  }

  /**
   * Get alert statistics
   */
  async getStatistics() {
    const alerts = Array.from(this.alerts.values());
    
    return {
      total: alerts.length,
      by_status: {
        open: alerts.filter(a => a.status === 'open').length,
        acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
        investigating: alerts.filter(a => a.status === 'investigating').length,
        resolved: alerts.filter(a => a.status === 'resolved').length,
        false_positive: alerts.filter(a => a.status === 'false_positive').length
      },
      by_severity: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length,
        info: alerts.filter(a => a.severity === 'info').length
      },
      suppressed: alerts.filter(a => a.suppressed).length,
      escalated: alerts.filter(a => a.escalated).length
    };
  }

  /**
   * Clear all alerts (for testing)
   */
  async clear() {
    this.alerts.clear();
  }
}

module.exports = new AlertRepository();
