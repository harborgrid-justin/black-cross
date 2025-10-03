/**
 * Analytics Controller
 * Handles HTTP requests for analytics and threat trend analysis
 */

const analyticsService = require('../services/analyticsService');
const logger = require('../utils/logger');

class AnalyticsController {
  /**
   * Get threat trends
   * GET /api/v1/reports/analytics/threat-trends
   */
  async getThreatTrends(req, res) {
    try {
      const filters = {
        period: req.query.period || '30d',
        groupBy: req.query.groupBy || 'day',
        threatType: req.query.threatType,
        severity: req.query.severity,
      };

      const trends = await analyticsService.getThreatTrends(filters);

      res.json({
        success: true,
        data: trends,
      });
    } catch (error) {
      logger.error('Error in getThreatTrends controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Detect seasonal patterns
   * GET /api/v1/reports/analytics/patterns
   */
  async detectPatterns(req, res) {
    try {
      const { threatType } = req.query;
      const patterns = await analyticsService.detectSeasonalPatterns(threatType);

      res.json({
        success: true,
        data: patterns,
      });
    } catch (error) {
      logger.error('Error in detectPatterns controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Identify anomalies
   * GET /api/v1/reports/analytics/anomalies
   */
  async identifyAnomalies(req, res) {
    try {
      const filters = {
        period: req.query.period || '30d',
        threshold: parseFloat(req.query.threshold) || 2,
      };

      const anomalies = await analyticsService.identifyAnomalies(filters);

      res.json({
        success: true,
        data: anomalies,
      });
    } catch (error) {
      logger.error('Error in identifyAnomalies controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Predict threats
   * POST /api/v1/reports/analytics/predict
   */
  async predictThreats(req, res) {
    try {
      const filters = {
        period: req.body.period || '7d',
        threatType: req.body.threatType,
      };

      const predictions = await analyticsService.predictThreats(filters);

      res.json({
        success: true,
        data: predictions,
      });
    } catch (error) {
      logger.error('Error in predictThreats controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Analyze correlation
   * GET /api/v1/reports/analytics/correlation
   */
  async analyzeCorrelation(req, res) {
    try {
      const { threatType1, threatType2 } = req.query;

      if (!threatType1 || !threatType2) {
        return res.status(400).json({
          success: false,
          error: 'Both threatType1 and threatType2 are required',
        });
      }

      const correlation = await analyticsService.analyzeCorrelation(threatType1, threatType2);

      res.json({
        success: true,
        data: correlation,
      });
    } catch (error) {
      logger.error('Error in analyzeCorrelation controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get geographic distribution
   * GET /api/v1/reports/analytics/geographic
   */
  async getGeographicDistribution(req, res) {
    try {
      const filters = {
        period: req.query.period || '30d',
        threatType: req.query.threatType,
      };

      const distribution = await analyticsService.getGeographicDistribution(filters);

      res.json({
        success: true,
        data: distribution,
      });
    } catch (error) {
      logger.error('Error in getGeographicDistribution controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new AnalyticsController();
