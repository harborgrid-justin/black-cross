/**
 * Regulatory Requirement Tracking Service
 * Handles tracking and management of regulatory requirements
 */

const { v4: uuidv4 } = require('uuid');
const RegulatoryRequirement = require('../models/RegulatoryRequirement');
const logger = require('../utils/logger');

class RequirementService {
  /**
   * Track a new regulatory requirement
   * @param {Object} requirementData - Requirement data
   * @returns {Promise<Object>} Created requirement
   */
  async trackRequirement(requirementData) {
    try {
      logger.info('Tracking new regulatory requirement', {
        requirement_id: requirementData.requirement_id,
        regulation: requirementData.regulation,
      });

      const requirement = new RegulatoryRequirement({
        ...requirementData,
        id: uuidv4(),
      });

      await requirement.save();
      logger.info('Requirement tracked successfully', { id: requirement.id });

      return requirement;
    } catch (error) {
      logger.error('Error tracking requirement', { error: error.message });
      throw error;
    }
  }

  /**
   * Get all requirements with filtering
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Requirements
   */
  async getRequirements(filters = {}) {
    try {
      logger.info('Retrieving regulatory requirements', { filters });

      const query = {};

      if (filters.jurisdiction) {
        query.jurisdiction = filters.jurisdiction;
      }
      if (filters.regulation) {
        query.regulation = filters.regulation;
      }
      if (filters.category) {
        query.category = filters.category;
      }
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.compliance_status) {
        query.compliance_status = filters.compliance_status;
      }
      if (filters.owner) {
        query.owner = filters.owner;
      }

      const limit = parseInt(filters.limit, 10) || 50;
      const skip = parseInt(filters.skip, 10) || 0;

      const requirements = await RegulatoryRequirement.find(query)
        .sort({ effective_date: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await RegulatoryRequirement.countDocuments(query);

      logger.info('Requirements retrieved', { count: requirements.length, total });

      return {
        requirements,
        total,
        limit,
        skip,
      };
    } catch (error) {
      logger.error('Error retrieving requirements', { error: error.message });
      throw error;
    }
  }

  /**
   * Get requirement by ID
   * @param {String} requirementId - Requirement identifier
   * @returns {Promise<Object>} Requirement
   */
  async getRequirement(requirementId) {
    try {
      logger.info('Retrieving requirement', { requirementId });

      const requirement = await RegulatoryRequirement.findOne({
        id: requirementId,
      }).lean();

      if (!requirement) {
        throw new Error('Requirement not found');
      }

      logger.info('Requirement retrieved', { id: requirement.id });
      return requirement;
    } catch (error) {
      logger.error('Error retrieving requirement', { error: error.message });
      throw error;
    }
  }

  /**
   * Update requirement
   * @param {String} requirementId - Requirement identifier
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated requirement
   */
  async updateRequirement(requirementId, updates) {
    try {
      logger.info('Updating requirement', { requirementId });

      const requirement = await RegulatoryRequirement.findOneAndUpdate(
        { id: requirementId },
        { $set: updates },
        { new: true },
      );

      if (!requirement) {
        throw new Error('Requirement not found');
      }

      logger.info('Requirement updated successfully', { id: requirement.id });
      return requirement;
    } catch (error) {
      logger.error('Error updating requirement', { error: error.message });
      throw error;
    }
  }

  /**
   * Get upcoming deadlines
   * @param {Number} days - Number of days to look ahead
   * @returns {Promise<Array>} Requirements with upcoming deadlines
   */
  async getUpcomingDeadlines(days = 30) {
    try {
      logger.info('Retrieving upcoming deadlines', { days });

      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      const requirements = await RegulatoryRequirement.find({
        compliance_deadline: {
          $gte: today,
          $lte: futureDate,
        },
        compliance_status: { $ne: 'compliant' },
      })
        .sort({ compliance_deadline: 1 })
        .lean();

      logger.info('Upcoming deadlines retrieved', { count: requirements.length });

      return requirements;
    } catch (error) {
      logger.error('Error retrieving upcoming deadlines', { error: error.message });
      throw error;
    }
  }

  /**
   * Get overdue requirements
   * @returns {Promise<Array>} Overdue requirements
   */
  async getOverdueRequirements() {
    try {
      logger.info('Retrieving overdue requirements');

      const today = new Date();

      const requirements = await RegulatoryRequirement.find({
        compliance_deadline: { $lt: today },
        compliance_status: { $ne: 'compliant' },
        status: 'active',
      })
        .sort({ compliance_deadline: 1 })
        .lean();

      logger.info('Overdue requirements retrieved', { count: requirements.length });

      return requirements;
    } catch (error) {
      logger.error('Error retrieving overdue requirements', { error: error.message });
      throw error;
    }
  }

  /**
   * Update compliance status
   * @param {String} requirementId - Requirement identifier
   * @param {Object} statusData - Status update data
   * @returns {Promise<Object>} Updated requirement
   */
  async updateComplianceStatus(requirementId, statusData) {
    try {
      logger.info('Updating compliance status', { requirementId });

      const requirement = await RegulatoryRequirement.findOneAndUpdate(
        { id: requirementId },
        {
          $set: {
            compliance_status: statusData.compliance_status,
            assessment_date: new Date(),
            implementation_notes: statusData.implementation_notes,
          },
        },
        { new: true },
      );

      if (!requirement) {
        throw new Error('Requirement not found');
      }

      logger.info('Compliance status updated', {
        id: requirement.id,
        status: requirement.compliance_status,
      });

      return requirement;
    } catch (error) {
      logger.error('Error updating compliance status', { error: error.message });
      throw error;
    }
  }

  /**
   * Add requirement update
   * @param {String} requirementId - Requirement identifier
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated requirement
   */
  async addUpdate(requirementId, updateData) {
    try {
      logger.info('Adding requirement update', { requirementId });

      const requirement = await RegulatoryRequirement.findOneAndUpdate(
        { id: requirementId },
        {
          $push: {
            updates: {
              date: new Date(),
              description: updateData.description,
              impact: updateData.impact,
              updated_by: updateData.updated_by,
            },
          },
        },
        { new: true },
      );

      if (!requirement) {
        throw new Error('Requirement not found');
      }

      logger.info('Requirement update added', { id: requirement.id });
      return requirement;
    } catch (error) {
      logger.error('Error adding requirement update', { error: error.message });
      throw error;
    }
  }

  /**
   * Get requirements by jurisdiction
   * @param {String} jurisdiction - Jurisdiction name
   * @returns {Promise<Array>} Requirements
   */
  async getRequirementsByJurisdiction(jurisdiction) {
    try {
      logger.info('Retrieving requirements by jurisdiction', { jurisdiction });

      const requirements = await RegulatoryRequirement.find({
        jurisdiction,
      })
        .sort({ effective_date: -1 })
        .lean();

      logger.info('Requirements by jurisdiction retrieved', {
        jurisdiction,
        count: requirements.length,
      });

      return requirements;
    } catch (error) {
      logger.error('Error retrieving requirements by jurisdiction', { error: error.message });
      throw error;
    }
  }

  /**
   * Get compliance calendar
   * @param {Number} months - Number of months to look ahead
   * @returns {Promise<Array>} Calendar events
   */
  async getComplianceCalendar(months = 6) {
    try {
      logger.info('Generating compliance calendar', { months });

      const today = new Date();
      const futureDate = new Date();
      futureDate.setMonth(today.getMonth() + months);

      const requirements = await RegulatoryRequirement.find({
        $or: [
          { compliance_deadline: { $gte: today, $lte: futureDate } },
          { next_assessment_date: { $gte: today, $lte: futureDate } },
        ],
        status: 'active',
      })
        .sort({ compliance_deadline: 1 })
        .lean();

      const calendar = requirements.map((req) => ({
        requirement_id: req.requirement_id,
        title: req.title,
        regulation: req.regulation,
        deadline: req.compliance_deadline,
        assessment_date: req.next_assessment_date,
        severity: req.severity,
        compliance_status: req.compliance_status,
      }));

      logger.info('Compliance calendar generated', {
        events: calendar.length,
      });

      return calendar;
    } catch (error) {
      logger.error('Error generating compliance calendar', { error: error.message });
      throw error;
    }
  }

  /**
   * Get requirement statistics
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics() {
    try {
      logger.info('Calculating requirement statistics');

      const total = await RegulatoryRequirement.countDocuments();

      const byStatus = await RegulatoryRequirement.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      const byComplianceStatus = await RegulatoryRequirement.aggregate([
        { $group: { _id: '$compliance_status', count: { $sum: 1 } } },
      ]);

      const byJurisdiction = await RegulatoryRequirement.aggregate([
        { $group: { _id: '$jurisdiction', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const byCategory = await RegulatoryRequirement.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]);

      logger.info('Requirement statistics calculated', { total });

      return {
        total,
        by_status: byStatus,
        by_compliance_status: byComplianceStatus,
        by_jurisdiction: byJurisdiction,
        by_category: byCategory,
      };
    } catch (error) {
      logger.error('Error calculating requirement statistics', { error: error.message });
      throw error;
    }
  }
}

module.exports = new RequirementService();
