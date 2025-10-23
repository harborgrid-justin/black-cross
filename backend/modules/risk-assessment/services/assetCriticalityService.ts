/**
 * Asset Criticality Assessment Service
 * Handles asset criticality evaluation and classification
 */

import AssetCriticality from '../models/AssetCriticality';
import logger from '../utils/logger';

class AssetCriticalityService {
  /**
   * Assess asset criticality
   * @param {Object} assetData - Asset assessment data
   * @returns {Promise<Object>} Asset criticality assessment
   */
  async assessAsset(assetData) {
    try {
      logger.info('Assessing asset criticality', { assetId: assetData.asset_id });

      // Calculate criticality score based on business impact
      const criticalityScore = this.calculateCriticalityScore(assetData.business_impact);

      // Determine criticality tier
      const criticalityTier = this.determineCriticalityTier(criticalityScore);

      // Calculate next assessment date (quarterly for critical assets)
      const nextAssessment = this.calculateNextAssessment(criticalityTier);

      // Check if asset already exists
      let assessment = await AssetCriticality.findOne({ asset_id: assetData.asset_id });

      if (assessment) {
        // Update existing assessment
        Object.assign(assessment, {
          asset_name: assetData.asset_name,
          asset_type: assetData.asset_type,
          business_unit: assetData.business_unit,
          criticality_score: criticalityScore,
          criticality_tier: criticalityTier,
          business_impact: assetData.business_impact,
          asset_value: assetData.asset_value,
          dependencies: assetData.dependencies,
          owner: assetData.owner,
          data_classification: assetData.data_classification,
          last_assessed: new Date(),
          next_assessment: nextAssessment,
          metadata: assetData.metadata,
        });
        await assessment.save();
      } else {
        // Create new assessment
        assessment = new AssetCriticality({
          asset_id: assetData.asset_id,
          asset_name: assetData.asset_name,
          asset_type: assetData.asset_type,
          business_unit: assetData.business_unit,
          criticality_score: criticalityScore,
          criticality_tier: criticalityTier,
          business_impact: assetData.business_impact,
          asset_value: assetData.asset_value,
          dependencies: assetData.dependencies,
          owner: assetData.owner,
          data_classification: assetData.data_classification,
          last_assessed: new Date(),
          next_assessment: nextAssessment,
          metadata: assetData.metadata,
        });
        await assessment.save();
      }

      logger.info('Asset criticality assessed', { assetId: assetData.asset_id, tier: criticalityTier });
      return assessment;
    } catch (error) {
      logger.error('Error assessing asset criticality', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate criticality score from business impact
   * @param {Object} businessImpact - Business impact scores
   * @returns {number} Criticality score
   */
  calculateCriticalityScore(businessImpact) {
    if (!businessImpact) return 0;

    const weights = {
      financial: 0.3,
      operational: 0.3,
      reputational: 0.2,
      compliance: 0.2,
    };

    const score = (
      (businessImpact.financial || 0) * weights.financial
      + (businessImpact.operational || 0) * weights.operational
      + (businessImpact.reputational || 0) * weights.reputational
      + (businessImpact.compliance || 0) * weights.compliance
    );

    return Math.round(score);
  }

  /**
   * Determine criticality tier based on score
   * @param {number} score - Criticality score
   * @returns {string} Criticality tier
   */
  determineCriticalityTier(score) {
    if (score >= 80) return 'tier_1_critical';
    if (score >= 60) return 'tier_2_high';
    if (score >= 40) return 'tier_3_medium';
    return 'tier_4_low';
  }

  /**
   * Calculate next assessment date based on tier
   * @param {string} tier - Criticality tier
   * @returns {Date} Next assessment date
   */
  calculateNextAssessment(tier) {
    const now = new Date();
    const months = {
      tier_1_critical: 3, // Quarterly
      tier_2_high: 6, // Semi-annually
      tier_3_medium: 12, // Annually
      tier_4_low: 24, // Biennially
    };

    const monthsToAdd = months[tier] || 12;
    return new Date(now.setMonth(now.getMonth() + monthsToAdd));
  }

  /**
   * Get asset criticality by ID
   * @param {string} assetId - Asset ID
   * @returns {Promise<Object>} Asset criticality
   */
  async getAssetCriticality(assetId) {
    try {
      const assessment = await AssetCriticality.findOne({ asset_id: assetId });
      if (!assessment) {
        throw new Error('Asset criticality assessment not found');
      }
      return assessment;
    } catch (error) {
      logger.error('Error getting asset criticality', { error: error.message });
      throw error;
    }
  }

  /**
   * Get all assets by criticality tier
   * @param {string} tier - Criticality tier
   * @returns {Promise<Array>} List of assets
   */
  async getAssetsByTier(tier) {
    try {
      const assets = await AssetCriticality.find({ criticality_tier: tier }).sort({ criticality_score: -1 });
      return assets;
    } catch (error) {
      logger.error('Error getting assets by tier', { error: error.message });
      throw error;
    }
  }

  /**
   * Get assets due for reassessment
   * @returns {Promise<Array>} List of assets
   */
  async getAssetsDueForReassessment() {
    try {
      const now = new Date();
      const assets = await AssetCriticality.find({
        next_assessment: { $lte: now },
      }).sort({ criticality_score: -1 });
      return assets;
    } catch (error) {
      logger.error('Error getting assets due for reassessment', { error: error.message });
      throw error;
    }
  }
}

export default new AssetCriticalityService();
