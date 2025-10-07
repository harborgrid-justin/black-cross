/**
 * Risk-Based Prioritization Service
 * Handles risk prioritization and resource allocation
 */

import RiskAssessment from '../models/RiskAssessment';
import AssetCriticality from '../models/AssetCriticality';
import logger from '../utils/logger';

class PrioritizationService {
  /**
   * Get prioritized risks
   * @param {Object} options - Prioritization options
   * @returns {Promise<Array>} Prioritized list of risks
   */
  async getPriorities(options: Record<string, any> = {}) {
    try {
      logger.info('Getting risk priorities');

      const query: Record<string, any> = { status: { $in: ['open', 'in_progress'] } };

      if (options.risk_level) {
        query.risk_level = options.risk_level;
      }

      // Get all open risks
      const risks = await RiskAssessment.find(query);

      // Enhance with asset criticality
      const enhancedRisks = await Promise.all(
        risks.map(async (risk) => {
          const asset = await AssetCriticality.findOne({ asset_id: risk.asset_id });
          return {
            ...risk.toObject(),
            asset_criticality: asset?.criticality_score || 50,
            priority_score: this.calculatePriorityScore(risk, asset),
          };
        }),
      );

      // Sort by priority score
      enhancedRisks.sort((a, b) => b.priority_score - a.priority_score);

      // Add priority rank
      const prioritized = enhancedRisks.map((risk, index) => ({
        ...risk,
        priority_rank: index + 1,
      }));

      return prioritized;
    } catch (error: any) {
      logger.error('Error getting priorities', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate priority score
   * @param {Object} risk - Risk assessment
   * @param {Object} asset - Asset criticality
   * @returns {number} Priority score
   */
  calculatePriorityScore(risk: any, asset: any) {
    const weights = {
      risk_score: 0.4,
      asset_criticality: 0.3,
      residual_risk: 0.2,
      time_factor: 0.1,
    };

    const riskScore = risk.risk_score || 0;
    const assetScore = asset?.criticality_score || 50;
    const residualScore = risk.residual_risk || riskScore;

    // Time factor: higher priority for older risks
    const daysOld = Math.floor((Date.now() - risk.assessed_at) / (1000 * 60 * 60 * 24));
    const timeFactor = Math.min(daysOld / 90, 1) * 100; // Cap at 90 days

    const score = (
      riskScore * weights.risk_score
      + assetScore * weights.asset_criticality
      + residualScore * weights.residual_risk
      + timeFactor * weights.time_factor
    );

    return Math.round(score);
  }

  /**
   * Reprioritize risks
   * @param {Object} criteria - Reprioritization criteria
   * @returns {Promise<Object>} Reprioritization results
   */
  async reprioritize(criteria = {}) {
    try {
      logger.info('Reprioritizing risks', { criteria });

      // Get current priorities
      const priorities = await this.getPriorities(criteria);

      // Identify quick wins (high impact, low effort)
      const quickWins = this.identifyQuickWins(priorities);

      // Perform cost-benefit analysis
      const costBenefitAnalysis = this.performCostBenefitAnalysis(priorities);

      // Generate recommendations
      const recommendations = this.generateRecommendations(priorities, quickWins);

      return {
        total_risks: priorities.length,
        priorities: priorities.slice(0, 20), // Top 20
        quick_wins: quickWins,
        cost_benefit_analysis: costBenefitAnalysis,
        recommendations,
        reprioritized_at: new Date(),
      };
    } catch (error: any) {
      logger.error('Error reprioritizing risks', { error: error.message });
      throw error;
    }
  }

  /**
   * Identify quick wins
   * @param {Array} priorities - Prioritized risks
   * @returns {Array} Quick win opportunities
   */
  identifyQuickWins(priorities: any) {
    return priorities
      .filter((risk) => {
        // Quick wins: medium-high risk with existing mitigation plan
        const hasEfficientMitigation = risk.mitigation_plan
          && risk.mitigation_plan.estimated_cost
          && risk.mitigation_plan.estimated_cost < 50000;

        return (
          (risk.risk_level === 'medium' || risk.risk_level === 'high')
          && hasEfficientMitigation
        );
      })
      .slice(0, 10); // Top 10 quick wins
  }

  /**
   * Perform cost-benefit analysis
   * @param {Array} priorities - Prioritized risks
   * @returns {Object} Cost-benefit analysis
   */
  performCostBenefitAnalysis(priorities: any) {
    const withCosts = priorities.filter((r) => r.mitigation_plan?.estimated_cost);

    if (withCosts.length === 0) {
      return {
        total_mitigation_cost: 0,
        average_cost_per_risk: 0,
        potential_risk_reduction: 0,
      };
    }

    const totalCost = withCosts.reduce((sum, r) => sum + r.mitigation_plan.estimated_cost, 0);
    const avgCost = totalCost / withCosts.length;

    // Calculate potential risk reduction
    const totalRiskReduction = withCosts.reduce((sum, r) => {
      const reduction = r.risk_score - (r.residual_risk || r.risk_score * 0.5);
      return sum + reduction;
    }, 0);

    return {
      total_mitigation_cost: totalCost,
      average_cost_per_risk: Math.round(avgCost),
      potential_risk_reduction: Math.round(totalRiskReduction),
      risks_with_cost_data: withCosts.length,
      roi_estimate: totalRiskReduction > 0 ? Math.round((totalRiskReduction / totalCost) * 10000) : 0,
    };
  }

  /**
   * Generate recommendations
   * @param {Array} priorities - Prioritized risks
   * @param {Array} quickWins - Quick win opportunities
   * @returns {Array} Recommendations
   */
  generateRecommendations(priorities: any, quickWins: any) {
    const recommendations = [];

    // Critical risks
    const criticalRisks = priorities.filter((r) => r.risk_level === 'critical');
    if (criticalRisks.length > 0) {
      recommendations.push({
        type: 'immediate_action',
        priority: 'critical',
        message: `${criticalRisks.length} critical risks require immediate attention`,
        risk_ids: criticalRisks.slice(0, 5).map((r) => r.id),
      });
    }

    // Quick wins
    if (quickWins.length > 0) {
      recommendations.push({
        type: 'quick_wins',
        priority: 'high',
        message: `${quickWins.length} quick win opportunities identified for efficient risk reduction`,
        risk_ids: quickWins.slice(0, 5).map((r) => r.id),
      });
    }

    // Aging risks
    const agingRisks = priorities.filter((r) => {
      const daysOld = Math.floor((Date.now() - r.assessed_at) / (1000 * 60 * 60 * 24));
      return daysOld > 90;
    });

    if (agingRisks.length > 0) {
      recommendations.push({
        type: 'aging_risks',
        priority: 'medium',
        message: `${agingRisks.length} risks have been open for more than 90 days`,
        risk_ids: agingRisks.slice(0, 5).map((r) => r.id),
      });
    }

    return recommendations;
  }

  /**
   * Get escalation queue
   * @returns {Promise<Array>} Risks requiring escalation
   */
  async getEscalationQueue() {
    try {
      const criteria = {
        $or: [
          { risk_level: 'critical', status: 'open' },
          {
            risk_level: 'high',
            status: 'open',
            assessed_at: { $lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        ],
      };

      const risks = await RiskAssessment.find(criteria).sort({ risk_score: -1 });
      return risks;
    } catch (error: any) {
      logger.error('Error getting escalation queue', { error: error.message });
      throw error;
    }
  }
}

export default new PrioritizationService();



