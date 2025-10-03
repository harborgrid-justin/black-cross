/**
 * Compliance Reporting Service
 * Handles automated compliance report generation
 */

/* eslint-disable camelcase, max-len, no-unused-vars, no-return-await */

const { v4: uuidv4 } = require('uuid');
const ComplianceReport = require('../models/ComplianceReport');
const ComplianceControl = require('../models/ComplianceControl');
const ComplianceGap = require('../models/ComplianceGap');
const Evidence = require('../models/Evidence');
const logger = require('../utils/logger');
const { calculateComplianceScore } = require('../utils/scoring');

class ReportingService {
  /**
   * Generate compliance report
   * @param {Object} reportData - Report parameters
   * @returns {Promise<Object>} Generated report
   */
  async generateReport(reportData) {
    try {
      const {
        report_type,
        framework,
        period_start,
        period_end,
        format = 'pdf',
        include_evidence = false,
        recipients = [],
      } = reportData;

      logger.info('Generating compliance report', {
        report_type,
        framework,
        format,
      });

      // Create report record
      const report = new ComplianceReport({
        id: uuidv4(),
        report_id: `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        title: this.generateReportTitle(report_type, framework),
        report_type,
        framework,
        generated_by: reportData.generated_by || 'system',
        period_start: new Date(period_start),
        period_end: new Date(period_end),
        format,
        status: 'generating',
        recipients,
      });

      await report.save();

      // Generate report content based on type
      let reportContent;
      switch (report_type) {
        case 'assessment':
          reportContent = await this.generateAssessmentReport(framework, period_start, period_end);
          break;
        case 'audit':
          reportContent = await this.generateAuditReport(framework, period_start, period_end);
          break;
        case 'gap_analysis':
          reportContent = await this.generateGapAnalysisReport(framework, period_start, period_end);
          break;
        case 'executive_summary':
          reportContent = await this.generateExecutiveSummary(framework, period_start, period_end);
          break;
        case 'control_effectiveness':
          reportContent = await this.generateControlEffectivenessReport(framework, period_start, period_end);
          break;
        case 'compliance_status':
          reportContent = await this.generateComplianceStatusReport(framework, period_start, period_end);
          break;
        case 'remediation_progress':
          reportContent = await this.generateRemediationProgressReport(framework, period_start, period_end);
          break;
        default:
          throw new Error('Unknown report type');
      }

      // Update report with content
      report.compliance_score = reportContent.compliance_score;
      report.controls_assessed = reportContent.controls_assessed;
      report.controls_compliant = reportContent.controls_compliant;
      report.controls_non_compliant = reportContent.controls_non_compliant;
      report.gaps_identified = reportContent.gaps_identified;
      report.summary = reportContent.summary;
      report.findings = reportContent.findings;
      report.recommendations = reportContent.recommendations;
      report.status = 'completed';

      if (include_evidence) {
        report.evidence_package = await this.createEvidencePackage(framework);
      }

      await report.save();

      logger.info('Report generated successfully', {
        report_id: report.report_id,
        compliance_score: report.compliance_score,
      });

      return report;
    } catch (error) {
      logger.error('Error generating report', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate assessment report
   * @param {String} framework - Framework identifier
   * @param {Date} periodStart - Start date
   * @param {Date} periodEnd - End date
   * @returns {Promise<Object>} Report content
   */
  async generateAssessmentReport(framework, periodStart, periodEnd) {
    const controls = await ComplianceControl.find({
      framework,
      updatedAt: { $gte: new Date(periodStart), $lte: new Date(periodEnd) },
    }).lean();

    const stats = this.calculateControlStatistics(controls);
    const compliance_score = calculateComplianceScore(controls);

    return {
      compliance_score,
      controls_assessed: controls.length,
      controls_compliant: stats.implemented,
      controls_non_compliant: stats.not_implemented + stats.partially_implemented,
      gaps_identified: stats.not_implemented + stats.partially_implemented,
      summary: `Assessment completed for ${framework} with ${controls.length} controls assessed. Compliance score: ${compliance_score}%.`,
      findings: controls.map((c) => ({
        control_id: c.control_id,
        status: c.implementation_status,
        severity: c.risk_level,
        description: c.title,
      })),
      recommendations: this.generateRecommendationsFromControls(controls),
    };
  }

  /**
   * Generate gap analysis report
   * @param {String} framework - Framework identifier
   * @param {Date} periodStart - Start date
   * @param {Date} periodEnd - End date
   * @returns {Promise<Object>} Report content
   */
  async generateGapAnalysisReport(framework, periodStart, periodEnd) {
    const gaps = await ComplianceGap.find({
      framework,
      identified_date: { $gte: new Date(periodStart), $lte: new Date(periodEnd) },
    }).lean();

    const controls = await ComplianceControl.find({ framework }).lean();
    const compliance_score = calculateComplianceScore(controls);

    return {
      compliance_score,
      controls_assessed: controls.length,
      controls_compliant: controls.filter((c) => c.implementation_status === 'implemented').length,
      controls_non_compliant: controls.filter((c) => c.implementation_status !== 'implemented' && c.implementation_status !== 'not_applicable').length,
      gaps_identified: gaps.length,
      summary: `Gap analysis identified ${gaps.length} gaps in ${framework} compliance.`,
      findings: gaps.map((g) => ({
        control_id: g.control_id,
        status: g.status,
        severity: g.severity,
        description: g.description,
      })),
      recommendations: gaps.slice(0, 10).map((g) => g.remediation_plan || g.description),
    };
  }

  /**
   * Generate executive summary report
   * @param {String} framework - Framework identifier
   * @param {Date} periodStart - Start date
   * @param {Date} periodEnd - End date
   * @returns {Promise<Object>} Report content
   */
  async generateExecutiveSummary(framework, periodStart, periodEnd) {
    const controls = await ComplianceControl.find({ framework }).lean();
    const gaps = await ComplianceGap.find({
      framework,
      status: { $in: ['identified', 'in_progress'] },
    }).lean();

    const compliance_score = calculateComplianceScore(controls);
    const criticalGaps = gaps.filter((g) => g.severity === 'critical').length;
    const highGaps = gaps.filter((g) => g.severity === 'high').length;

    return {
      compliance_score,
      controls_assessed: controls.length,
      controls_compliant: controls.filter((c) => c.implementation_status === 'implemented').length,
      controls_non_compliant: controls.filter((c) => c.implementation_status !== 'implemented' && c.implementation_status !== 'not_applicable').length,
      gaps_identified: gaps.length,
      summary: `Executive Summary: ${framework} compliance stands at ${compliance_score}%. ${criticalGaps} critical and ${highGaps} high-severity gaps require immediate attention.`,
      findings: [
        {
          control_id: 'SUMMARY',
          status: compliance_score >= 80 ? 'compliant' : 'non_compliant',
          severity: compliance_score >= 80 ? 'low' : 'high',
          description: `Overall compliance: ${compliance_score}%`,
        },
      ],
      recommendations: [
        criticalGaps > 0 ? `Address ${criticalGaps} critical gaps immediately` : 'No critical gaps',
        highGaps > 0 ? `Remediate ${highGaps} high-severity gaps` : 'Minimal high-severity gaps',
        `Maintain ${compliance_score}% compliance level`,
      ],
    };
  }

  /**
   * Generate control effectiveness report
   * @param {String} framework - Framework identifier
   * @param {Date} periodStart - Start date
   * @param {Date} periodEnd - End date
   * @returns {Promise<Object>} Report content
   */
  async generateControlEffectivenessReport(framework, periodStart, periodEnd) {
    const controls = await ComplianceControl.find({
      framework,
      last_assessed: { $gte: new Date(periodStart), $lte: new Date(periodEnd) },
    }).lean();

    const effectivenessStats = {
      effective: controls.filter((c) => c.effectiveness === 'effective').length,
      partially_effective: controls.filter((c) => c.effectiveness === 'partially_effective').length,
      ineffective: controls.filter((c) => c.effectiveness === 'ineffective').length,
      not_assessed: controls.filter((c) => c.effectiveness === 'not_assessed').length,
    };

    return {
      compliance_score: Math.round((effectivenessStats.effective / controls.length) * 100),
      controls_assessed: controls.length,
      controls_compliant: effectivenessStats.effective,
      controls_non_compliant: effectivenessStats.ineffective + effectivenessStats.partially_effective,
      gaps_identified: effectivenessStats.ineffective,
      summary: `Control effectiveness: ${effectivenessStats.effective} effective, ${effectivenessStats.partially_effective} partially effective, ${effectivenessStats.ineffective} ineffective.`,
      findings: controls.map((c) => ({
        control_id: c.control_id,
        status: c.effectiveness,
        severity: c.effectiveness === 'ineffective' ? 'high' : 'medium',
        description: `${c.title} - ${c.effectiveness}`,
      })),
      recommendations: effectivenessStats.not_assessed > 0
        ? [`Assess ${effectivenessStats.not_assessed} unassessed controls`] : [],
    };
  }

  /**
   * Generate compliance status report
   * @param {String} framework - Framework identifier
   * @param {Date} periodStart - Start date
   * @param {Date} periodEnd - End date
   * @returns {Promise<Object>} Report content
   */
  async generateComplianceStatusReport(framework, periodStart, periodEnd) {
    return await this.generateAssessmentReport(framework, periodStart, periodEnd);
  }

  /**
   * Generate remediation progress report
   * @param {String} framework - Framework identifier
   * @param {Date} periodStart - Start date
   * @param {Date} periodEnd - End date
   * @returns {Promise<Object>} Report content
   */
  async generateRemediationProgressReport(framework, periodStart, periodEnd) {
    const gaps = await ComplianceGap.find({
      framework,
      $or: [
        { identified_date: { $gte: new Date(periodStart), $lte: new Date(periodEnd) } },
        { actual_remediation_date: { $gte: new Date(periodStart), $lte: new Date(periodEnd) } },
      ],
    }).lean();

    const remediated = gaps.filter((g) => g.status === 'remediated').length;
    const inProgress = gaps.filter((g) => g.status === 'in_progress').length;
    const identified = gaps.filter((g) => g.status === 'identified').length;

    return {
      compliance_score: gaps.length > 0 ? Math.round((remediated / gaps.length) * 100) : 100,
      controls_assessed: gaps.length,
      controls_compliant: remediated,
      controls_non_compliant: identified + inProgress,
      gaps_identified: identified,
      summary: `Remediation progress: ${remediated} remediated, ${inProgress} in progress, ${identified} identified.`,
      findings: gaps.map((g) => ({
        control_id: g.control_id,
        status: g.status,
        severity: g.severity,
        description: g.description,
      })),
      recommendations: inProgress > 0
        ? [`Complete ${inProgress} gaps in progress`, `Start remediation for ${identified} identified gaps`] : [],
    };
  }

  /**
   * Get reports with filtering
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Reports
   */
  async getReports(filters = {}) {
    try {
      logger.info('Retrieving reports', { filters });

      const query = {};

      if (filters.framework) {
        query.framework = filters.framework;
      }
      if (filters.report_type) {
        query.report_type = filters.report_type;
      }
      if (filters.status) {
        query.status = filters.status;
      }

      const limit = parseInt(filters.limit, 10) || 50;
      const skip = parseInt(filters.skip, 10) || 0;

      const reports = await ComplianceReport.find(query)
        .sort({ generated_at: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await ComplianceReport.countDocuments(query);

      logger.info('Reports retrieved', { count: reports.length, total });

      return {
        reports,
        total,
        limit,
        skip,
      };
    } catch (error) {
      logger.error('Error retrieving reports', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate control statistics
   * @param {Array} controls - Controls array
   * @returns {Object} Statistics
   */
  calculateControlStatistics(controls) {
    return {
      implemented: controls.filter((c) => c.implementation_status === 'implemented').length,
      partially_implemented: controls.filter((c) => c.implementation_status === 'partially_implemented').length,
      not_implemented: controls.filter((c) => c.implementation_status === 'not_implemented').length,
      not_applicable: controls.filter((c) => c.implementation_status === 'not_applicable').length,
    };
  }

  /**
   * Generate recommendations from controls
   * @param {Array} controls - Controls array
   * @returns {Array} Recommendations
   */
  generateRecommendationsFromControls(controls) {
    const recommendations = [];
    const criticalControls = controls.filter((c) => c.risk_level === 'critical' && c.implementation_status !== 'implemented');

    if (criticalControls.length > 0) {
      recommendations.push(`Prioritize implementation of ${criticalControls.length} critical controls`);
    }

    return recommendations;
  }

  /**
   * Generate report title
   * @param {String} reportType - Report type
   * @param {String} framework - Framework
   * @returns {String} Report title
   */
  generateReportTitle(reportType, framework) {
    const titles = {
      assessment: 'Compliance Assessment Report',
      audit: 'Audit Report',
      gap_analysis: 'Gap Analysis Report',
      executive_summary: 'Executive Summary',
      control_effectiveness: 'Control Effectiveness Report',
      compliance_status: 'Compliance Status Report',
      remediation_progress: 'Remediation Progress Report',
    };

    return `${titles[reportType] || 'Compliance Report'} - ${framework}`;
  }

  /**
   * Create evidence package
   * @param {String} framework - Framework identifier
   * @returns {Promise<String>} Evidence package reference
   */
  async createEvidencePackage(framework) {
    const evidence = await Evidence.find({ framework, status: 'approved' }).lean();
    const packageId = `EVD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    logger.info('Evidence package created', {
      packageId,
      framework,
      evidence_count: evidence.length,
    });

    return packageId;
  }

  /**
   * Generate audit report
   * @param {String} framework - Framework identifier
   * @param {Date} periodStart - Start date
   * @param {Date} periodEnd - End date
   * @returns {Promise<Object>} Report content
   */
  async generateAuditReport(framework, periodStart, periodEnd) {
    return await this.generateAssessmentReport(framework, periodStart, periodEnd);
  }
}

module.exports = new ReportingService();
