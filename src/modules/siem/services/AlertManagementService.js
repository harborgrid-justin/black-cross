/**
 * Alert Management Service
 * 
 * Handles alert lifecycle, tuning, and management
 */

const { alertRepository } = require('../repositories');

class AlertManagementService {
  /**
   * Get all alerts with filters
   */
  async getAlerts(filters = {}) {
    return await alertRepository.find(filters);
  }

  /**
   * Get alert by ID
   */
  async getAlert(id) {
    return await alertRepository.findById(id);
  }

  /**
   * Create alert
   */
  async createAlert(alertData) {
    return await alertRepository.create(alertData);
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(id, userId) {
    const alert = await alertRepository.findById(id);
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.acknowledge(userId);
    return await alertRepository.update(id, alert);
  }

  /**
   * Assign alert to user
   */
  async assignAlert(id, userId) {
    const alert = await alertRepository.findById(id);
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.assign(userId);
    return await alertRepository.update(id, alert);
  }

  /**
   * Update alert status
   */
  async updateAlertStatus(id, status, userId, notes = '') {
    const alert = await alertRepository.findById(id);
    if (!alert) {
      throw new Error('Alert not found');
    }

    if (status === 'resolved') {
      alert.resolve(userId, notes);
    } else if (status === 'false_positive') {
      alert.markAsFalsePositive(userId, notes);
    } else {
      alert.status = status;
      alert.updated_at = new Date();
    }

    return await alertRepository.update(id, alert);
  }

  /**
   * Suppress alert
   */
  async suppressAlert(id, reason) {
    const alert = await alertRepository.findById(id);
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.suppress(reason);
    return await alertRepository.update(id, alert);
  }

  /**
   * Escalate alert
   */
  async escalateAlert(id) {
    const alert = await alertRepository.findById(id);
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.escalate();
    return await alertRepository.update(id, alert);
  }

  /**
   * Add comment to alert
   */
  async addComment(id, userId, comment) {
    const alert = await alertRepository.findById(id);
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.addComment(userId, comment);
    return await alertRepository.update(id, alert);
  }

  /**
   * Record action taken on alert
   */
  async recordAction(id, action, userId) {
    const alert = await alertRepository.findById(id);
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.recordAction(action, userId);
    return await alertRepository.update(id, alert);
  }

  /**
   * Bulk update alerts
   */
  async bulkUpdate(alertIds, updates) {
    const results = [];

    for (const id of alertIds) {
      try {
        const alert = await alertRepository.findById(id);
        if (alert) {
          Object.assign(alert, updates);
          alert.updated_at = new Date();
          await alertRepository.update(id, alert);
          results.push({ id, success: true });
        } else {
          results.push({ id, success: false, error: 'Alert not found' });
        }
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Apply deduplication to alerts
   */
  async deduplicateAlerts(timeWindow = 3600) {
    const alerts = await alertRepository.find({ status: 'open' });
    const deduplicated = [];
    const duplicates = [];
    const seen = new Map();

    for (const alert of alerts.data) {
      const key = `${alert.rule_id}|${alert.severity}|${JSON.stringify(alert.event_ids.sort())}`;
      const existing = seen.get(key);

      if (existing) {
        const timeDiff = (alert.created_at - existing.created_at) / 1000;
        if (timeDiff <= timeWindow) {
          duplicates.push(alert);
          // Suppress duplicate
          alert.suppress('Duplicate alert within time window');
          await alertRepository.update(alert.id, alert);
          continue;
        }
      }

      seen.set(key, alert);
      deduplicated.push(alert);
    }

    return {
      deduplicated_count: deduplicated.length,
      duplicate_count: duplicates.length,
      duplicates: duplicates.map(a => a.id)
    };
  }

  /**
   * Get alert statistics
   */
  async getStatistics() {
    return await alertRepository.getStatistics();
  }

  /**
   * Get alert trends
   */
  async getTrends(period = '7d') {
    const alerts = await alertRepository.find({});
    const now = new Date();
    const periodMs = this.parsePeriod(period);
    const startDate = new Date(now - periodMs);

    const trendData = alerts.data.filter(a => 
      new Date(a.created_at) >= startDate
    );

    // Group by day
    const byDay = {};
    trendData.forEach(alert => {
      const day = new Date(alert.created_at).toISOString().split('T')[0];
      if (!byDay[day]) {
        byDay[day] = { total: 0, by_severity: {} };
      }
      byDay[day].total++;
      byDay[day].by_severity[alert.severity] = (byDay[day].by_severity[alert.severity] || 0) + 1;
    });

    return {
      period,
      start_date: startDate,
      end_date: now,
      total_alerts: trendData.length,
      trends: byDay
    };
  }

  /**
   * Parse period string to milliseconds
   */
  parsePeriod(period) {
    const match = period.match(/^(\d+)([hdwmy])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers = {
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      w: 7 * 24 * 60 * 60 * 1000,
      m: 30 * 24 * 60 * 60 * 1000,
      y: 365 * 24 * 60 * 60 * 1000
    };

    return value * multipliers[unit];
  }

  /**
   * Get mean time to acknowledge (MTTA)
   */
  async getMTTA() {
    const alerts = await alertRepository.find({});
    const acknowledgedAlerts = alerts.data.filter(a => a.acknowledged_at);

    if (acknowledgedAlerts.length === 0) return 0;

    const totalTime = acknowledgedAlerts.reduce((sum, alert) => {
      const time = (new Date(alert.acknowledged_at) - new Date(alert.created_at)) / 1000;
      return sum + time;
    }, 0);

    return (totalTime / acknowledgedAlerts.length).toFixed(2);
  }

  /**
   * Get mean time to resolve (MTTR)
   */
  async getMTTR() {
    const alerts = await alertRepository.find({});
    const resolvedAlerts = alerts.data.filter(a => a.resolved_at);

    if (resolvedAlerts.length === 0) return 0;

    const totalTime = resolvedAlerts.reduce((sum, alert) => {
      const time = (new Date(alert.resolved_at) - new Date(alert.created_at)) / 1000;
      return sum + time;
    }, 0);

    return (totalTime / resolvedAlerts.length).toFixed(2);
  }
}

module.exports = new AlertManagementService();
