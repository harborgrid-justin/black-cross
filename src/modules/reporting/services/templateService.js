/**
 * Report Template Service
 * Business logic for report template management
 */

const ReportTemplate = require('../models/ReportTemplate');
const logger = require('../utils/logger');

class TemplateService {
  /**
   * Create a new report template
   */
  async createTemplate(templateData) {
    try {
      const template = new ReportTemplate(templateData);
      await template.save();

      logger.info('Report template created', { templateId: template.id });
      return template;
    } catch (error) {
      logger.error('Error creating report template', { error: error.message });
      throw error;
    }
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId) {
    try {
      const template = await ReportTemplate.findOne({ id: templateId });

      if (!template) {
        throw new Error('Report template not found');
      }

      return template;
    } catch (error) {
      logger.error('Error retrieving report template', { templateId, error: error.message });
      throw error;
    }
  }

  /**
   * Update template
   */
  async updateTemplate(templateId, updates) {
    try {
      const template = await ReportTemplate.findOneAndUpdate(
        { id: templateId },
        { $set: updates },
        { new: true, runValidators: true },
      );

      if (!template) {
        throw new Error('Report template not found');
      }

      logger.info('Report template updated', { templateId });
      return template;
    } catch (error) {
      logger.error('Error updating report template', { templateId, error: error.message });
      throw error;
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId) {
    try {
      const result = await ReportTemplate.deleteOne({ id: templateId });

      if (result.deletedCount === 0) {
        throw new Error('Report template not found');
      }

      logger.info('Report template deleted', { templateId });
      return { success: true };
    } catch (error) {
      logger.error('Error deleting report template', { templateId, error: error.message });
      throw error;
    }
  }

  /**
   * List templates with filters
   */
  async listTemplates(filters = {}) {
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

      const templates = await ReportTemplate.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      const total = await ReportTemplate.countDocuments(query);

      return {
        templates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error listing report templates', { error: error.message });
      throw error;
    }
  }

  /**
   * Clone template
   */
  async cloneTemplate(templateId, newName, userId) {
    try {
      const original = await this.getTemplate(templateId);

      const clonedData = {
        name: newName,
        description: `Cloned from ${original.name}`,
        type: original.type,
        template_data: original.template_data,
        data_bindings: original.data_bindings,
        parameters: original.parameters,
        created_by: userId,
        tags: original.tags,
      };

      return await this.createTemplate(clonedData);
    } catch (error) {
      logger.error('Error cloning report template', { templateId, error: error.message });
      throw error;
    }
  }
}

module.exports = new TemplateService();
