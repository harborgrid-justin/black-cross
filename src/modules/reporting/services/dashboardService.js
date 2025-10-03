/**
 * Dashboard Service
 * Business logic for dashboard management
 */

const Dashboard = require('../models/Dashboard');
const logger = require('../utils/logger');

class DashboardService {
  /**
   * Create a new dashboard
   */
  async createDashboard(dashboardData) {
    try {
      const dashboard = new Dashboard(dashboardData);
      await dashboard.save();

      logger.info('Dashboard created', { dashboardId: dashboard.id });
      return dashboard;
    } catch (error) {
      logger.error('Error creating dashboard', { error: error.message });
      throw error;
    }
  }

  /**
   * Get dashboard by ID
   */
  async getDashboard(dashboardId) {
    try {
      const dashboard = await Dashboard.findOne({ id: dashboardId });

      if (!dashboard) {
        throw new Error('Dashboard not found');
      }

      return dashboard;
    } catch (error) {
      logger.error('Error retrieving dashboard', { dashboardId, error: error.message });
      throw error;
    }
  }

  /**
   * Get executive dashboard with summary data
   */
  async getExecutiveDashboard(userId) {
    try {
      // Get or create executive dashboard
      let dashboard = await Dashboard.findOne({
        type: 'executive',
        owner: userId,
      });

      if (!dashboard) {
        // Create default executive dashboard
        dashboard = await this.createDashboard({
          name: 'Executive Dashboard',
          description: 'High-level security metrics and KPIs',
          type: 'executive',
          owner: userId,
          widgets: this.getDefaultExecutiveWidgets(),
          layout: {
            columns: 12,
            rows: 8,
            responsive: true,
          },
        });
      }

      // Populate dashboard with real-time data
      const dashboardData = await this.populateDashboardData(dashboard);

      return dashboardData;
    } catch (error) {
      logger.error('Error retrieving executive dashboard', { error: error.message });
      throw error;
    }
  }

  /**
   * Get default widgets for executive dashboard
   */
  getDefaultExecutiveWidgets() {
    return [
      {
        id: 'widget-1',
        type: 'kpi_card',
        title: 'Security Posture Score',
        position: { x: 0, y: 0, width: 3, height: 2 },
        config: {
          metric: 'security_posture_score',
          format: 'percentage',
        },
        data_source: {
          type: 'kpi',
          query: { category: 'security_posture' },
          refresh_interval: 300000,
        },
      },
      {
        id: 'widget-2',
        type: 'kpi_card',
        title: 'Active Threats',
        position: { x: 3, y: 0, width: 3, height: 2 },
        config: {
          metric: 'active_threats',
          format: 'number',
        },
        data_source: {
          type: 'threat_count',
          query: { status: 'active' },
          refresh_interval: 300000,
        },
      },
      {
        id: 'widget-3',
        type: 'kpi_card',
        title: 'Mean Time to Respond',
        position: { x: 6, y: 0, width: 3, height: 2 },
        config: {
          metric: 'mttr',
          format: 'duration',
        },
        data_source: {
          type: 'kpi',
          query: { category: 'incident_response' },
          refresh_interval: 300000,
        },
      },
      {
        id: 'widget-4',
        type: 'kpi_card',
        title: 'Open Incidents',
        position: { x: 9, y: 0, width: 3, height: 2 },
        config: {
          metric: 'open_incidents',
          format: 'number',
        },
        data_source: {
          type: 'incident_count',
          query: { status: 'open' },
          refresh_interval: 300000,
        },
      },
      {
        id: 'widget-5',
        type: 'line_chart',
        title: 'Threat Trend (30 days)',
        position: { x: 0, y: 2, width: 6, height: 3 },
        config: {
          xAxis: 'date',
          yAxis: 'count',
        },
        data_source: {
          type: 'threat_trends',
          query: { period: '30d' },
          refresh_interval: 600000,
        },
      },
      {
        id: 'widget-6',
        type: 'pie_chart',
        title: 'Threats by Severity',
        position: { x: 6, y: 2, width: 6, height: 3 },
        config: {
          labels: ['Critical', 'High', 'Medium', 'Low'],
        },
        data_source: {
          type: 'threat_distribution',
          query: { groupBy: 'severity' },
          refresh_interval: 600000,
        },
      },
      {
        id: 'widget-7',
        type: 'bar_chart',
        title: 'Top 10 Vulnerabilities',
        position: { x: 0, y: 5, width: 12, height: 3 },
        config: {
          orientation: 'horizontal',
        },
        data_source: {
          type: 'vulnerability_ranking',
          query: { limit: 10 },
          refresh_interval: 600000,
        },
      },
    ];
  }

  /**
   * Populate dashboard with actual data
   */
  async populateDashboardData(dashboard) {
    const populatedWidgets = await Promise.all(
      dashboard.widgets.map(async (widget) => {
        const widgetData = await this.getWidgetData(widget);
        return {
          ...widget.toObject(),
          data: widgetData,
        };
      }),
    );

    return {
      ...dashboard.toObject(),
      widgets: populatedWidgets,
    };
  }

  /**
   * Get data for a specific widget
   */
  async getWidgetData(widget) {
    // Simulate fetching real data based on widget type
    const mockData = {
      kpi_card: {
        value: Math.floor(Math.random() * 100),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        change: parseFloat((Math.random() * 20).toFixed(2)),
      },
      line_chart: {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        datasets: [{
          label: 'Threats',
          data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100)),
        }],
      },
      pie_chart: {
        labels: ['Critical', 'High', 'Medium', 'Low'],
        datasets: [{
          data: [15, 35, 40, 10],
          backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#28a745'],
        }],
      },
      bar_chart: {
        labels: Array.from({ length: 10 }, (_, i) => `Vuln ${i + 1}`),
        datasets: [{
          label: 'Severity',
          data: Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)),
        }],
      },
    };

    return mockData[widget.type] || {};
  }

  /**
   * Update dashboard
   */
  async updateDashboard(dashboardId, updates) {
    try {
      const dashboard = await Dashboard.findOneAndUpdate(
        { id: dashboardId },
        { $set: updates },
        { new: true, runValidators: true },
      );

      if (!dashboard) {
        throw new Error('Dashboard not found');
      }

      logger.info('Dashboard updated', { dashboardId });
      return dashboard;
    } catch (error) {
      logger.error('Error updating dashboard', { dashboardId, error: error.message });
      throw error;
    }
  }

  /**
   * Add widget to dashboard
   */
  async addWidget(dashboardId, widgetData) {
    try {
      const dashboard = await Dashboard.findOne({ id: dashboardId });

      if (!dashboard) {
        throw new Error('Dashboard not found');
      }

      dashboard.widgets.push(widgetData);
      await dashboard.save();

      logger.info('Widget added to dashboard', { dashboardId, widgetId: widgetData.id });
      return dashboard;
    } catch (error) {
      logger.error('Error adding widget', { dashboardId, error: error.message });
      throw error;
    }
  }

  /**
   * Delete dashboard
   */
  async deleteDashboard(dashboardId) {
    try {
      const result = await Dashboard.deleteOne({ id: dashboardId });

      if (result.deletedCount === 0) {
        throw new Error('Dashboard not found');
      }

      logger.info('Dashboard deleted', { dashboardId });
      return { success: true };
    } catch (error) {
      logger.error('Error deleting dashboard', { dashboardId, error: error.message });
      throw error;
    }
  }

  /**
   * List dashboards with filters
   */
  async listDashboards(filters = {}) {
    try {
      const {
        type,
        owner,
        status,
        page = 1,
        limit = 20,
      } = filters;

      const query = {};
      if (type) query.type = type;
      if (owner) query.owner = owner;
      if (status) query.status = status;

      const skip = (page - 1) * limit;

      const dashboards = await Dashboard.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Dashboard.countDocuments(query);

      return {
        dashboards,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error listing dashboards', { error: error.message });
      throw error;
    }
  }
}

module.exports = new DashboardService();
