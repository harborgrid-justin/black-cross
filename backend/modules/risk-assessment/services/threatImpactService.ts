/**
 * Threat Impact Analysis Service
 * Handles threat impact assessment and analysis
 */

import ThreatImpact from '../models/ThreatImpact';
import logger from '../utils/logger';

class ThreatImpactService {
  /**
   * Analyze threat impact
   * @param {string} threatId - Threat ID
   * @param {Object} impactData - Impact analysis data
   * @returns {Promise<Object>} Threat impact analysis
   */
  async analyzeThreatImpact(threatId: any, impactData: any) {
    try {
      logger.info('Analyzing threat impact', { threatId });

      // Calculate overall impact score
      const overallScore = this.calculateOverallImpactScore(impactData.impact_dimensions);

      // Determine impact level
      const impactLevel = this.determineImpactLevel(overallScore);

      // Create impact analysis
      const analysis = new ThreatImpact({
        threat_id: threatId,
        threat_name: impactData.threat_name,
        impact_dimensions: impactData.impact_dimensions,
        overall_impact_score: overallScore,
        impact_level: impactLevel,
        scenarios: impactData.scenarios,
        analyzed_by: impactData.analyzed_by,
        analyzed_at: new Date(),
        metadata: impactData.metadata,
      });

      await analysis.save();

      logger.info('Threat impact analyzed', { threatId, impactLevel });
      return analysis;
    } catch (error: any) {
      logger.error('Error analyzing threat impact', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate overall impact score from dimensions
   * @param {Object} dimensions - Impact dimensions
   * @returns {number} Overall impact score
   */
  calculateOverallImpactScore(dimensions: any) {
    if (!dimensions) return 0;

    const weights = {
      financial: 0.3,
      operational: 0.3,
      reputational: 0.2,
      regulatory: 0.2,
    };

    const score = (
      (dimensions.financial?.score || 0) * weights.financial
      + (dimensions.operational?.score || 0) * weights.operational
      + (dimensions.reputational?.score || 0) * weights.reputational
      + (dimensions.regulatory?.score || 0) * weights.regulatory
    );

    return Math.round(score);
  }

  /**
   * Determine impact level from score
   * @param {number} score - Impact score
   * @returns {string} Impact level
   */
  determineImpactLevel(score: any) {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'major';
    if (score >= 40) return 'moderate';
    if (score >= 20) return 'minor';
    return 'negligible';
  }

  /**
   * Get threat impact analysis by threat ID
   * @param {string} threatId - Threat ID
   * @returns {Promise<Object>} Threat impact analysis
   */
  async getThreatImpact(threatId: any) {
    try {
      const analysis = await ThreatImpact.findOne({ threat_id: threatId }).sort({ analyzed_at: -1 });
      if (!analysis) {
        throw new Error('Threat impact analysis not found');
      }
      return analysis;
    } catch (error: any) {
      logger.error('Error getting threat impact', { error: error.message });
      throw error;
    }
  }

  /**
   * Get all impact analyses
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of impact analyses
   */
  async getImpactAnalyses(filters: Record<string, any> = {}) {
    try {
      const query: Record<string, any> = {};

      if (filters.impact_level) {
        query.impact_level = filters.impact_level;
      }

      if (filters.from_date) {
        query.analyzed_at = { $gte: new Date(filters.from_date) };
      }

      if (filters.to_date) {
        query.analyzed_at = { ...query.analyzed_at, $lte: new Date(filters.to_date) };
      }

      const analyses = await ThreatImpact.find(query).sort({ analyzed_at: -1 });
      return analyses;
    } catch (error: any) {
      logger.error('Error getting impact analyses', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate financial impact estimate
   * @param {Object} impactData - Impact data
   * @returns {Object} Financial impact calculation
   */
  calculateFinancialImpact(impactData: any) {
    const factors = {
      downtime_cost_per_hour: impactData.downtime_cost_per_hour || 10000,
      data_breach_cost_per_record: impactData.data_breach_cost_per_record || 150,
      reputation_impact_multiplier: impactData.reputation_impact_multiplier || 1.5,
    };

    const downtimeCost = (impactData.downtime_hours || 0) * factors.downtime_cost_per_hour;
    const breachCost = (impactData.records_at_risk || 0) * factors.data_breach_cost_per_record;
    const regulatoryCost = impactData.potential_fines || 0;

    const totalCost = downtimeCost + breachCost + regulatoryCost;
    const totalWithReputation = totalCost * factors.reputation_impact_multiplier;

    return {
      downtime_cost: downtimeCost,
      breach_cost: breachCost,
      regulatory_cost: regulatoryCost,
      subtotal: totalCost,
      total_estimated_loss: Math.round(totalWithReputation),
      currency: 'USD',
    };
  }
}

export default new ThreatImpactService();



