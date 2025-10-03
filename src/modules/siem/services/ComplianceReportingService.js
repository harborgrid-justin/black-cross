/**
 * Compliance Reporting Service
 * 
 * Handles compliance reporting for various regulatory frameworks
 */

const { complianceReportRepository, securityEventRepository, alertRepository } = require('../repositories');

class ComplianceReportingService {
  /**
   * Create compliance report
   */
  async createReport(reportData) {
    return await complianceReportRepository.create(reportData);
  }

  /**
   * Get compliance report
   */
  async getReport(id) {
    return await complianceReportRepository.findById(id);
  }

  /**
   * Get all reports
   */
  async getReports(filters = {}) {
    return await complianceReportRepository.findAll(filters);
  }

  /**
   * Generate compliance report
   */
  async generateReport(framework, periodStart, periodEnd, generatedBy) {
    const report = await complianceReportRepository.create({
      name: `${framework.toUpperCase()} Compliance Report`,
      framework: framework,
      report_type: 'compliance',
      period_start: periodStart,
      period_end: periodEnd,
      generated_by: generatedBy,
      status: 'in_progress'
    });

    // Get framework requirements
    const requirements = this.getFrameworkRequirements(framework);

    // Evaluate each requirement
    for (const req of requirements) {
      const evaluation = await this.evaluateRequirement(req, periodStart, periodEnd);
      report.addRequirement({
        requirement_id: req.id,
        title: req.title,
        description: req.description,
        status: evaluation.status,
        evidence: evaluation.evidence,
        notes: evaluation.notes
      });
    }

    // Calculate compliance score
    report.calculateComplianceScore();

    // Identify gaps
    const gaps = await this.identifyGaps(report);
    gaps.forEach(gap => report.addGap(gap));

    // Generate recommendations
    const recommendations = this.generateRecommendations(report);
    recommendations.forEach(rec => report.addRecommendation(rec));

    report.status = 'completed';
    return await complianceReportRepository.update(report.id, report);
  }

  /**
   * Get framework requirements
   */
  getFrameworkRequirements(framework) {
    const frameworks = {
      'pci-dss': [
        {
          id: 'pci-10.1',
          title: 'Log Collection',
          description: 'Implement audit trails to link access to system components'
        },
        {
          id: 'pci-10.2',
          title: 'Automated Audit Trails',
          description: 'Implement automated audit trails for all system components'
        },
        {
          id: 'pci-10.3',
          title: 'Event Recording',
          description: 'Record at least the following audit trail entries for events'
        },
        {
          id: 'pci-10.6',
          title: 'Log Review',
          description: 'Review logs and security events for all system components'
        }
      ],
      'hipaa': [
        {
          id: 'hipaa-164.308',
          title: 'Security Management Process',
          description: 'Implement policies and procedures to prevent, detect, contain security incidents'
        },
        {
          id: 'hipaa-164.312',
          title: 'Audit Controls',
          description: 'Implement hardware, software, and procedural mechanisms to record and examine activity'
        }
      ],
      'sox': [
        {
          id: 'sox-404',
          title: 'Internal Controls',
          description: 'Establish and maintain adequate internal control structure'
        },
        {
          id: 'sox-log',
          title: 'Log Management',
          description: 'Maintain detailed logs of all financial system access and changes'
        }
      ],
      'gdpr': [
        {
          id: 'gdpr-32',
          title: 'Security of Processing',
          description: 'Implement appropriate technical and organizational measures'
        },
        {
          id: 'gdpr-33',
          title: 'Breach Notification',
          description: 'Notify supervisory authority of personal data breach'
        }
      ],
      'iso27001': [
        {
          id: 'iso-a.12.4',
          title: 'Logging and Monitoring',
          description: 'Event logs recording user activities shall be produced and kept'
        },
        {
          id: 'iso-a.16.1',
          title: 'Incident Management',
          description: 'Management responsibilities and procedures shall be established'
        }
      ]
    };

    return frameworks[framework] || [];
  }

  /**
   * Evaluate requirement
   */
  async evaluateRequirement(requirement, periodStart, periodEnd) {
    // Get relevant events and alerts
    const events = await securityEventRepository.findByTimeRange(
      new Date(periodStart),
      new Date(periodEnd)
    );

    const alerts = await alertRepository.find({});
    const periodAlerts = alerts.data.filter(a => {
      const created = new Date(a.created_at);
      return created >= new Date(periodStart) && created <= new Date(periodEnd);
    });

    // Simple evaluation logic
    const evaluation = {
      status: 'compliant',
      evidence: [],
      notes: ''
    };

    // Check if sufficient logging exists
    if (events.length === 0) {
      evaluation.status = 'non_compliant';
      evaluation.notes = 'No events logged during period';
      return evaluation;
    }

    evaluation.evidence.push({
      type: 'event_logs',
      count: events.length,
      period: `${periodStart} to ${periodEnd}`
    });

    // Check alert response
    if (periodAlerts.length > 0) {
      const resolvedAlerts = periodAlerts.filter(a => a.status === 'resolved');
      const resolveRate = (resolvedAlerts.length / periodAlerts.length * 100).toFixed(2);
      
      evaluation.evidence.push({
        type: 'alert_response',
        total_alerts: periodAlerts.length,
        resolved_alerts: resolvedAlerts.length,
        resolve_rate: `${resolveRate}%`
      });

      if (resolveRate < 80) {
        evaluation.status = 'partially_compliant';
        evaluation.notes = 'Alert resolution rate below 80%';
      }
    }

    return evaluation;
  }

  /**
   * Identify compliance gaps
   */
  async identifyGaps(report) {
    const gaps = [];

    // Check for non-compliant requirements
    report.requirements.forEach(req => {
      if (req.status === 'non_compliant') {
        gaps.push({
          requirement_id: req.requirement_id,
          title: req.title,
          severity: 'high',
          description: `Requirement ${req.requirement_id} is not compliant`,
          impact: 'Regulatory compliance violation'
        });
      } else if (req.status === 'partially_compliant') {
        gaps.push({
          requirement_id: req.requirement_id,
          title: req.title,
          severity: 'medium',
          description: `Requirement ${req.requirement_id} is partially compliant`,
          impact: 'Potential compliance issue'
        });
      }
    });

    return gaps;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(report) {
    const recommendations = [];

    // Based on compliance score
    if (report.compliance_score < 80) {
      recommendations.push({
        title: 'Improve Overall Compliance',
        description: 'Focus on addressing non-compliant requirements',
        priority: 'high',
        estimated_effort: 'high'
      });
    }

    // Based on gaps
    report.gaps.forEach(gap => {
      if (gap.severity === 'high') {
        recommendations.push({
          title: `Address ${gap.title}`,
          description: gap.description,
          priority: 'high',
          requirement_id: gap.requirement_id
        });
      }
    });

    // General recommendations
    recommendations.push({
      title: 'Regular Compliance Reviews',
      description: 'Schedule monthly compliance reviews to maintain standards',
      priority: 'medium',
      estimated_effort: 'low'
    });

    return recommendations;
  }

  /**
   * Publish report
   */
  async publishReport(id) {
    const report = await complianceReportRepository.findById(id);
    if (!report) {
      throw new Error('Report not found');
    }

    report.publish();
    return await complianceReportRepository.update(id, report);
  }

  /**
   * Get compliance dashboard data
   */
  async getDashboardData() {
    const reports = await complianceReportRepository.findAll();
    
    const latestReports = {};
    const frameworks = ['pci-dss', 'hipaa', 'sox', 'gdpr', 'iso27001'];

    frameworks.forEach(framework => {
      const frameworkReports = reports.filter(r => r.framework === framework);
      if (frameworkReports.length > 0) {
        latestReports[framework] = frameworkReports.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )[0];
      }
    });

    return {
      total_reports: reports.length,
      frameworks: frameworks.map(f => ({
        framework: f,
        latest_report: latestReports[f] ? {
          id: latestReports[f].id,
          compliance_score: latestReports[f].compliance_score,
          status: latestReports[f].status,
          created_at: latestReports[f].created_at
        } : null
      })),
      overall_compliance: this.calculateOverallCompliance(Object.values(latestReports))
    };
  }

  /**
   * Calculate overall compliance score
   */
  calculateOverallCompliance(reports) {
    if (reports.length === 0) return 0;

    const totalScore = reports.reduce((sum, r) => sum + parseFloat(r.compliance_score), 0);
    return (totalScore / reports.length).toFixed(2);
  }

  /**
   * Export report in various formats
   */
  async exportReport(id, format = 'json') {
    const report = await complianceReportRepository.findById(id);
    if (!report) {
      throw new Error('Report not found');
    }

    if (format === 'json') {
      return JSON.stringify(report.toJSON(), null, 2);
    } else if (format === 'summary') {
      return {
        id: report.id,
        name: report.name,
        framework: report.framework,
        compliance_score: report.compliance_score,
        period: `${report.period_start} to ${report.period_end}`,
        total_requirements: report.requirements.length,
        compliant: report.requirements.filter(r => r.status === 'compliant').length,
        non_compliant: report.requirements.filter(r => r.status === 'non_compliant').length,
        gaps: report.gaps.length,
        recommendations: report.recommendations.length,
        status: report.status
      };
    }

    return report.toJSON();
  }
}

module.exports = new ComplianceReportingService();
