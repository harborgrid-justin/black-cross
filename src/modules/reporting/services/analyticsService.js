/**
 * Analytics Service
 * Business logic for threat trend analysis and predictive analytics
 */

const logger = require('../utils/logger');

class AnalyticsService {
  /**
   * Get threat trends over time
   */
  async getThreatTrends(filters = {}) {
    try {
      const {
        period = '30d',
        groupBy = 'day',
        threatType,
        severity,
      } = filters;

      // Simulate time-series data collection
      const trends = this.generateTrendData(period, groupBy, threatType, severity);

      logger.info('Threat trends retrieved', { period, groupBy });
      return trends;
    } catch (error) {
      logger.error('Error retrieving threat trends', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate mock trend data
   */
  generateTrendData(period, groupBy, threatType, severity) {
    const periodMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };

    const days = periodMap[period] || 30;
    const data = [];

    for (let i = 0; i < days; i += 1) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));

      data.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 100) + 20,
        critical: Math.floor(Math.random() * 10),
        high: Math.floor(Math.random() * 30),
        medium: Math.floor(Math.random() * 40),
        low: Math.floor(Math.random() * 20),
      });
    }

    return {
      period,
      groupBy,
      data,
      summary: {
        total: data.reduce((sum, item) => sum + item.count, 0),
        average: Math.floor(data.reduce((sum, item) => sum + item.count, 0) / data.length),
        peak: Math.max(...data.map((item) => item.count)),
        trend: this.calculateTrend(data),
      },
    };
  }

  /**
   * Calculate trend direction
   */
  calculateTrend(data) {
    if (data.length < 2) return 'stable';

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg = firstHalf.reduce((sum, item) => sum + item.count, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, item) => sum + item.count, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  /**
   * Detect seasonal patterns in threat data
   */
  async detectSeasonalPatterns(threatType) {
    try {
      // Simulate seasonal pattern detection
      const patterns = {
        threatType,
        patterns: [
          {
            period: 'weekly',
            description: 'Higher threat activity on weekends',
            confidence: 0.85,
          },
          {
            period: 'monthly',
            description: 'Increased activity at month-end',
            confidence: 0.72,
          },
        ],
      };

      logger.info('Seasonal patterns detected', { threatType });
      return patterns;
    } catch (error) {
      logger.error('Error detecting seasonal patterns', { error: error.message });
      throw error;
    }
  }

  /**
   * Identify anomalies in threat data
   */
  async identifyAnomalies(filters = {}) {
    try {
      const { period = '30d', threshold = 2 } = filters;

      // Simulate anomaly detection
      const anomalies = [
        {
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'spike',
          severity: 'high',
          description: 'Unusual spike in phishing attempts',
          value: 450,
          expected: 150,
          deviation: 3.2,
        },
        {
          date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'drop',
          severity: 'medium',
          description: 'Unexpected drop in malware detections',
          value: 20,
          expected: 100,
          deviation: 2.5,
        },
      ];

      logger.info('Anomalies identified', { period, count: anomalies.length });
      return {
        period,
        threshold,
        anomalies,
      };
    } catch (error) {
      logger.error('Error identifying anomalies', { error: error.message });
      throw error;
    }
  }

  /**
   * Predict future threats using simple forecasting
   */
  async predictThreats(filters = {}) {
    try {
      const { period = '7d', threatType } = filters;

      // Get historical data
      const historicalData = this.generateTrendData('30d', 'day', threatType);

      // Simple prediction based on trend
      const predictions = this.generatePredictions(historicalData.data, period);

      logger.info('Threat predictions generated', { period, threatType });
      return {
        threatType,
        period,
        predictions,
        confidence: 0.75,
        model: 'linear_regression',
      };
    } catch (error) {
      logger.error('Error predicting threats', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate simple predictions
   */
  generatePredictions(historicalData, period) {
    const periodMap = { '7d': 7, '14d': 14, '30d': 30 };
    const days = periodMap[period] || 7;

    const recentData = historicalData.slice(-10);
    const avgGrowth = this.calculateAverageGrowth(recentData);

    const predictions = [];
    let lastValue = recentData[recentData.length - 1].count;

    for (let i = 1; i <= days; i += 1) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      lastValue = Math.max(0, Math.floor(lastValue * (1 + avgGrowth)));

      predictions.push({
        date: date.toISOString().split('T')[0],
        predicted_count: lastValue,
        confidence_interval: {
          lower: Math.floor(lastValue * 0.8),
          upper: Math.floor(lastValue * 1.2),
        },
      });
    }

    return predictions;
  }

  /**
   * Calculate average growth rate
   */
  calculateAverageGrowth(data) {
    if (data.length < 2) return 0;

    const growthRates = [];
    for (let i = 1; i < data.length; i += 1) {
      if (data[i - 1].count !== 0) {
        growthRates.push((data[i].count - data[i - 1].count) / data[i - 1].count);
      }
    }

    return growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
  }

  /**
   * Analyze correlation between different threat types
   */
  async analyzeCorrelation(threatType1, threatType2) {
    try {
      // Simulate correlation analysis
      const correlation = {
        threatType1,
        threatType2,
        coefficient: Math.random() * 2 - 1,
        strength: '',
        description: '',
      };

      const absCoeff = Math.abs(correlation.coefficient);
      if (absCoeff > 0.7) {
        correlation.strength = 'strong';
      } else if (absCoeff > 0.4) {
        correlation.strength = 'moderate';
      } else {
        correlation.strength = 'weak';
      }

      correlation.description = `${correlation.strength} ${
        correlation.coefficient > 0 ? 'positive' : 'negative'
      } correlation detected`;

      logger.info('Correlation analyzed', { threatType1, threatType2 });
      return correlation;
    } catch (error) {
      logger.error('Error analyzing correlation', { error: error.message });
      throw error;
    }
  }

  /**
   * Get geographic threat distribution
   */
  async getGeographicDistribution(filters = {}) {
    try {
      const { period = '30d', threatType } = filters;

      // Simulate geographic distribution data
      const distribution = [
        { country: 'USA', code: 'US', count: 450, percentage: 25 },
        { country: 'China', code: 'CN', count: 380, percentage: 21 },
        { country: 'Russia', code: 'RU', count: 320, percentage: 18 },
        { country: 'Germany', code: 'DE', count: 200, percentage: 11 },
        { country: 'UK', code: 'GB', count: 180, percentage: 10 },
        { country: 'India', code: 'IN', count: 150, percentage: 8 },
        { country: 'Others', code: 'XX', count: 120, percentage: 7 },
      ];

      logger.info('Geographic distribution retrieved', { period, threatType });
      return {
        period,
        threatType,
        distribution,
        totalCount: distribution.reduce((sum, item) => sum + item.count, 0),
      };
    } catch (error) {
      logger.error('Error retrieving geographic distribution', { error: error.message });
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
