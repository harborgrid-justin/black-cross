/**
 * ComplianceReport Repository
 * 
 * Handles data persistence for compliance reports
 */

const ComplianceReport = require('../models/ComplianceReport');

class ComplianceReportRepository {
  constructor() {
    this.reports = new Map();
  }

  /**
   * Create new compliance report
   */
  async create(reportData) {
    const report = new ComplianceReport(reportData);
    this.reports.set(report.id, report);
    return report;
  }

  /**
   * Find report by ID
   */
  async findById(id) {
    return this.reports.get(id) || null;
  }

  /**
   * Find all reports
   */
  async findAll(filters = {}) {
    let reports = Array.from(this.reports.values());

    if (filters.framework) {
      reports = reports.filter(r => r.framework === filters.framework);
    }

    if (filters.report_type) {
      reports = reports.filter(r => r.report_type === filters.report_type);
    }

    if (filters.status) {
      reports = reports.filter(r => r.status === filters.status);
    }

    return reports;
  }

  /**
   * Find reports by framework
   */
  async findByFramework(framework) {
    return Array.from(this.reports.values()).filter(r => r.framework === framework);
  }

  /**
   * Update report
   */
  async update(id, updates) {
    const report = this.reports.get(id);
    if (!report) return null;

    Object.assign(report, updates);
    report.updated_at = new Date();
    this.reports.set(id, report);
    return report;
  }

  /**
   * Delete report
   */
  async delete(id) {
    return this.reports.delete(id);
  }

  /**
   * Clear all reports (for testing)
   */
  async clear() {
    this.reports.clear();
  }
}

module.exports = new ComplianceReportRepository();
