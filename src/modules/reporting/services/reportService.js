/**
 * Report Service
 * Business logic for report generation and management
 */

const Report = require('../models/Report');
const ReportTemplate = require('../models/ReportTemplate');
const logger = require('../utils/logger');

class ReportService {
  /**
   * Create a new report
   */
  async createReport(reportData) {
    try {
      const report = new Report(reportData);
      await report.save();

      logger.info('Report created', { reportId: report.id });
      return report;
    } catch (error) {
      logger.error('Error creating report', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate report from template
   */
  async generateReport(templateId, parameters, userId) {
    try {
      const template = await ReportTemplate.findOne({ id: templateId });

      if (!template) {
        throw new Error('Report template not found');
      }

      // Create report record
      const report = new Report({
        name: `${template.name} - ${new Date().toISOString()}`,
        description: `Generated from template: ${template.name}`,
        template_id: templateId,
        type: template.type,
        parameters,
        format: parameters.format || 'pdf',
        status: 'generating',
        created_by: userId,
      });

      await report.save();

      // Simulate report generation (in production, this would be async job)
      setTimeout(async () => {
        try {
          const data = await this.collectReportData(template, parameters);

          report.data = data;
          report.status = 'completed';
          report.generated_at = new Date();
          report.file_url = `/reports/files/${report.id}.${report.format}`;
          report.file_size = Math.floor(Math.random() * 1000000) + 100000;

          await report.save();
          logger.info('Report generation completed', { reportId: report.id });
        } catch (err) {
          report.status = 'failed';
          report.error_message = err.message;
          await report.save();
          logger.error('Report generation failed', { reportId: report.id, error: err.message });
        }
      }, 0);

      return report;
    } catch (error) {
      logger.error('Error generating report', { templateId, error: error.message });
      throw error;
    }
  }

  /**
   * Collect data for report based on template and parameters
   */
  async collectReportData(template, parameters) {
    // Simulate data collection based on report type
    const data = {
      summary: {
        generated_at: new Date(),
        parameters,
        type: template.type,
      },
      sections: [],
    };

    // Add sections based on template
    if (template.template_data && template.template_data.sections) {
      data.sections = template.template_data.sections.map((section) => ({
        id: section.id,
        title: section.title,
        type: section.type,
        data: this.generateSectionData(section.type, parameters),
      }));
    }

    return data;
  }

  /**
   * Generate mock data for report section
   */
  generateSectionData(_sectionType, _parameters) {
    const mockData = {
      threats: [
        { name: 'Malware Campaign X', severity: 'critical', count: 45 },
        { name: 'Phishing Attack Y', severity: 'high', count: 128 },
        { name: 'DDoS Attempt Z', severity: 'medium', count: 23 },
      ],
      incidents: [
        { id: 'INC-001', status: 'resolved', priority: 'high' },
        { id: 'INC-002', status: 'investigating', priority: 'critical' },
      ],
      metrics: {
        mttd: 45,
        mttr: 120,
        false_positive_rate: 0.12,
        detection_rate: 0.95,
      },
    };

    return mockData;
  }

  /**
   * Get report by ID
   */
  async getReport(reportId) {
    try {
      const report = await Report.findOne({ id: reportId });

      if (!report) {
        throw new Error('Report not found');
      }

      return report;
    } catch (error) {
      logger.error('Error retrieving report', { reportId, error: error.message });
      throw error;
    }
  }

  /**
   * List reports with filters
   */
  async listReports(filters = {}) {
    try {
      const {
        type,
        status,
        created_by,
        page = 1,
        limit = 20,
      } = filters;

      const query = {};
      if (type) query.type = type;
      if (status) query.status = status;
      // eslint-disable-next-line camelcase
      if (created_by) query.created_by = created_by;

      const skip = (page - 1) * limit;

      const reports = await Report.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Report.countDocuments(query);

      return {
        reports,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error listing reports', { error: error.message });
      throw error;
    }
  }

  /**
   * Delete report
   */
  async deleteReport(reportId) {
    try {
      const result = await Report.deleteOne({ id: reportId });

      if (result.deletedCount === 0) {
        throw new Error('Report not found');
      }

      logger.info('Report deleted', { reportId });
      return { success: true };
    } catch (error) {
      logger.error('Error deleting report', { reportId, error: error.message });
      throw error;
    }
  }
}

module.exports = new ReportService();
