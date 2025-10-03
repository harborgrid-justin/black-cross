/**
 * Dashboard Service
 * 
 * Handles security event dashboards and visualizations
 */

const { dashboardRepository, securityEventRepository, alertRepository } = require('../repositories');

class DashboardService {
  /**
   * Create dashboard
   */
  async createDashboard(dashboardData) {
    return await dashboardRepository.create(dashboardData);
  }

  /**
   * Get dashboard by ID
   */
  async getDashboard(id) {
    return await dashboardRepository.findById(id);
  }

  /**
   * Get all dashboards
   */
  async getDashboards(filters = {}) {
    return await dashboardRepository.findAll(filters);
  }

  /**
   * Get dashboards by owner
   */
  async getDashboardsByOwner(owner) {
    return await dashboardRepository.findByOwner(owner);
  }

  /**
   * Get shared dashboards
   */
  async getSharedDashboards(userId) {
    return await dashboardRepository.findShared(userId);
  }

  /**
   * Update dashboard
   */
  async updateDashboard(id, updates) {
    return await dashboardRepository.update(id, updates);
  }

  /**
   * Delete dashboard
   */
  async deleteDashboard(id) {
    return await dashboardRepository.delete(id);
  }

  /**
   * Add widget to dashboard
   */
  async addWidget(dashboardId, widget) {
    const dashboard = await dashboardRepository.findById(dashboardId);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    dashboard.addWidget(widget);
    return await dashboardRepository.update(dashboardId, dashboard);
  }

  /**
   * Remove widget from dashboard
   */
  async removeWidget(dashboardId, widgetId) {
    const dashboard = await dashboardRepository.findById(dashboardId);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    dashboard.removeWidget(widgetId);
    return await dashboardRepository.update(dashboardId, dashboard);
  }

  /**
   * Update widget
   */
  async updateWidget(dashboardId, widgetId, updates) {
    const dashboard = await dashboardRepository.findById(dashboardId);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    dashboard.updateWidget(widgetId, updates);
    return await dashboardRepository.update(dashboardId, dashboard);
  }

  /**
   * Share dashboard
   */
  async shareDashboard(dashboardId, userIds) {
    const dashboard = await dashboardRepository.findById(dashboardId);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    dashboard.shareWith(userIds);
    return await dashboardRepository.update(dashboardId, dashboard);
  }

  /**
   * Get dashboard data
   */
  async getDashboardData(dashboardId) {
    const dashboard = await dashboardRepository.findById(dashboardId);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    const widgetData = [];

    for (const widget of dashboard.widgets) {
      const data = await this.getWidgetData(widget, dashboard.time_range, dashboard.filters);
      widgetData.push({
        widget_id: widget.id,
        widget_type: widget.type,
        data
      });
    }

    return {
      dashboard: dashboard.toJSON(),
      widget_data: widgetData,
      generated_at: new Date()
    };
  }

  /**
   * Get widget data based on type
   */
  async getWidgetData(widget, timeRange, filters = {}) {
    const { startDate, endDate } = this.parseTimeRange(timeRange);

    switch (widget.type) {
      case 'event_count':
        return await this.getEventCount(startDate, endDate, filters);
      case 'alert_count':
        return await this.getAlertCount(startDate, endDate, filters);
      case 'severity_distribution':
        return await this.getSeverityDistribution(startDate, endDate, filters);
      case 'top_sources':
        return await this.getTopSources(startDate, endDate, filters);
      case 'event_timeline':
        return await this.getEventTimeline(startDate, endDate, filters);
      case 'alert_status':
        return await this.getAlertStatus();
      default:
        return { message: 'Unknown widget type' };
    }
  }

  /**
   * Get event count
   */
  async getEventCount(startDate, endDate, filters) {
    const events = await securityEventRepository.findByTimeRange(startDate, endDate, filters);
    return { count: events.length };
  }

  /**
   * Get alert count
   */
  async getAlertCount(startDate, endDate, filters) {
    const alerts = await alertRepository.find(filters);
    const filtered = alerts.data.filter(a => 
      new Date(a.created_at) >= startDate && new Date(a.created_at) <= endDate
    );
    return { count: filtered.length };
  }

  /**
   * Get severity distribution
   */
  async getSeverityDistribution(startDate, endDate, filters) {
    const events = await securityEventRepository.findByTimeRange(startDate, endDate, filters);
    const distribution = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };

    events.forEach(event => {
      distribution[event.severity]++;
    });

    return distribution;
  }

  /**
   * Get top sources
   */
  async getTopSources(startDate, endDate, filters, limit = 10) {
    const events = await securityEventRepository.findByTimeRange(startDate, endDate, filters);
    const sourceCounts = {};

    events.forEach(event => {
      sourceCounts[event.source] = (sourceCounts[event.source] || 0) + 1;
    });

    const sorted = Object.entries(sourceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);

    return sorted.map(([source, count]) => ({ source, count }));
  }

  /**
   * Get event timeline
   */
  async getEventTimeline(startDate, endDate, filters, interval = 'hour') {
    const events = await securityEventRepository.findByTimeRange(startDate, endDate, filters);
    const timeline = {};

    events.forEach(event => {
      const key = this.getTimelineKey(event.timestamp, interval);
      if (!timeline[key]) {
        timeline[key] = 0;
      }
      timeline[key]++;
    });

    return Object.entries(timeline)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, count]) => ({ time, count }));
  }

  /**
   * Get alert status distribution
   */
  async getAlertStatus() {
    const stats = await alertRepository.getStatistics();
    return stats.by_status;
  }

  /**
   * Parse time range to dates
   */
  parseTimeRange(timeRange) {
    const now = new Date();
    let startDate;

    const match = timeRange.match(/^(\d+)([hdwmy])$/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      
      const multipliers = {
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        w: 7 * 24 * 60 * 60 * 1000,
        m: 30 * 24 * 60 * 60 * 1000,
        y: 365 * 24 * 60 * 60 * 1000
      };

      startDate = new Date(now - value * multipliers[unit]);
    } else {
      startDate = new Date(now - 24 * 60 * 60 * 1000); // Default 24h
    }

    return { startDate, endDate: now };
  }

  /**
   * Get timeline key based on interval
   */
  getTimelineKey(timestamp, interval) {
    const date = new Date(timestamp);

    switch (interval) {
      case 'minute':
        return date.toISOString().slice(0, 16);
      case 'hour':
        return date.toISOString().slice(0, 13);
      case 'day':
        return date.toISOString().slice(0, 10);
      case 'week':
        const weekNumber = this.getWeekNumber(date);
        return `${date.getFullYear()}-W${weekNumber}`;
      case 'month':
        return date.toISOString().slice(0, 7);
      default:
        return date.toISOString().slice(0, 13);
    }
  }

  /**
   * Get ISO week number
   */
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /**
   * Get predefined dashboard templates
   */
  getTemplates() {
    return [
      {
        id: 'security-overview',
        name: 'Security Overview',
        description: 'High-level security metrics and trends',
        widgets: [
          { type: 'event_count', title: 'Total Events', size: 'small' },
          { type: 'alert_count', title: 'Active Alerts', size: 'small' },
          { type: 'severity_distribution', title: 'Severity Distribution', size: 'medium' },
          { type: 'event_timeline', title: 'Event Timeline', size: 'large' }
        ]
      },
      {
        id: 'alert-management',
        name: 'Alert Management',
        description: 'Alert status and management dashboard',
        widgets: [
          { type: 'alert_status', title: 'Alert Status', size: 'medium' },
          { type: 'alert_count', title: 'Total Alerts', size: 'small' },
          { type: 'severity_distribution', title: 'Alert Severity', size: 'medium' }
        ]
      },
      {
        id: 'threat-analysis',
        name: 'Threat Analysis',
        description: 'Detailed threat analysis and investigation',
        widgets: [
          { type: 'top_sources', title: 'Top Event Sources', size: 'medium' },
          { type: 'event_timeline', title: 'Event Timeline', size: 'large' },
          { type: 'severity_distribution', title: 'Threat Severity', size: 'medium' }
        ]
      }
    ];
  }
}

module.exports = new DashboardService();
