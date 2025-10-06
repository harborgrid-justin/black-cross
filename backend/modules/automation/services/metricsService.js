/**
 * Response Effectiveness Metrics Service
 * Measures playbook effectiveness (Sub-Feature 15.7)
 */

const Playbook = require('../models/Playbook');
const PlaybookExecution = require('../models/PlaybookExecution');
const logger = require('../utils/logger');

class MetricsService {
  /**
   * Get playbook metrics
   * @param {string} playbookId - Playbook ID
   * @param {Object} options - Options for metrics calculation
   * @returns {Promise<Object>} Playbook metrics
   */
  async getPlaybookMetrics(playbookId, options = {}) {
    try {
      logger.info('Calculating playbook metrics', { playbook_id: playbookId });

      const playbook = await Playbook.findOne({ id: playbookId });

      if (!playbook) {
        throw new Error('Playbook not found');
      }

      const timeRange = options.days || 30;
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - timeRange);

      const executions = await PlaybookExecution.find({
        playbook_id: playbookId,
        start_time: { $gte: fromDate },
      });

      const metrics = {
        playbook_id: playbookId,
        playbook_name: playbook.name,
        time_range_days: timeRange,

        // Execution metrics
        execution_metrics: this.calculateExecutionMetrics(executions),

        // Success metrics
        success_metrics: this.calculateSuccessMetrics(playbook, executions),

        // Time metrics
        time_metrics: this.calculateTimeMetrics(executions),

        // Action metrics
        action_metrics: this.calculateActionMetrics(executions),

        // Error metrics
        error_metrics: this.calculateErrorMetrics(executions),

        // Resource metrics
        resource_metrics: this.calculateResourceMetrics(executions),

        // Trend data
        trend_data: await this.calculateTrendData(playbookId, timeRange),
      };

      logger.info('Playbook metrics calculated', { playbook_id: playbookId });

      return metrics;
    } catch (error) {
      logger.error('Error calculating metrics', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate execution metrics
   * @param {Array} executions - Executions
   * @returns {Object} Execution metrics
   */
  calculateExecutionMetrics(executions) {
    const total = executions.length;
    const completed = executions.filter((e) => e.status === 'completed').length;
    const failed = executions.filter((e) => e.status === 'failed').length;
    const cancelled = executions.filter((e) => e.status === 'cancelled').length;
    const awaiting = executions.filter((e) => e.status === 'awaiting_approval').length;

    return {
      total_executions: total,
      completed_executions: completed,
      failed_executions: failed,
      cancelled_executions: cancelled,
      awaiting_approval: awaiting,
      completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  /**
   * Calculate success metrics
   * @param {Object} playbook - Playbook
   * @param {Array} executions - Executions
   * @returns {Object} Success metrics
   */
  calculateSuccessMetrics(playbook, executions) {
    const successfulExecutions = executions.filter((e) => e.status === 'completed');

    let totalActions = 0;
    let successfulActions = 0;

    for (const execution of successfulExecutions) {
      totalActions += execution.total_actions;
      successfulActions += execution.successful_actions;
    }

    return {
      success_rate: playbook.success_rate,
      success_count: playbook.success_count,
      failure_count: playbook.failure_count,
      action_success_rate: totalActions > 0
        ? Math.round((successfulActions / totalActions) * 100) : 0,
      total_actions_executed: totalActions,
      successful_actions: successfulActions,
    };
  }

  /**
   * Calculate time metrics
   * @param {Array} executions - Executions
   * @returns {Object} Time metrics
   */
  calculateTimeMetrics(executions) {
    const completedExecutions = executions.filter(
      (e) => e.status === 'completed' || e.status === 'failed',
    );

    if (completedExecutions.length === 0) {
      return {
        average_execution_time: 0,
        min_execution_time: 0,
        max_execution_time: 0,
        median_execution_time: 0,
        total_execution_time: 0,
      };
    }

    const durations = completedExecutions
      .filter((e) => e.duration)
      .map((e) => e.duration)
      .sort((a, b) => a - b);

    const total = durations.reduce((sum, d) => sum + d, 0);
    const average = Math.round(total / durations.length);
    const median = durations.length > 0
      ? durations[Math.floor(durations.length / 2)] : 0;

    return {
      average_execution_time: average,
      min_execution_time: durations.length > 0 ? durations[0] : 0,
      max_execution_time: durations.length > 0 ? durations[durations.length - 1] : 0,
      median_execution_time: median,
      total_execution_time: total,
    };
  }

  /**
   * Calculate action metrics
   * @param {Array} executions - Executions
   * @returns {Object} Action metrics
   */
  calculateActionMetrics(executions) {
    const actionStats = {};
    let totalSkipped = 0;

    for (const execution of executions) {
      totalSkipped += execution.skipped_actions || 0;

      for (const action of execution.actions_executed) {
        if (!actionStats[action.action_type]) {
          actionStats[action.action_type] = {
            type: action.action_type,
            total: 0,
            successful: 0,
            failed: 0,
            average_duration: 0,
            total_duration: 0,
          };
        }

        // eslint-disable-next-line no-plusplus
        actionStats[action.action_type].total++;

        if (action.status === 'completed') {
          // eslint-disable-next-line no-plusplus
          actionStats[action.action_type].successful++;
        } else if (action.status === 'failed') {
          // eslint-disable-next-line no-plusplus
          actionStats[action.action_type].failed++;
        }

        if (action.duration) {
          actionStats[action.action_type].total_duration += action.duration;
        }
      }
    }

    // Calculate averages
    Object.values(actionStats).forEach((stat) => {
      if (stat.total > 0) {
        stat.average_duration = Math.round(stat.total_duration / stat.total);
        stat.success_rate = Math.round((stat.successful / stat.total) * 100);
      }
      delete stat.total_duration;
    });

    return {
      by_type: Object.values(actionStats),
      total_skipped_actions: totalSkipped,
    };
  }

  /**
   * Calculate error metrics
   * @param {Array} executions - Executions
   * @returns {Object} Error metrics
   */
  calculateErrorMetrics(executions) {
    let totalErrors = 0;
    const errorTypes = {};

    for (const execution of executions) {
      if (execution.errors && execution.errors.length > 0) {
        totalErrors += execution.errors.length;

        for (const error of execution.errors) {
          const errorKey = error.error_message || 'Unknown error';

          if (!errorTypes[errorKey]) {
            errorTypes[errorKey] = {
              message: errorKey,
              count: 0,
              action_ids: [],
            };
          }

          // eslint-disable-next-line no-plusplus
          errorTypes[errorKey].count++;
          if (error.action_id) {
            errorTypes[errorKey].action_ids.push(error.action_id);
          }
        }
      }
    }

    // Get top 5 errors
    const sortedErrors = Object.values(errorTypes)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total_errors: totalErrors,
      unique_error_types: Object.keys(errorTypes).length,
      top_errors: sortedErrors,
      error_rate: executions.length > 0
        ? Math.round((executions.filter((e) => e.errors.length > 0).length / executions.length) * 100) : 0,
    };
  }

  /**
   * Calculate resource metrics
   * @param {Array} executions - Executions
   * @returns {Object} Resource metrics
   */
  calculateResourceMetrics(executions) {
    const modes = {
      live: 0,
      test: 0,
      simulation: 0,
    };

    const triggers = {
      user: 0,
      event: 0,
      schedule: 0,
      api: 0,
    };

    for (const execution of executions) {
      if (execution.execution_mode) {
        modes[execution.execution_mode] = (modes[execution.execution_mode] || 0) + 1;
      }

      if (execution.triggered_by?.type) {
        triggers[execution.triggered_by.type] = (triggers[execution.triggered_by.type] || 0) + 1;
      }
    }

    return {
      executions_by_mode: modes,
      executions_by_trigger: triggers,
      concurrent_execution_peak: this.calculateConcurrentPeak(executions),
    };
  }

  /**
   * Calculate concurrent execution peak
   * @param {Array} executions - Executions
   * @returns {number} Peak concurrent executions
   */
  calculateConcurrentPeak(executions) {
    // Simplified calculation - in production, this would be more sophisticated
    const runningExecutions = executions.filter((e) => e.status === 'running');
    return runningExecutions.length;
  }

  /**
   * Calculate trend data
   * @param {string} playbookId - Playbook ID
   * @param {number} days - Number of days
   * @returns {Promise<Object>} Trend data
   */
  async calculateTrendData(playbookId, days) {
    try {
      const dailyStats = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayExecutions = await PlaybookExecution.find({
          playbook_id: playbookId,
          start_time: { $gte: date, $lt: nextDate },
        });

        const completed = dayExecutions.filter((e) => e.status === 'completed').length;
        const failed = dayExecutions.filter((e) => e.status === 'failed').length;

        dailyStats.push({
          date: date.toISOString().split('T')[0],
          total: dayExecutions.length,
          completed,
          failed,
          success_rate: dayExecutions.length > 0
            ? Math.round((completed / dayExecutions.length) * 100) : 0,
        });
      }

      return {
        daily_stats: dailyStats,
        trend: this.calculateTrend(dailyStats),
      };
    } catch (error) {
      logger.error('Error calculating trend data', { error: error.message });
      return { daily_stats: [], trend: 'stable' };
    }
  }

  /**
   * Calculate trend direction
   * @param {Array} dailyStats - Daily statistics
   * @returns {string} Trend direction
   */
  calculateTrend(dailyStats) {
    if (dailyStats.length < 7) return 'stable';

    const recentWeek = dailyStats.slice(-7);
    const previousWeek = dailyStats.slice(-14, -7);

    if (previousWeek.length === 0) return 'stable';

    const recentAvg = recentWeek.reduce((sum, d) => sum + d.success_rate, 0) / recentWeek.length;
    const previousAvg = previousWeek.reduce((sum, d) => sum + d.success_rate, 0) / previousWeek.length;

    const difference = recentAvg - previousAvg;

    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  /**
   * Get analytics across all playbooks
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Analytics
   */
  async getAnalytics(filters = {}) {
    try {
      logger.info('Calculating overall analytics', filters);

      const query = {};

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      const playbooks = await Playbook.find(query);

      const analytics = {
        total_playbooks: playbooks.length,
        active_playbooks: playbooks.filter((p) => p.status === 'active').length,
        total_executions: playbooks.reduce((sum, p) => sum + p.execution_count, 0),
        overall_success_rate: this.calculateOverallSuccessRate(playbooks),

        by_category: await this.getAnalyticsByCategory(),
        top_performing: this.getTopPerformingPlaybooks(playbooks, 5),
        least_performing: this.getLeastPerformingPlaybooks(playbooks, 5),

        most_used: playbooks
          .sort((a, b) => b.execution_count - a.execution_count)
          .slice(0, 5)
          .map((p) => ({
            id: p.id,
            name: p.name,
            execution_count: p.execution_count,
            success_rate: p.success_rate,
          })),
      };

      return analytics;
    } catch (error) {
      logger.error('Error calculating analytics', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate overall success rate
   * @param {Array} playbooks - Playbooks
   * @returns {number} Success rate
   */
  calculateOverallSuccessRate(playbooks) {
    const totalExecutions = playbooks.reduce((sum, p) => sum + p.execution_count, 0);
    const successfulExecutions = playbooks.reduce((sum, p) => sum + p.success_count, 0);

    return totalExecutions > 0
      ? Math.round((successfulExecutions / totalExecutions) * 100) : 0;
  }

  /**
   * Get analytics by category
   * @returns {Promise<Array>} Category analytics
   */
  async getAnalyticsByCategory() {
    try {
      const categories = await Playbook.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            total_executions: { $sum: '$execution_count' },
            avg_success_rate: { $avg: '$success_rate' },
          },
        },
      ]);

      return categories.map((cat) => ({
        category: cat._id,
        playbook_count: cat.count,
        total_executions: cat.total_executions,
        average_success_rate: Math.round(cat.avg_success_rate || 0),
      }));
    } catch (error) {
      logger.error('Error getting category analytics', { error: error.message });
      return [];
    }
  }

  /**
   * Get top performing playbooks
   * @param {Array} playbooks - Playbooks
   * @param {number} limit - Limit
   * @returns {Array} Top playbooks
   */
  getTopPerformingPlaybooks(playbooks, limit) {
    return playbooks
      .filter((p) => p.execution_count > 0)
      .sort((a, b) => b.success_rate - a.success_rate)
      .slice(0, limit)
      .map((p) => ({
        id: p.id,
        name: p.name,
        success_rate: p.success_rate,
        execution_count: p.execution_count,
      }));
  }

  /**
   * Get least performing playbooks
   * @param {Array} playbooks - Playbooks
   * @param {number} limit - Limit
   * @returns {Array} Least performing playbooks
   */
  getLeastPerformingPlaybooks(playbooks, limit) {
    return playbooks
      .filter((p) => p.execution_count > 0)
      .sort((a, b) => a.success_rate - b.success_rate)
      .slice(0, limit)
      .map((p) => ({
        id: p.id,
        name: p.name,
        success_rate: p.success_rate,
        execution_count: p.execution_count,
      }));
  }

  /**
   * Calculate ROI
   * @param {string} playbookId - Playbook ID
   * @param {Object} costData - Cost data
   * @returns {Promise<Object>} ROI calculation
   */
  async calculateROI(playbookId, costData) {
    try {
      const metrics = await this.getPlaybookMetrics(playbookId);

      const timeSaved = metrics.execution_metrics.completed_executions
                       * (costData.manual_time_hours || 2);
      const costSaved = timeSaved * (costData.hourly_rate || 50);
      const automationCost = costData.automation_cost || 1000;

      const roi = ((costSaved - automationCost) / automationCost) * 100;

      return {
        playbook_id: playbookId,
        time_saved_hours: timeSaved,
        cost_saved: costSaved,
        automation_cost: automationCost,
        roi_percentage: Math.round(roi),
        break_even_executions: Math.ceil(automationCost
          / ((costData.manual_time_hours || 2) * (costData.hourly_rate || 50))),
      };
    } catch (error) {
      logger.error('Error calculating ROI', { error: error.message });
      throw error;
    }
  }
}

module.exports = new MetricsService();
