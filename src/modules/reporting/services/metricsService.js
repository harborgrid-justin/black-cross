/**
 * Metrics Service
 * Business logic for KPI tracking and metric management
 */

const KPI = require('../models/KPI');
const logger = require('../utils/logger');

class MetricsService {
  /**
   * Create a new KPI
   */
  async createKPI(kpiData) {
    try {
      const kpi = new KPI(kpiData);
      await kpi.save();

      logger.info('KPI created', { kpiId: kpi.id });
      return kpi;
    } catch (error) {
      logger.error('Error creating KPI', { error: error.message });
      throw error;
    }
  }

  /**
   * Get KPI by ID
   */
  async getKPI(kpiId) {
    try {
      const kpi = await KPI.findOne({ id: kpiId });

      if (!kpi) {
        throw new Error('KPI not found');
      }

      return kpi;
    } catch (error) {
      logger.error('Error retrieving KPI', { kpiId, error: error.message });
      throw error;
    }
  }

  /**
   * Update KPI
   */
  async updateKPI(kpiId, updates) {
    try {
      const kpi = await KPI.findOneAndUpdate(
        { id: kpiId },
        { $set: updates },
        { new: true, runValidators: true },
      );

      if (!kpi) {
        throw new Error('KPI not found');
      }

      logger.info('KPI updated', { kpiId });
      return kpi;
    } catch (error) {
      logger.error('Error updating KPI', { kpiId, error: error.message });
      throw error;
    }
  }

  /**
   * Delete KPI
   */
  async deleteKPI(kpiId) {
    try {
      const result = await KPI.deleteOne({ id: kpiId });

      if (result.deletedCount === 0) {
        throw new Error('KPI not found');
      }

      logger.info('KPI deleted', { kpiId });
      return { success: true };
    } catch (error) {
      logger.error('Error deleting KPI', { kpiId, error: error.message });
      throw error;
    }
  }

  /**
   * List KPIs with filters
   */
  async listKPIs(filters = {}) {
    try {
      const {
        category,
        status,
        owner,
        page = 1,
        limit = 20,
      } = filters;

      const query = {};
      if (category) query.category = category;
      if (status) query.status = status;
      if (owner) query.owner = owner;

      const skip = (page - 1) * limit;

      const kpis = await KPI.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      const total = await KPI.countDocuments(query);

      return {
        kpis,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error listing KPIs', { error: error.message });
      throw error;
    }
  }

  /**
   * Collect metric value for a KPI
   */
  async collectMetric(kpiId, value, metadata = {}) {
    try {
      const kpi = await KPI.findOne({ id: kpiId });

      if (!kpi) {
        throw new Error('KPI not found');
      }

      // Add to history
      kpi.history.push({
        date: new Date(),
        value,
        metadata,
      });

      // Update current value
      kpi.current_value = value;
      kpi.last_collected = new Date();

      // Calculate trend
      kpi.trend = this.calculateTrend(kpi.history);

      await kpi.save();

      logger.info('Metric collected', { kpiId, value });
      return kpi;
    } catch (error) {
      logger.error('Error collecting metric', { kpiId, error: error.message });
      throw error;
    }
  }

  /**
   * Calculate trend from history
   */
  calculateTrend(history) {
    if (history.length < 2) {
      return { direction: 'stable', percentage: 0, period: 'insufficient_data' };
    }

    const recent = history.slice(-7);
    const older = history.slice(-14, -7);

    if (older.length === 0) {
      return { direction: 'stable', percentage: 0, period: 'insufficient_data' };
    }

    const recentAvg = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + item.value, 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    let direction = 'stable';
    if (change > 5) direction = 'up';
    else if (change < -5) direction = 'down';

    return {
      direction,
      percentage: Math.abs(parseFloat(change.toFixed(2))),
      period: '7d',
    };
  }

  /**
   * Get KPI history
   */
  async getKPIHistory(kpiId, filters = {}) {
    try {
      const kpi = await KPI.findOne({ id: kpiId });

      if (!kpi) {
        throw new Error('KPI not found');
      }

      const { startDate, endDate, limit = 100 } = filters;

      let { history } = kpi;

      // Filter by date range if provided
      if (startDate || endDate) {
        history = history.filter((item) => {
          const itemDate = new Date(item.date);
          if (startDate && itemDate < new Date(startDate)) return false;
          if (endDate && itemDate > new Date(endDate)) return false;
          return true;
        });
      }

      // Limit results
      history = history.slice(-limit);

      return {
        kpi: {
          id: kpi.id,
          name: kpi.name,
          category: kpi.category,
          unit: kpi.unit,
        },
        history,
        statistics: this.calculateStatistics(history),
      };
    } catch (error) {
      logger.error('Error retrieving KPI history', { kpiId, error: error.message });
      throw error;
    }
  }

  /**
   * Calculate statistics from history
   */
  calculateStatistics(history) {
    if (history.length === 0) {
      return {
        min: 0, max: 0, avg: 0, latest: 0,
      };
    }

    const values = history.map((item) => item.value);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: parseFloat((sum / values.length).toFixed(2)),
      latest: values[values.length - 1],
    };
  }

  /**
   * Get predefined security KPIs
   */
  async getPredefinedKPIs() {
    return [
      {
        name: 'Threat Detection Rate',
        description: 'Percentage of threats detected',
        category: 'threat_detection',
        metric_type: 'percentage',
        target_value: 95,
        thresholds: {
          critical: 70, warning: 80, good: 90, excellent: 95,
        },
      },
      {
        name: 'Mean Time to Detect (MTTD)',
        description: 'Average time to detect threats',
        category: 'threat_detection',
        metric_type: 'duration',
        target_value: 60,
        unit: 'minutes',
        thresholds: {
          critical: 240, warning: 120, good: 90, excellent: 60,
        },
      },
      {
        name: 'Mean Time to Respond (MTTR)',
        description: 'Average time to respond to incidents',
        category: 'incident_response',
        metric_type: 'duration',
        target_value: 120,
        unit: 'minutes',
        thresholds: {
          critical: 480, warning: 240, good: 180, excellent: 120,
        },
      },
      {
        name: 'False Positive Rate',
        description: 'Percentage of false positive alerts',
        category: 'threat_detection',
        metric_type: 'percentage',
        target_value: 5,
        thresholds: {
          critical: 30, warning: 20, good: 10, excellent: 5,
        },
      },
      {
        name: 'Security Posture Score',
        description: 'Overall security posture rating',
        category: 'security_posture',
        metric_type: 'score',
        target_value: 85,
        thresholds: {
          critical: 50, warning: 65, good: 75, excellent: 85,
        },
      },
      {
        name: 'Vulnerability Remediation Rate',
        description: 'Percentage of vulnerabilities remediated on time',
        category: 'vulnerability_management',
        metric_type: 'percentage',
        target_value: 90,
        thresholds: {
          critical: 60, warning: 75, good: 85, excellent: 90,
        },
      },
    ];
  }

  /**
   * Calculate aggregate metrics across multiple KPIs
   */
  async getAggregateMetrics(category) {
    try {
      const kpis = await KPI.find({ category, status: 'active' });

      const aggregate = {
        category,
        total_kpis: kpis.length,
        metrics: {},
      };

      kpis.forEach((kpi) => {
        aggregate.metrics[kpi.name] = {
          current: kpi.current_value,
          target: kpi.target_value,
          trend: kpi.trend,
          health: this.assessHealth(kpi),
        };
      });

      return aggregate;
    } catch (error) {
      logger.error('Error calculating aggregate metrics', { category, error: error.message });
      throw error;
    }
  }

  /**
   * Assess KPI health based on thresholds
   */
  assessHealth(kpi) {
    if (!kpi.current_value || !kpi.thresholds) return 'unknown';

    const { current_value: current, thresholds } = kpi;

    if (current >= thresholds.excellent) return 'excellent';
    if (current >= thresholds.good) return 'good';
    if (current >= thresholds.warning) return 'warning';
    return 'critical';
  }
}

module.exports = new MetricsService();
