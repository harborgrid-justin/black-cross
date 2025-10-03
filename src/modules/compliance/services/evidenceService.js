/**
 * Evidence Collection Service
 * Handles evidence collection and management for audits
 */

const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const Evidence = require('../models/Evidence');
const ComplianceControl = require('../models/ComplianceControl');
const logger = require('../utils/logger');

class EvidenceService {
  /**
   * Add new evidence
   * @param {Object} evidenceData - Evidence data
   * @returns {Promise<Object>} Created evidence
   */
  async addEvidence(evidenceData) {
    try {
      logger.info('Adding evidence', {
        control_id: evidenceData.control_id,
        evidence_type: evidenceData.evidence_type,
      });

      // Generate file hash if content is provided
      let fileHash = null;
      if (evidenceData.content) {
        fileHash = crypto.createHash('sha256')
          .update(evidenceData.content)
          .digest('hex');
      }

      const evidence = new Evidence({
        ...evidenceData,
        id: uuidv4(),
        evidence_id: `EVD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        collected_by: evidenceData.collected_by || 'system',
        file_hash: fileHash,
        chain_of_custody: [{
          user_id: evidenceData.collected_by || 'system',
          action: 'created',
          timestamp: new Date(),
          notes: 'Evidence initially collected',
        }],
      });

      await evidence.save();

      // Update control with evidence reference
      await ComplianceControl.findOneAndUpdate(
        { id: evidenceData.control_id },
        { $push: { evidence: evidence.id } },
      );

      logger.info('Evidence added successfully', { id: evidence.id });

      return evidence;
    } catch (error) {
      logger.error('Error adding evidence', { error: error.message });
      throw error;
    }
  }

  /**
   * Get evidence by control ID
   * @param {String} controlId - Control identifier
   * @returns {Promise<Array>} Evidence items
   */
  async getEvidenceByControl(controlId) {
    try {
      logger.info('Retrieving evidence for control', { controlId });

      const evidence = await Evidence.find({
        control_id: controlId,
      })
        .sort({ collected_at: -1 })
        .lean();

      logger.info('Evidence retrieved', {
        controlId,
        count: evidence.length,
      });

      return evidence;
    } catch (error) {
      logger.error('Error retrieving evidence', { error: error.message });
      throw error;
    }
  }

  /**
   * Get evidence by ID
   * @param {String} evidenceId - Evidence identifier
   * @returns {Promise<Object>} Evidence
   */
  async getEvidence(evidenceId) {
    try {
      logger.info('Retrieving evidence', { evidenceId });

      const evidence = await Evidence.findOne({ id: evidenceId }).lean();

      if (!evidence) {
        throw new Error('Evidence not found');
      }

      logger.info('Evidence retrieved', { id: evidence.id });
      return evidence;
    } catch (error) {
      logger.error('Error retrieving evidence', { error: error.message });
      throw error;
    }
  }

  /**
   * List evidence with filtering
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Evidence items
   */
  async listEvidence(filters = {}) {
    try {
      logger.info('Listing evidence', { filters });

      const query = {};

      if (filters.framework) {
        query.framework = filters.framework;
      }
      if (filters.evidence_type) {
        query.evidence_type = filters.evidence_type;
      }
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.collected_by) {
        query.collected_by = filters.collected_by;
      }

      const limit = parseInt(filters.limit, 10) || 50;
      const skip = parseInt(filters.skip, 10) || 0;

      const evidence = await Evidence.find(query)
        .sort({ collected_at: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await Evidence.countDocuments(query);

      logger.info('Evidence listed', { count: evidence.length, total });

      return {
        evidence,
        total,
        limit,
        skip,
      };
    } catch (error) {
      logger.error('Error listing evidence', { error: error.message });
      throw error;
    }
  }

  /**
   * Update evidence
   * @param {String} evidenceId - Evidence identifier
   * @param {Object} updates - Update data
   * @param {String} userId - User making the update
   * @returns {Promise<Object>} Updated evidence
   */
  async updateEvidence(evidenceId, updates, userId) {
    try {
      logger.info('Updating evidence', { evidenceId });

      // Add to chain of custody
      const custodyEntry = {
        user_id: userId,
        action: 'updated',
        timestamp: new Date(),
        notes: 'Evidence updated',
      };

      const evidence = await Evidence.findOneAndUpdate(
        { id: evidenceId },
        {
          $set: updates,
          $push: { chain_of_custody: custodyEntry },
        },
        { new: true },
      );

      if (!evidence) {
        throw new Error('Evidence not found');
      }

      logger.info('Evidence updated successfully', { id: evidence.id });
      return evidence;
    } catch (error) {
      logger.error('Error updating evidence', { error: error.message });
      throw error;
    }
  }

  /**
   * Review evidence
   * @param {String} evidenceId - Evidence identifier
   * @param {Object} reviewData - Review data
   * @returns {Promise<Object>} Updated evidence
   */
  async reviewEvidence(evidenceId, reviewData) {
    try {
      logger.info('Reviewing evidence', { evidenceId });

      const custodyEntry = {
        user_id: reviewData.reviewed_by,
        action: reviewData.status === 'approved' ? 'approved' : 'rejected',
        timestamp: new Date(),
        notes: reviewData.review_notes,
      };

      const evidence = await Evidence.findOneAndUpdate(
        { id: evidenceId },
        {
          $set: {
            status: reviewData.status,
            reviewed_by: reviewData.reviewed_by,
            review_date: new Date(),
            review_notes: reviewData.review_notes,
          },
          $push: { chain_of_custody: custodyEntry },
        },
        { new: true },
      );

      if (!evidence) {
        throw new Error('Evidence not found');
      }

      logger.info('Evidence reviewed successfully', {
        id: evidence.id,
        status: evidence.status,
      });

      return evidence;
    } catch (error) {
      logger.error('Error reviewing evidence', { error: error.message });
      throw error;
    }
  }

  /**
   * Archive evidence
   * @param {String} evidenceId - Evidence identifier
   * @param {String} userId - User archiving the evidence
   * @returns {Promise<Object>} Archived evidence
   */
  async archiveEvidence(evidenceId, userId) {
    try {
      logger.info('Archiving evidence', { evidenceId });

      const custodyEntry = {
        user_id: userId,
        action: 'archived',
        timestamp: new Date(),
        notes: 'Evidence archived',
      };

      const evidence = await Evidence.findOneAndUpdate(
        { id: evidenceId },
        {
          $set: { status: 'archived' },
          $push: { chain_of_custody: custodyEntry },
        },
        { new: true },
      );

      if (!evidence) {
        throw new Error('Evidence not found');
      }

      logger.info('Evidence archived successfully', { id: evidence.id });
      return evidence;
    } catch (error) {
      logger.error('Error archiving evidence', { error: error.message });
      throw error;
    }
  }

  /**
   * Get evidence statistics
   * @param {String} framework - Framework identifier
   * @returns {Promise<Object>} Evidence statistics
   */
  async getStatistics(framework) {
    try {
      logger.info('Calculating evidence statistics', { framework });

      const query = framework ? { framework } : {};

      const total = await Evidence.countDocuments(query);

      const byType = await Evidence.aggregate([
        { $match: query },
        { $group: { _id: '$evidence_type', count: { $sum: 1 } } },
      ]);

      const byStatus = await Evidence.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      logger.info('Evidence statistics calculated', { total });

      return {
        total,
        by_type: byType,
        by_status: byStatus,
        framework,
      };
    } catch (error) {
      logger.error('Error calculating evidence statistics', { error: error.message });
      throw error;
    }
  }

  /**
   * Verify evidence integrity
   * @param {String} evidenceId - Evidence identifier
   * @returns {Promise<Object>} Verification result
   */
  async verifyIntegrity(evidenceId) {
    try {
      logger.info('Verifying evidence integrity', { evidenceId });

      const evidence = await Evidence.findOne({ id: evidenceId }).lean();

      if (!evidence) {
        throw new Error('Evidence not found');
      }

      let integrityValid = true;
      let message = 'Evidence integrity verified';

      if (evidence.file_hash && evidence.content) {
        const currentHash = crypto.createHash('sha256')
          .update(evidence.content)
          .digest('hex');

        integrityValid = currentHash === evidence.file_hash;
        message = integrityValid
          ? 'Evidence integrity verified'
          : 'Evidence integrity check failed - content has been modified';
      }

      logger.info('Evidence integrity verification completed', {
        evidenceId,
        integrityValid,
      });

      return {
        evidence_id: evidenceId,
        integrity_valid: integrityValid,
        message,
        verified_at: new Date(),
      };
    } catch (error) {
      logger.error('Error verifying evidence integrity', { error: error.message });
      throw error;
    }
  }
}

module.exports = new EvidenceService();
