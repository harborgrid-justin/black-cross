/**
 * ComplianceReport Model
 * 
 * Represents a compliance report for regulatory requirements
 */

const { v4: uuidv4 } = require('uuid');

class ComplianceReport {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.framework = data.framework || 'custom'; // pci-dss, hipaa, sox, gdpr, iso27001, custom
    this.report_type = data.report_type || 'audit'; // audit, compliance, gap-analysis
    this.period_start = data.period_start || null;
    this.period_end = data.period_end || null;
    this.status = data.status || 'draft'; // draft, in_progress, completed, published
    this.generated_by = data.generated_by || null;
    this.requirements = data.requirements || [];
    this.findings = data.findings || [];
    this.evidence = data.evidence || [];
    this.gaps = data.gaps || [];
    this.recommendations = data.recommendations || [];
    this.compliance_score = data.compliance_score || 0;
    this.metadata = data.metadata || {};
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
    this.published_at = data.published_at || null;
  }

  /**
   * Add requirement to report
   */
  addRequirement(requirement) {
    this.requirements.push({
      id: uuidv4(),
      ...requirement,
      added_at: new Date()
    });
    this.updated_at = new Date();
  }

  /**
   * Add finding
   */
  addFinding(finding) {
    this.findings.push({
      id: uuidv4(),
      ...finding,
      added_at: new Date()
    });
    this.updated_at = new Date();
  }

  /**
   * Add compliance gap
   */
  addGap(gap) {
    this.gaps.push({
      id: uuidv4(),
      ...gap,
      severity: gap.severity || 'medium',
      added_at: new Date()
    });
    this.updated_at = new Date();
  }

  /**
   * Add recommendation
   */
  addRecommendation(recommendation) {
    this.recommendations.push({
      id: uuidv4(),
      ...recommendation,
      priority: recommendation.priority || 'medium',
      added_at: new Date()
    });
    this.updated_at = new Date();
  }

  /**
   * Calculate compliance score
   */
  calculateComplianceScore() {
    if (this.requirements.length === 0) {
      this.compliance_score = 0;
      return 0;
    }

    const compliantCount = this.requirements.filter(r => r.status === 'compliant').length;
    this.compliance_score = ((compliantCount / this.requirements.length) * 100).toFixed(2);
    return this.compliance_score;
  }

  /**
   * Publish report
   */
  publish() {
    this.status = 'published';
    this.published_at = new Date();
    this.updated_at = new Date();
    this.calculateComplianceScore();
  }

  /**
   * Convert to plain object for storage/API
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      framework: this.framework,
      report_type: this.report_type,
      period_start: this.period_start,
      period_end: this.period_end,
      status: this.status,
      generated_by: this.generated_by,
      requirements: this.requirements,
      findings: this.findings,
      evidence: this.evidence,
      gaps: this.gaps,
      recommendations: this.recommendations,
      compliance_score: this.compliance_score,
      metadata: this.metadata,
      created_at: this.created_at,
      updated_at: this.updated_at,
      published_at: this.published_at
    };
  }
}

module.exports = ComplianceReport;
