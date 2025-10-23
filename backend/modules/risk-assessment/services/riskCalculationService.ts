/**
 * Risk Calculation Engine Service
 * Handles comprehensive risk score calculations
 */

import RiskAssessment from '../models/RiskAssessment';
import RiskModel from '../models/RiskModel';
import logger from '../utils/logger';

class RiskCalculationService {
  /**
   * Calculate risk score
   * @param {Object} riskData - Risk calculation data
   * @returns {Promise<Object>} Risk assessment with calculated score
   */
  async calculateRisk(riskData: any) {
    try {
      logger.info('Calculating risk', { assetId: riskData.asset_id });

      // Get risk model to use
      const model = riskData.model_id
        ? await RiskModel.findOne({ id: riskData.model_id })
        : await RiskModel.findOne({ is_default: true });

      // Calculate risk score based on model
      const riskScore = model
        ? this.calculateWithModel(riskData, model)
        : this.calculateBasicRisk(riskData);

      // Determine risk level
      const riskLevel = this.determineRiskLevel(riskScore, model);

      // Calculate inherent and residual risk
      const inherentRisk = riskScore;
      const residualRisk = this.calculateResidualRisk(riskScore, riskData.controls);

      // Set next review date
      const nextReview = this.calculateNextReview(riskLevel);

      // Create or update risk assessment
      let assessment = await RiskAssessment.findOne({
        asset_id: riskData.asset_id,
        threat_id: riskData.threat_id,
      });

      if (assessment) {
        Object.assign(assessment, {
          vulnerability_ids: riskData.vulnerability_ids,
          likelihood: riskData.likelihood,
          impact: riskData.impact,
          risk_score: riskScore,
          risk_level: riskLevel,
          inherent_risk: inherentRisk,
          residual_risk: residualRisk,
          controls: riskData.controls,
          owner: riskData.owner,
          assessed_at: new Date(),
          next_review: nextReview,
          mitigation_plan: riskData.mitigation_plan,
          metadata: riskData.metadata,
        });
        await assessment.save();
      } else {
        assessment = new RiskAssessment({
          asset_id: riskData.asset_id,
          threat_id: riskData.threat_id,
          vulnerability_ids: riskData.vulnerability_ids,
          likelihood: riskData.likelihood,
          impact: riskData.impact,
          risk_score: riskScore,
          risk_level: riskLevel,
          inherent_risk: inherentRisk,
          residual_risk: residualRisk,
          controls: riskData.controls,
          owner: riskData.owner,
          assessed_at: new Date(),
          next_review: nextReview,
          mitigation_plan: riskData.mitigation_plan,
          metadata: riskData.metadata,
        });
        await assessment.save();
      }

      logger.info('Risk calculated', { assetId: riskData.asset_id, riskLevel });
      return assessment;
    } catch (error: any) {
      logger.error('Error calculating risk', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate risk using basic formula: Risk = Likelihood × Impact
   * @param {Object} riskData - Risk data
   * @returns {number} Risk score
   */
  calculateBasicRisk(riskData: any) {
    const likelihoodValues = {
      very_low: 10,
      low: 30,
      medium: 50,
      high: 70,
      very_high: 90,
    };

    const impactValues = {
      negligible: 10,
      minor: 30,
      moderate: 50,
      major: 70,
      critical: 90,
    };

    const likelihood = likelihoodValues[riskData.likelihood] || 50;
    const impact = impactValues[riskData.impact] || 50;

    // Basic formula: (Likelihood × Impact) / 100
    return Math.round((likelihood * impact) / 100);
  }

  /**
   * Calculate risk using custom model
   * @param {Object} riskData - Risk data
   * @param {Object} model - Risk model
   * @returns {number} Risk score
   */
  calculateWithModel(riskData: any, model: any) {
    if (model.model_type === 'qualitative') {
      return this.calculateBasicRisk(riskData);
    }

    // For quantitative models, implement more complex calculations
    const likelihoodScore = this.getLikelihoodScore(riskData.likelihood, model);
    const impactScore = this.getImpactScore(riskData.impact, model);

    // Apply formula from model
    return Math.round((likelihoodScore * impactScore) / 100);
  }

  /**
   * Get likelihood score from model matrix
   * @param {string} likelihood - Likelihood level
   * @param {Object} model - Risk model
   * @returns {number} Likelihood score
   */
  getLikelihoodScore(likelihood: any, model: any) {
    if (!model.likelihood_matrix?.[likelihood]) {
      const defaultValues = {
        very_low: 10,
        low: 30,
        medium: 50,
        high: 70,
        very_high: 90,
      };
      return defaultValues[likelihood] || 50;
    }

    const range = model.likelihood_matrix[likelihood];
    return (range.min + range.max) / 2;
  }

  /**
   * Get impact score from model matrix
   * @param {string} impact - Impact level
   * @param {Object} model - Risk model
   * @returns {number} Impact score
   */
  getImpactScore(impact: any, model: any) {
    if (!model.impact_matrix?.[impact]) {
      const defaultValues = {
        negligible: 10,
        minor: 30,
        moderate: 50,
        major: 70,
        critical: 90,
      };
      return defaultValues[impact] || 50;
    }

    const range = model.impact_matrix[impact];
    return (range.min + range.max) / 2;
  }

  /**
   * Calculate residual risk after controls
   * @param {number} inherentRisk - Inherent risk score
   * @param {Array} controls - Control measures
   * @returns {number} Residual risk score
   */
  calculateResidualRisk(inherentRisk: any, controls: any) {
    if (!controls || controls.length === 0) {
      return inherentRisk;
    }

    // Calculate average control effectiveness
    const activeControls = controls.filter((c) => c.status === 'active');
    if (activeControls.length === 0) {
      return inherentRisk;
    }

    const avgEffectiveness = activeControls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / activeControls.length;

    // Residual Risk = Inherent Risk × (1 - Control Effectiveness)
    const residual = inherentRisk * (1 - avgEffectiveness / 100);
    return Math.round(residual);
  }

  /**
   * Determine risk level from score
   * @param {number} score - Risk score
   * @param {Object} model - Risk model (optional)
   * @returns {string} Risk level
   */
  determineRiskLevel(score: any, model: any) {
    if (model?.risk_levels) {
      const levels = model.risk_levels;
      if (score >= levels.critical.min) return 'critical';
      if (score >= levels.high.min) return 'high';
      if (score >= levels.medium.min) return 'medium';
      return 'low';
    }

    // Default thresholds
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  /**
   * Calculate next review date based on risk level
   * @param {string} riskLevel - Risk level
   * @returns {Date} Next review date
   */
  calculateNextReview(riskLevel: any) {
    const now = new Date();
    const months = {
      critical: 1, // Monthly
      high: 3, // Quarterly
      medium: 6, // Semi-annually
      low: 12, // Annually
    };

    const monthsToAdd = months[riskLevel] || 6;
    return new Date(now.setMonth(now.getMonth() + monthsToAdd));
  }

  /**
   * Get all risk scores
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of risk assessments
   */
  async getRiskScores(filters: Record<string, any> = {}) {
    try {
      const query: Record<string, any> = {};

      if (filters.risk_level) {
        query.risk_level = filters.risk_level;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.owner) {
        query.owner = filters.owner;
      }

      const assessments = await RiskAssessment.find(query).sort({ risk_score: -1 });
      return assessments;
    } catch (error: any) {
      logger.error('Error getting risk scores', { error: error.message });
      throw error;
    }
  }

  /**
   * Get risk assessment by ID
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise<Object>} Risk assessment
   */
  async getRiskAssessment(assessmentId: any) {
    try {
      const assessment = await RiskAssessment.findOne({ id: assessmentId });
      if (!assessment) {
        throw new Error('Risk assessment not found');
      }
      return assessment;
    } catch (error: any) {
      logger.error('Error getting risk assessment', { error: error.message });
      throw error;
    }
  }
}

export default new RiskCalculationService();
