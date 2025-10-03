/**
 * Threat Archival Service
 * Handles historical threat data archival
 */

const Threat = require('../models/Threat');
const logger = require('../utils/logger');

class ArchivalService {
  /**
   * Archive threats based on criteria
   * @param {Object} criteria - Archival criteria
   * @returns {Promise<Object>} Archival results
   */
  async archiveThreats(criteria) {
    try {
      logger.info('Starting threat archival', { criteria });

      const query = { status: { $ne: 'archived' } };

      // Archive by IDs
      if (criteria.threat_ids?.length) {
        query.id = { $in: criteria.threat_ids };
      }

      // Archive by age
      if (criteria.older_than_days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - criteria.older_than_days);
        query.last_seen = { $lt: cutoffDate };
      }

      // Archive by status
      if (criteria.status) {
        query.status = criteria.status;
      }

      const result = await Threat.updateMany(
        query,
        {
          $set: {
            status: 'archived',
            archived_at: new Date(),
          },
        },
      );

      logger.info('Threats archived successfully', {
        count: result.modifiedCount,
      });

      return {
        archived_count: result.modifiedCount,
        criteria,
      };
    } catch (error) {
      logger.error('Error archiving threats', { error: error.message });
      throw error;
    }
  }

  /**
   * Retrieve historical threats
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Historical threats
   */
  async getHistoricalThreats(filters = {}) {
    try {
      const query = { status: 'archived' };

      if (filters.from_date) {
        query.archived_at = { $gte: new Date(filters.from_date) };
      }

      if (filters.to_date) {
        query.archived_at = query.archived_at || {};
        query.archived_at.$lte = new Date(filters.to_date);
      }

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.severity) {
        query.severity = filters.severity;
      }

      const threats = await Threat.find(query)
        .sort({ archived_at: -1 })
        .limit(filters.limit || 1000)
        .select(filters.fields || '-enrichment_data');

      return threats;
    } catch (error) {
      logger.error('Error retrieving historical threats', { error: error.message });
      throw error;
    }
  }

  /**
   * Restore archived threats
   * @param {Array} threatIds - Threat IDs to restore
   * @returns {Promise<Object>} Restoration results
   */
  async restoreThreats(threatIds) {
    try {
      logger.info('Restoring archived threats', { count: threatIds.length });

      const result = await Threat.updateMany(
        { id: { $in: threatIds }, status: 'archived' },
        {
          $set: {
            status: 'active',
            archived_at: null,
          },
        },
      );

      logger.info('Threats restored successfully', {
        count: result.modifiedCount,
      });

      return {
        restored_count: result.modifiedCount,
      };
    } catch (error) {
      logger.error('Error restoring threats', { error: error.message });
      throw error;
    }
  }

  /**
   * Permanently delete archived threats
   * @param {Object} criteria - Deletion criteria
   * @returns {Promise<Object>} Deletion results
   */
  async deleteArchivedThreats(criteria) {
    try {
      logger.info('Deleting archived threats', { criteria });

      const query = { status: 'archived' };

      // Only delete if archived before certain date
      if (criteria.archived_before_days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - criteria.archived_before_days);
        query.archived_at = { $lt: cutoffDate };
      }

      const result = await Threat.deleteMany(query);

      logger.info('Archived threats deleted', { count: result.deletedCount });

      return {
        deleted_count: result.deletedCount,
      };
    } catch (error) {
      logger.error('Error deleting archived threats', { error: error.message });
      throw error;
    }
  }

  /**
   * Get archival statistics
   * @returns {Promise<Object>} Statistics
   */
  async getArchivalStats() {
    try {
      const stats = await Threat.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            oldest: { $min: '$archived_at' },
            newest: { $max: '$archived_at' },
          },
        },
      ]);

      const totalActive = await Threat.countDocuments({ status: 'active' });
      const totalArchived = await Threat.countDocuments({ status: 'archived' });
      const totalInactive = await Threat.countDocuments({ status: 'inactive' });

      return {
        active: totalActive,
        archived: totalArchived,
        inactive: totalInactive,
        total: totalActive + totalArchived + totalInactive,
        details: stats,
      };
    } catch (error) {
      logger.error('Error getting archival stats', { error: error.message });
      throw error;
    }
  }

  /**
   * Apply retention policy
   * @param {Object} policy - Retention policy configuration
   * @returns {Promise<Object>} Policy application results
   */
  async applyRetentionPolicy(policy) {
    try {
      logger.info('Applying retention policy', { policy });

      const results = {
        archived: 0,
        deleted: 0,
      };

      // Archive old active threats
      if (policy.archive_after_days) {
        const archiveResult = await this.archiveThreats({
          older_than_days: policy.archive_after_days,
          status: 'active',
        });
        results.archived = archiveResult.archived_count;
      }

      // Delete old archived threats
      if (policy.delete_after_days) {
        const deleteResult = await this.deleteArchivedThreats({
          archived_before_days: policy.delete_after_days,
        });
        results.deleted = deleteResult.deleted_count;
      }

      logger.info('Retention policy applied', results);
      return results;
    } catch (error) {
      logger.error('Error applying retention policy', { error: error.message });
      throw error;
    }
  }
}

module.exports = new ArchivalService();
