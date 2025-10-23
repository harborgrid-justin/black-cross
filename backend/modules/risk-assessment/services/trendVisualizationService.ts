/**
 * Risk Trend Visualization Service
 * Handles risk trend analysis and visualization data
 */

import RiskAssessment from '../models/RiskAssessment';
import logger from '../utils/logger';

class TrendVisualizationService {
  /**
   * Get risk trends
   * @param {Object} options - Trend options
   * @returns {Promise<Object>} Risk trend data
   */
  async getTrends(options: Record<string, any> = {}) {
    try {
      logger.info('Getting risk trends');

      const timeRange = this.getTimeRange(options.period || '90d');

      // Get historical risk data
      const risks = await RiskAssessment.find({
        assessed_at: { $gte: timeRange.start, $lte: timeRange.end },
      }).sort({ assessed_at: 1 });

      // Generate time series data
      const timeSeries = this.generateTimeSeries(risks, timeRange);

      // Calculate risk velocity
      const velocity = this.calculateRiskVelocity(timeSeries);

      // Identify anomalies
      const anomalies = this.detectAnomalies(timeSeries);

      // Generate forecast
      const forecast = this.generateForecast(timeSeries);

      return {
        time_series: timeSeries,
        velocity,
        anomalies,
        forecast,
        period: options.period || '90d',
        generated_at: new Date(),
      };
    } catch (error: any) {
      logger.error('Error getting risk trends', { error: error.message });
      throw error;
    }
  }

  /**
   * Get time range for analysis
   * @param {string} period - Period (e.g., '30d', '90d', '1y')
   * @returns {Object} Time range
   */
  getTimeRange(period: string) {
    const end = new Date();
    const start = new Date();

    const periodMap = {
      '30d': 30,
      '90d': 90,
      '180d': 180,
      '1y': 365,
    };

    const days = periodMap[period] || 90;
    start.setDate(start.getDate() - days);

    return { start, end };
  }

  /**
   * Generate time series data
   * @param {Array} risks - Risk assessments
   * @param {Object} timeRange - Time range
   * @returns {Array} Time series data
   */
  generateTimeSeries(risks: any, timeRange: any) {
    const series = [];
    const interval = this.calculateInterval(timeRange);

    const startDate = new Date(timeRange.start);
    const endDate = timeRange.end;

    for (let currentDate = startDate; currentDate <= endDate;) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + interval);

      const periodRisks = risks.filter(
        (r) => r.assessed_at >= currentDate && r.assessed_at < nextDate,
      );

      series.push({
        date: new Date(currentDate),
        total_risks: periodRisks.length,
        critical: periodRisks.filter((r) => r.risk_level === 'critical').length,
        high: periodRisks.filter((r) => r.risk_level === 'high').length,
        medium: periodRisks.filter((r) => r.risk_level === 'medium').length,
        low: periodRisks.filter((r) => r.risk_level === 'low').length,
        average_score: this.calculateAverageScore(periodRisks),
      });

      currentDate = nextDate;
    }

    return series;
  }

  /**
   * Calculate interval in days
   * @param {Object} timeRange - Time range
   * @returns {number} Interval in days
   */
  calculateInterval(timeRange: any) {
    const days = Math.floor((timeRange.end - timeRange.start) / (1000 * 60 * 60 * 24));
    if (days <= 30) return 1; // Daily
    if (days <= 90) return 7; // Weekly
    if (days <= 365) return 30; // Monthly
    return 90; // Quarterly
  }

  /**
   * Calculate average risk score
   * @param {Array} risks - Risk assessments
   * @returns {number} Average score
   */
  calculateAverageScore(risks: any) {
    if (risks.length === 0) return 0;
    const sum = risks.reduce((total, r) => total + r.risk_score, 0);
    return Math.round(sum / risks.length);
  }

  /**
   * Calculate risk velocity (rate of change)
   * @param {Array} timeSeries - Time series data
   * @returns {Object} Velocity metrics
   */
  calculateRiskVelocity(timeSeries: any) {
    if (timeSeries.length < 2) {
      return {
        total_risks_velocity: 0,
        critical_risks_velocity: 0,
        average_score_velocity: 0,
      };
    }

    const first = timeSeries[0];
    const last = timeSeries[timeSeries.length - 1];
    const periods = timeSeries.length;

    return {
      total_risks_velocity: (last.total_risks - first.total_risks) / periods,
      critical_risks_velocity: (last.critical - first.critical) / periods,
      average_score_velocity: (last.average_score - first.average_score) / periods,
      trend: last.total_risks > first.total_risks ? 'increasing' : 'decreasing',
    };
  }

  /**
   * Detect anomalies in trend data
   * @param {Array} timeSeries - Time series data
   * @returns {Array} Detected anomalies
   */
  detectAnomalies(timeSeries: any) {
    if (timeSeries.length < 3) return [];

    const anomalies = [];
    const avgScore = timeSeries.reduce((sum, d) => sum + d.average_score, 0) / timeSeries.length;
    const stdDev = this.calculateStdDev(timeSeries.map((d) => d.average_score));

    timeSeries.forEach((dataPoint) => {
      const deviation = Math.abs(dataPoint.average_score - avgScore);
      if (deviation > stdDev * 2) {
        // More than 2 standard deviations
        anomalies.push({
          date: dataPoint.date,
          type: dataPoint.average_score > avgScore ? 'spike' : 'drop',
          average_score: dataPoint.average_score,
          expected_range: {
            min: Math.round(avgScore - stdDev * 2),
            max: Math.round(avgScore + stdDev * 2),
          },
          severity: deviation > stdDev * 3 ? 'high' : 'medium',
        });
      }
    });

    return anomalies;
  }

  /**
   * Calculate standard deviation
   * @param {Array} values - Array of numbers
   * @returns {number} Standard deviation
   */
  calculateStdDev(values: any) {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map((val) => (val - avg) ** 2);
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Generate forecast
   * @param {Array} timeSeries - Time series data
   * @returns {Object} Forecast data
   */
  generateForecast(timeSeries: any) {
    if (timeSeries.length < 3) {
      return { message: 'Insufficient data for forecasting' };
    }

    // Simple linear regression for forecast
    const recentData = timeSeries.slice(-5); // Use last 5 data points
    const avgGrowth = this.calculateAverageGrowth(recentData);

    const lastPoint = timeSeries[timeSeries.length - 1];

    return {
      next_period: {
        estimated_total_risks: Math.max(0, Math.round(lastPoint.total_risks + avgGrowth)),
        estimated_critical: Math.max(0, Math.round(lastPoint.critical + avgGrowth * 0.2)),
        confidence: 'medium',
      },
      trend_direction: avgGrowth > 0 ? 'increasing' : 'decreasing',
      recommended_action: this.getRecommendedAction(avgGrowth),
    };
  }

  /**
   * Calculate average growth rate
   * @param {Array} data - Recent data points
   * @returns {number} Average growth rate
   */
  calculateAverageGrowth(data: any) {
    if (data.length < 2) return 0;

    let totalGrowth = 0;
    for (let i = 1; i < data.length; i += 1) {
      totalGrowth += data[i].total_risks - data[i - 1].total_risks;
    }

    return totalGrowth / (data.length - 1);
  }

  /**
   * Get recommended action based on growth
   * @param {number} growth - Growth rate
   * @returns {string} Recommended action
   */
  getRecommendedAction(growth: any) {
    if (growth > 5) return 'Immediate action required: Risk levels increasing rapidly';
    if (growth > 2) return 'Monitor closely: Risk levels trending upward';
    if (growth < -2) return 'Continue current mitigation efforts: Risks decreasing';
    return 'Maintain current risk management practices';
  }

  /**
   * Get risk heat map data
   * @returns {Promise<Object>} Heat map data
   */
  async getHeatMap() {
    try {
      const risks = await RiskAssessment.find({ status: { $in: ['open', 'in_progress'] } });

      // Create matrix of likelihood vs impact
      const matrix = {};
      const likelihoodLevels = ['very_low', 'low', 'medium', 'high', 'very_high'];
      const impactLevels = ['negligible', 'minor', 'moderate', 'major', 'critical'];

      likelihoodLevels.forEach((likelihood) => {
        matrix[likelihood] = {};
        impactLevels.forEach((impact) => {
          const count = risks.filter(
            (r) => r.likelihood === likelihood && r.impact === impact,
          ).length;
          matrix[likelihood][impact] = count;
        });
      });

      return {
        matrix,
        total_risks: risks.length,
        generated_at: new Date(),
      };
    } catch (error: any) {
      logger.error('Error generating heat map', { error: error.message });
      throw error;
    }
  }

  /**
   * Get risk reduction visualization data
   * @param {Object} options - Options
   * @returns {Promise<Object>} Risk reduction data
   */
  async getRiskReduction(options: Record<string, any> = {}) {
    try {
      const timeRange = this.getTimeRange(options.period || '90d');

      const risks = await RiskAssessment.find({
        status: { $in: ['mitigated', 'closed'] },
        updated_at: { $gte: timeRange.start, $lte: timeRange.end },
      });

      const reductionData = risks.map((r) => ({
        date: (r as any).updated_at,
        inherent_risk: r.inherent_risk,
        residual_risk: r.residual_risk,
        reduction: r.inherent_risk - r.residual_risk,
        risk_level: r.risk_level,
      }));

      const totalReduction = reductionData.reduce((sum, d) => sum + d.reduction, 0);
      const avgReduction = reductionData.length > 0 ? totalReduction / reductionData.length : 0;

      return {
        reduction_data: reductionData,
        total_reduction: Math.round(totalReduction),
        average_reduction: Math.round(avgReduction),
        risks_mitigated: risks.length,
        period: options.period || '90d',
      };
    } catch (error: any) {
      logger.error('Error getting risk reduction data', { error: error.message });
      throw error;
    }
  }
}

export default new TrendVisualizationService();
