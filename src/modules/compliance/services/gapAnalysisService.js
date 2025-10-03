/**
 * Gap Analysis Service
 * Handles compliance gap identification and analysis
 */

/* eslint-disable no-await-in-loop, no-plusplus, no-restricted-syntax, camelcase */

const { v4: uuidv4 } = require('uuid');
const ComplianceControl = require('../models/ComplianceControl');
const ComplianceGap = require('../models/ComplianceGap');
const logger = require('../utils/logger');
const { calculateGapRiskScore, prioritizeGaps } = require('../utils/scoring');

class GapAnalysisService {
  /**
   * Perform gap analysis for a framework
   * @param {Object} analysisData - Analysis parameters
   * @returns {Promise<Object>} Gap analysis results
   */
  async performGapAnalysis(analysisData) {
    try {
      const {
        framework, scope, assessment_type = 'full', include_recommendations = true,
      } = analysisData;

      logger.info('Performing gap analysis', { framework, assessment_type });

      // Get all controls for the framework
      const query = { framework };

      if (scope && scope.length > 0) {
        query.id = { $in: scope };
      }

      const controls = await ComplianceControl.find(query).lean();

      // Identify gaps
      const gaps = [];
      const summary = {
        total_controls: controls.length,
        implemented: 0,
        partially_implemented: 0,
        not_implemented: 0,
        not_applicable: 0,
        gaps_identified: 0,
      };

      for (const control of controls) {
        summary[control.implementation_status]++;

        // Identify gaps based on implementation status
        if (control.implementation_status === 'not_implemented') {
          gaps.push(await this.createGap({
            control_id: control.id,
            framework: control.framework,
            gap_type: 'implementation',
            severity: control.risk_level,
            description: `Control ${control.control_id} is not implemented`,
            current_state: 'Not implemented',
            target_state: 'Fully implemented',
            owner: control.owner,
          }));
        } else if (control.implementation_status === 'partially_implemented') {
          // eslint-disable-next-line no-await-in-loop
          gaps.push(await this.createGap({
            control_id: control.id,
            framework: control.framework,
            gap_type: 'implementation',
            severity: control.risk_level === 'critical' ? 'high' : 'medium',
            description: `Control ${control.control_id} is partially implemented`,
            current_state: 'Partially implemented',
            target_state: 'Fully implemented',
            owner: control.owner,
          }));
        }

        // Check for evidence gaps
        if (control.implementation_status === 'implemented'
            && (!control.evidence || control.evidence.length === 0)) {
          gaps.push(await this.createGap({
            control_id: control.id,
            framework: control.framework,
            gap_type: 'documentation',
            severity: 'medium',
            description: `Control ${control.control_id} lacks evidence`,
            current_state: 'No evidence collected',
            target_state: 'Evidence documented',
            owner: control.owner,
          }));
        }

        // Check for effectiveness assessment gaps
        if (control.effectiveness === 'not_assessed'
            && control.implementation_status === 'implemented') {
          gaps.push(await this.createGap({
            control_id: control.id,
            framework: control.framework,
            gap_type: 'effectiveness',
            severity: 'low',
            description: `Control ${control.control_id} effectiveness not assessed`,
            current_state: 'Not assessed',
            target_state: 'Effectiveness validated',
            owner: control.owner,
          }));
        }
      }

      summary.gaps_identified = gaps.length;

      // Prioritize gaps
      const prioritizedGaps = prioritizeGaps(gaps);

      // Generate recommendations if requested
      const recommendations = include_recommendations
        ? this.generateRecommendations(prioritizedGaps, summary) : [];

      logger.info('Gap analysis completed', {
        framework,
        gaps_identified: gaps.length,
      });

      return {
        framework,
        assessment_type,
        analysis_date: new Date(),
        summary,
        gaps: prioritizedGaps,
        recommendations,
        compliance_score: this.calculateComplianceScore(summary),
      };
    } catch (error) {
      logger.error('Error performing gap analysis', { error: error.message });
      throw error;
    }
  }

  /**
   * Create a new gap
   * @param {Object} gapData - Gap data
   * @returns {Promise<Object>} Created gap
   */
  async createGap(gapData) {
    try {
      const gap = new ComplianceGap({
        ...gapData,
        id: uuidv4(),
        risk_score: calculateGapRiskScore(gapData),
      });

      await gap.save();
      return gap;
    } catch (error) {
      logger.error('Error creating gap', { error: error.message });
      throw error;
    }
  }

  /**
   * Get all gaps with filtering
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Compliance gaps
   */
  async getGaps(filters = {}) {
    try {
      logger.info('Retrieving compliance gaps', { filters });

      const query = {};

      if (filters.framework) {
        query.framework = filters.framework;
      }
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.severity) {
        query.severity = filters.severity;
      }
      if (filters.owner) {
        query.owner = filters.owner;
      }

      const limit = parseInt(filters.limit, 10) || 100;
      const skip = parseInt(filters.skip, 10) || 0;

      const gaps = await ComplianceGap.find(query)
        .sort({ risk_score: -1, priority: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await ComplianceGap.countDocuments(query);

      logger.info('Gaps retrieved', { count: gaps.length, total });

      return {
        gaps,
        total,
        limit,
        skip,
      };
    } catch (error) {
      logger.error('Error retrieving gaps', { error: error.message });
      throw error;
    }
  }

  /**
   * Update gap status
   * @param {String} gapId - Gap identifier
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated gap
   */
  async updateGap(gapId, updates) {
    try {
      logger.info('Updating gap', { gapId });

      const gap = await ComplianceGap.findOneAndUpdate(
        { id: gapId },
        { $set: updates },
        { new: true },
      );

      if (!gap) {
        throw new Error('Gap not found');
      }

      logger.info('Gap updated successfully', { id: gap.id, status: gap.status });
      return gap;
    } catch (error) {
      logger.error('Error updating gap', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate compliance score from summary
   * @param {Object} summary - Gap analysis summary
   * @returns {Number} Compliance score (0-100)
   */
  calculateComplianceScore(summary) {
    const {
      total_controls, implemented, partially_implemented, not_applicable,
    } = summary;
    const applicable = total_controls - not_applicable;

    if (applicable === 0) {
      return 100;
    }

    const score = ((implemented + (partially_implemented * 0.5)) / applicable) * 100;
    return Math.round(score);
  }

  /**
   * Generate recommendations based on gaps
   * @param {Array} gaps - Prioritized gaps
   * @param {Object} summary - Analysis summary
   * @returns {Array} Recommendations
   */
  generateRecommendations(gaps, summary) {
    const recommendations = [];

    // Critical gaps recommendation
    const criticalGaps = gaps.filter((g) => g.severity === 'critical');
    if (criticalGaps.length > 0) {
      recommendations.push({
        priority: 'critical',
        recommendation: `Address ${criticalGaps.length} critical compliance gaps immediately`,
        impact: 'High risk of non-compliance and regulatory penalties',
        actions: criticalGaps.slice(0, 5).map((g) => g.description),
      });
    }

    // Implementation gaps recommendation
    if (summary.not_implemented > 0) {
      recommendations.push({
        priority: 'high',
        recommendation: `Implement ${summary.not_implemented} missing controls`,
        impact: 'Significant compliance gaps exist',
        actions: ['Prioritize by risk level', 'Assign ownership', 'Set implementation deadlines'],
      });
    }

    // Documentation gaps recommendation
    const docGaps = gaps.filter((g) => g.gap_type === 'documentation');
    if (docGaps.length > 0) {
      recommendations.push({
        priority: 'medium',
        recommendation: `Document evidence for ${docGaps.length} controls`,
        impact: 'Inability to demonstrate compliance during audits',
        actions: ['Collect existing evidence', 'Establish evidence collection procedures'],
      });
    }

    // Effectiveness assessment recommendation
    const effectivenessGaps = gaps.filter((g) => g.gap_type === 'effectiveness');
    if (effectivenessGaps.length > 0) {
      recommendations.push({
        priority: 'medium',
        recommendation: `Assess effectiveness of ${effectivenessGaps.length} controls`,
        impact: 'Unknown control effectiveness',
        actions: ['Develop testing procedures', 'Schedule regular assessments'],
      });
    }

    return recommendations;
  }
}

module.exports = new GapAnalysisService();
