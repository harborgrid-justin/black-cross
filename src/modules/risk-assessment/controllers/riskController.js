/**
 * Risk Assessment Controller
 * Handles HTTP requests for risk assessment operations
 */

const assetCriticalityService = require('../services/assetCriticalityService');
const threatImpactService = require('../services/threatImpactService');
const riskCalculationService = require('../services/riskCalculationService');
const prioritizationService = require('../services/prioritizationService');
const riskModelService = require('../services/riskModelService');
const trendVisualizationService = require('../services/trendVisualizationService');
const executiveReportingService = require('../services/executiveReportingService');
const logger = require('../utils/logger');

class RiskController {
  /**
   * Assess asset criticality
   * POST /api/v1/risk/assets/assess
   */
  async assessAsset(req, res) {
    try {
      const assessment = await assetCriticalityService.assessAsset(req.body);
      res.status(201).json({
        success: true,
        data: assessment,
      });
    } catch (error) {
      logger.error('Error in assessAsset controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get asset criticality
   * GET /api/v1/risk/assets/:id/criticality
   */
  async getAssetCriticality(req, res) {
    try {
      const assessment = await assetCriticalityService.getAssetCriticality(req.params.id);
      res.json({
        success: true,
        data: assessment,
      });
    } catch (error) {
      logger.error('Error in getAssetCriticality controller', { error: error.message });
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Analyze threat impact
   * POST /api/v1/risk/threats/:id/impact
   */
  async analyzeThreatImpact(req, res) {
    try {
      const analysis = await threatImpactService.analyzeThreatImpact(req.params.id, req.body);
      res.status(201).json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      logger.error('Error in analyzeThreatImpact controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get impact analysis
   * GET /api/v1/risk/impact-analysis
   */
  async getImpactAnalysis(req, res) {
    try {
      const filters = {
        impact_level: req.query.impact_level,
        from_date: req.query.from_date,
        to_date: req.query.to_date,
      };
      const analyses = await threatImpactService.getImpactAnalyses(filters);
      res.json({
        success: true,
        data: analyses,
        count: analyses.length,
      });
    } catch (error) {
      logger.error('Error in getImpactAnalysis controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Calculate risk
   * POST /api/v1/risk/calculate
   */
  async calculateRisk(req, res) {
    try {
      const assessment = await riskCalculationService.calculateRisk(req.body);
      res.status(201).json({
        success: true,
        data: assessment,
      });
    } catch (error) {
      logger.error('Error in calculateRisk controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get risk scores
   * GET /api/v1/risk/scores
   */
  async getRiskScores(req, res) {
    try {
      const filters = {
        risk_level: req.query.risk_level,
        status: req.query.status,
        owner: req.query.owner,
      };
      const scores = await riskCalculationService.getRiskScores(filters);
      res.json({
        success: true,
        data: scores,
        count: scores.length,
      });
    } catch (error) {
      logger.error('Error in getRiskScores controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get risk priorities
   * GET /api/v1/risk/priorities
   */
  async getPriorities(req, res) {
    try {
      const options = {
        risk_level: req.query.risk_level,
      };
      const priorities = await prioritizationService.getPriorities(options);
      res.json({
        success: true,
        data: priorities,
        count: priorities.length,
      });
    } catch (error) {
      logger.error('Error in getPriorities controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Reprioritize risks
   * POST /api/v1/risk/reprioritize
   */
  async reprioritize(req, res) {
    try {
      const result = await prioritizationService.reprioritize(req.body);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in reprioritize controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Create risk model
   * POST /api/v1/risk/models
   */
  async createModel(req, res) {
    try {
      const model = await riskModelService.createModel(req.body);
      res.status(201).json({
        success: true,
        data: model,
      });
    } catch (error) {
      logger.error('Error in createModel controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update risk model
   * PUT /api/v1/risk/models/:id
   */
  async updateModel(req, res) {
    try {
      const model = await riskModelService.updateModel(req.params.id, req.body);
      res.json({
        success: true,
        data: model,
      });
    } catch (error) {
      logger.error('Error in updateModel controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get risk trends
   * GET /api/v1/risk/trends
   */
  async getTrends(req, res) {
    try {
      const options = {
        period: req.query.period,
      };
      const trends = await trendVisualizationService.getTrends(options);
      res.json({
        success: true,
        data: trends,
      });
    } catch (error) {
      logger.error('Error in getTrends controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get risk visualizations
   * GET /api/v1/risk/visualizations
   */
  async getVisualizations(req, res) {
    try {
      const heatMap = await trendVisualizationService.getHeatMap();
      const riskReduction = await trendVisualizationService.getRiskReduction({
        period: req.query.period,
      });

      res.json({
        success: true,
        data: {
          heat_map: heatMap,
          risk_reduction: riskReduction,
        },
      });
    } catch (error) {
      logger.error('Error in getVisualizations controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get executive report
   * GET /api/v1/risk/reports/executive
   */
  async getExecutiveReport(req, res) {
    try {
      const options = {
        period: req.query.period,
        classification: req.query.classification,
        recipients: req.query.recipients ? req.query.recipients.split(',') : [],
      };
      const report = await executiveReportingService.generateExecutiveReport(options);
      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      logger.error('Error in getExecutiveReport controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Generate custom report
   * POST /api/v1/risk/reports/generate
   */
  async generateReport(req, res) {
    try {
      const report = await executiveReportingService.generateExecutiveReport(req.body);
      res.status(201).json({
        success: true,
        data: report,
      });
    } catch (error) {
      logger.error('Error in generateReport controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new RiskController();
