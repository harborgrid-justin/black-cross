/**
 * Executive Risk Reporting Service
 * Handles executive-level risk reporting and dashboards
 */

const RiskAssessment = require('../models/RiskAssessment');
const AssetCriticality = require('../models/AssetCriticality');
const logger = require('../utils/logger');

class ExecutiveReportingService {
  /**
   * Generate executive risk report
   * @param {Object} options - Report options
   * @returns {Promise<Object>} Executive risk report
   */
  async generateExecutiveReport(options = {}) {
    try {
      logger.info('Generating executive risk report');

      const period = options.period || '30d';
      const timeRange = this.getTimeRange(period);

      // Get summary metrics
      const summary = await this.getExecutiveSummary(timeRange);

      // Get KRIs (Key Risk Indicators)
      const kris = await this.getKeyRiskIndicators(timeRange);

      // Get top risks
      const topRisks = await this.getTopRisks(10);

      // Get risk by category
      const riskByCategory = await this.getRiskByCategory();

      // Get mitigation progress
      const mitigationProgress = await this.getMitigationProgress(timeRange);

      // Get trends
      const trends = await this.getTrendSummary(timeRange);

      // Get recommendations
      const recommendations = this.generateExecutiveRecommendations(summary, kris);

      return {
        report_title: 'Executive Risk Report',
        period,
        generated_at: new Date(),
        executive_summary: summary,
        key_risk_indicators: kris,
        top_risks: topRisks,
        risk_by_category: riskByCategory,
        mitigation_progress: mitigationProgress,
        trends,
        recommendations,
        report_metadata: {
          report_type: 'executive',
          classification: options.classification || 'confidential',
          recipients: options.recipients || [],
        },
      };
    } catch (error) {
      logger.error('Error generating executive report', { error: error.message });
      throw error;
    }
  }

  /**
   * Get executive summary
   * @param {Object} timeRange - Time range
   * @returns {Promise<Object>} Executive summary
   */
  async getExecutiveSummary(timeRange) {
    const allRisks = await RiskAssessment.find({ status: { $in: ['open', 'in_progress'] } });
    const newRisks = await RiskAssessment.find({
      status: { $in: ['open', 'in_progress'] },
      assessed_at: { $gte: timeRange.start },
    });

    const criticalAssets = await AssetCriticality.find({ criticality_tier: 'tier_1_critical' });

    const avgRiskScore = allRisks.length > 0
      ? allRisks.reduce((sum, r) => sum + r.risk_score, 0) / allRisks.length
      : 0;

    return {
      total_open_risks: allRisks.length,
      new_risks_this_period: newRisks.length,
      critical_risks: allRisks.filter((r) => r.risk_level === 'critical').length,
      high_risks: allRisks.filter((r) => r.risk_level === 'high').length,
      average_risk_score: Math.round(avgRiskScore),
      risk_posture: this.determineRiskPosture(avgRiskScore),
      critical_assets_count: criticalAssets.length,
      critical_assets_at_risk: this.countAssetsAtRisk(allRisks, criticalAssets),
    };
  }

  /**
   * Get Key Risk Indicators (KRIs)
   * @param {Object} timeRange - Time range
   * @returns {Promise<Object>} KRI metrics
   */
  async getKeyRiskIndicators(timeRange) {
    const currentRisks = await RiskAssessment.find({ status: { $in: ['open', 'in_progress'] } });

    const previousTimeRange = {
      start: new Date(timeRange.start.getTime() - (timeRange.end.getTime() - timeRange.start.getTime())),
      end: timeRange.start,
    };
    const previousRisks = await RiskAssessment.find({
      assessed_at: { $gte: previousTimeRange.start, $lte: previousTimeRange.end },
    });

    const kris = {
      risk_velocity: {
        value: currentRisks.length - previousRisks.length,
        trend: currentRisks.length > previousRisks.length ? 'increasing' : 'decreasing',
        status: this.getKRIStatus(currentRisks.length - previousRisks.length, 'risk_velocity'),
      },
      mean_time_to_remediate: {
        value: await this.calculateMTTR(),
        unit: 'days',
        status: 'acceptable',
      },
      critical_risk_exposure: {
        value: currentRisks.filter((r) => r.risk_level === 'critical').length,
        threshold: 5,
        status: this.getKRIStatus(
          currentRisks.filter((r) => r.risk_level === 'critical').length,
          'critical_risks',
        ),
      },
      risk_coverage: {
        value: await this.calculateRiskCoverage(),
        unit: 'percentage',
        target: 100,
        status: 'good',
      },
    };

    return kris;
  }

  /**
   * Get top risks for executive attention
   * @param {number} limit - Number of risks to return
   * @returns {Promise<Array>} Top risks
   */
  async getTopRisks(limit = 10) {
    const risks = await RiskAssessment.find({ status: { $in: ['open', 'in_progress'] } })
      .sort({ risk_score: -1 })
      .limit(limit);

    return risks.map((r) => ({
      id: r.id,
      asset_id: r.asset_id,
      risk_level: r.risk_level,
      risk_score: r.risk_score,
      likelihood: r.likelihood,
      impact: r.impact,
      owner: r.owner,
      assessed_at: r.assessed_at,
      next_review: r.next_review,
      mitigation_status: r.mitigation_plan ? 'planned' : 'needed',
    }));
  }

  /**
   * Get risk distribution by category
   * @returns {Promise<Object>} Risk by category
   */
  async getRiskByCategory() {
    const risks = await RiskAssessment.find({ status: { $in: ['open', 'in_progress'] } });

    return {
      by_level: {
        critical: risks.filter((r) => r.risk_level === 'critical').length,
        high: risks.filter((r) => r.risk_level === 'high').length,
        medium: risks.filter((r) => r.risk_level === 'medium').length,
        low: risks.filter((r) => r.risk_level === 'low').length,
      },
      by_status: {
        open: risks.filter((r) => r.status === 'open').length,
        in_progress: risks.filter((r) => r.status === 'in_progress').length,
      },
    };
  }

  /**
   * Get mitigation progress
   * @param {Object} timeRange - Time range
   * @returns {Promise<Object>} Mitigation progress
   */
  async getMitigationProgress(timeRange) {
    const mitigated = await RiskAssessment.find({
      status: { $in: ['mitigated', 'closed'] },
      updated_at: { $gte: timeRange.start },
    });

    const inProgress = await RiskAssessment.find({ status: 'in_progress' });

    return {
      risks_mitigated_this_period: mitigated.length,
      risks_in_progress: inProgress.length,
      mitigation_effectiveness: await this.calculateMitigationEffectiveness(mitigated),
      on_track: inProgress.filter((r) => r.next_review >= new Date()).length,
      overdue: inProgress.filter((r) => r.next_review < new Date()).length,
    };
  }

  /**
   * Get trend summary
   * @param {Object} timeRange - Time range
   * @returns {Promise<Object>} Trend summary
   */
  async getTrendSummary(timeRange) {
    const risks = await RiskAssessment.find({
      assessed_at: { $gte: timeRange.start },
    }).sort({ assessed_at: 1 });

    const avgScores = [];
    const criticalCounts = [];

    // Sample every week
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    for (let date = timeRange.start; date <= new Date(); date = new Date(date.getTime() + weekMs)) {
      const weekRisks = risks.filter((r) => r.assessed_at >= date && r.assessed_at < new Date(date.getTime() + weekMs));
      if (weekRisks.length > 0) {
        avgScores.push(weekRisks.reduce((sum, r) => sum + r.risk_score, 0) / weekRisks.length);
        criticalCounts.push(weekRisks.filter((r) => r.risk_level === 'critical').length);
      }
    }

    return {
      average_risk_score_trend: avgScores.length > 1 && avgScores[avgScores.length - 1] > avgScores[0]
        ? 'increasing'
        : 'decreasing',
      critical_risk_trend: criticalCounts.length > 1 && criticalCounts[criticalCounts.length - 1] > criticalCounts[0]
        ? 'increasing'
        : 'decreasing',
    };
  }

  /**
   * Generate executive recommendations
   * @param {Object} summary - Executive summary
   * @param {Object} kris - Key Risk Indicators
   * @returns {Array} Recommendations
   */
  generateExecutiveRecommendations(summary, kris) {
    const recommendations = [];

    if (summary.critical_risks > 5) {
      recommendations.push({
        priority: 'critical',
        area: 'Risk Management',
        recommendation: 'Immediate attention required for critical risks',
        action: `Review and allocate resources for ${summary.critical_risks} critical risks`,
      });
    }

    if (kris.risk_velocity.trend === 'increasing') {
      recommendations.push({
        priority: 'high',
        area: 'Risk Posture',
        recommendation: 'Risk velocity is increasing',
        action: 'Evaluate current security controls and consider additional investments',
      });
    }

    if (summary.critical_assets_at_risk > 0) {
      recommendations.push({
        priority: 'high',
        area: 'Asset Protection',
        recommendation: `${summary.critical_assets_at_risk} critical assets are at risk`,
        action: 'Prioritize protection of tier-1 critical assets',
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'info',
        area: 'Risk Management',
        recommendation: 'Risk posture is acceptable',
        action: 'Continue current risk management practices',
      });
    }

    return recommendations;
  }

  /**
   * Helper methods
   */
  getTimeRange(period) {
    const end = new Date();
    const start = new Date();
    const periodMap = { '30d': 30, '90d': 90, '1y': 365 };
    start.setDate(start.getDate() - (periodMap[period] || 30));
    return { start, end };
  }

  determineRiskPosture(avgScore) {
    if (avgScore >= 70) return 'high_risk';
    if (avgScore >= 50) return 'elevated';
    if (avgScore >= 30) return 'moderate';
    return 'low';
  }

  countAssetsAtRisk(risks, criticalAssets) {
    const criticalAssetIds = criticalAssets.map((a) => a.asset_id);
    const uniqueAssets = new Set(
      risks.filter((r) => criticalAssetIds.includes(r.asset_id)).map((r) => r.asset_id),
    );
    return uniqueAssets.size;
  }

  getKRIStatus(value, type) {
    if (type === 'risk_velocity') {
      if (value > 10) return 'critical';
      if (value > 5) return 'warning';
      return 'acceptable';
    }
    if (type === 'critical_risks') {
      if (value > 10) return 'critical';
      if (value > 5) return 'warning';
      return 'acceptable';
    }
    return 'acceptable';
  }

  async calculateMTTR() {
    const closedRisks = await RiskAssessment.find({
      status: { $in: ['mitigated', 'closed'] },
    }).limit(50);

    if (closedRisks.length === 0) return 0;

    const totalDays = closedRisks.reduce((sum, r) => {
      const days = Math.floor((r.updated_at - r.assessed_at) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return Math.round(totalDays / closedRisks.length);
  }

  async calculateRiskCoverage() {
    const totalAssets = await AssetCriticality.countDocuments();
    const assessedAssets = await RiskAssessment.distinct('asset_id');
    if (totalAssets === 0) return 100;
    return Math.round((assessedAssets.length / totalAssets) * 100);
  }

  async calculateMitigationEffectiveness(mitigatedRisks) {
    if (mitigatedRisks.length === 0) return 0;

    const totalReduction = mitigatedRisks.reduce((sum, r) => {
      const reduction = r.inherent_risk - (r.residual_risk || 0);
      return sum + reduction;
    }, 0);

    const avgReduction = totalReduction / mitigatedRisks.length;
    return Math.round((avgReduction / 100) * 100); // Convert to percentage
  }
}

module.exports = new ExecutiveReportingService();
