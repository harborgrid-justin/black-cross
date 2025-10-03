/**
 * Audit Trail Service
 * Handles comprehensive audit logging and tracking
 */

const { v4: uuidv4 } = require('uuid');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

class AuditService {
  /**
   * Create an audit log entry
   * @param {Object} logData - Audit log data
   * @returns {Promise<Object>} Created log entry
   */
  async createLog(logData) {
    try {
      const auditLog = new AuditLog({
        ...logData,
        id: uuidv4(),
        timestamp: new Date(),
      });

      await auditLog.save();
      logger.info('Audit log created', {
        id: auditLog.id,
        action: auditLog.action,
        user_id: auditLog.user_id,
      });

      return auditLog;
    } catch (error) {
      logger.error('Error creating audit log', { error: error.message });
      throw error;
    }
  }

  /**
   * Get audit logs with filtering
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Audit logs
   */
  async getLogs(filters = {}) {
    try {
      logger.info('Retrieving audit logs', { filters });

      const query = {};

      if (filters.user_id) {
        query.user_id = filters.user_id;
      }
      if (filters.action) {
        query.action = filters.action;
      }
      if (filters.resource_type) {
        query.resource_type = filters.resource_type;
      }
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.severity) {
        query.severity = filters.severity;
      }
      if (filters.start_date && filters.end_date) {
        query.timestamp = {
          $gte: new Date(filters.start_date),
          $lte: new Date(filters.end_date),
        };
      }

      const limit = parseInt(filters.limit, 10) || 100;
      const skip = parseInt(filters.skip, 10) || 0;

      const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await AuditLog.countDocuments(query);

      logger.info('Audit logs retrieved', { count: logs.length, total });

      return {
        logs,
        total,
        limit,
        skip,
      };
    } catch (error) {
      logger.error('Error retrieving audit logs', { error: error.message });
      throw error;
    }
  }

  /**
   * Get audit logs for a specific user
   * @param {String} userId - User identifier
   * @param {Object} options - Query options
   * @returns {Promise<Array>} User audit logs
   */
  async getUserLogs(userId, options = {}) {
    try {
      logger.info('Retrieving user audit logs', { userId });

      const limit = parseInt(options.limit, 10) || 100;
      const skip = parseInt(options.skip, 10) || 0;

      const query = { user_id: userId };

      if (options.start_date && options.end_date) {
        query.timestamp = {
          $gte: new Date(options.start_date),
          $lte: new Date(options.end_date),
        };
      }

      const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await AuditLog.countDocuments(query);

      logger.info('User audit logs retrieved', {
        userId,
        count: logs.length,
        total,
      });

      return {
        user_id: userId,
        logs,
        total,
        limit,
        skip,
      };
    } catch (error) {
      logger.error('Error retrieving user audit logs', { error: error.message });
      throw error;
    }
  }

  /**
   * Search audit logs
   * @param {Object} searchCriteria - Search criteria
   * @returns {Promise<Array>} Matching audit logs
   */
  async searchLogs(searchCriteria) {
    try {
      logger.info('Searching audit logs', { searchCriteria });

      const query = {};

      if (searchCriteria.keyword) {
        query.$or = [
          { details: { $regex: searchCriteria.keyword, $options: 'i' } },
          { username: { $regex: searchCriteria.keyword, $options: 'i' } },
          { resource_type: { $regex: searchCriteria.keyword, $options: 'i' } },
        ];
      }

      if (searchCriteria.actions && searchCriteria.actions.length > 0) {
        query.action = { $in: searchCriteria.actions };
      }

      if (searchCriteria.severities && searchCriteria.severities.length > 0) {
        query.severity = { $in: searchCriteria.severities };
      }

      const limit = parseInt(searchCriteria.limit, 10) || 100;
      const skip = parseInt(searchCriteria.skip, 10) || 0;

      const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await AuditLog.countDocuments(query);

      logger.info('Audit log search completed', {
        count: logs.length,
        total,
      });

      return {
        logs,
        total,
        limit,
        skip,
        search_criteria: searchCriteria,
      };
    } catch (error) {
      logger.error('Error searching audit logs', { error: error.message });
      throw error;
    }
  }

  /**
   * Export audit logs
   * @param {Object} filters - Filter criteria
   * @param {String} format - Export format
   * @returns {Promise<Object>} Export result
   */
  async exportLogs(filters, format = 'json') {
    try {
      logger.info('Exporting audit logs', { filters, format });

      const query = {};

      if (filters.start_date && filters.end_date) {
        query.timestamp = {
          $gte: new Date(filters.start_date),
          $lte: new Date(filters.end_date),
        };
      }

      const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .lean();

      logger.info('Audit logs exported', { count: logs.length, format });

      return {
        format,
        count: logs.length,
        data: logs,
        exported_at: new Date(),
      };
    } catch (error) {
      logger.error('Error exporting audit logs', { error: error.message });
      throw error;
    }
  }

  /**
   * Get audit statistics
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Audit statistics
   */
  async getStatistics(filters = {}) {
    try {
      logger.info('Calculating audit statistics', { filters });

      const query = {};

      if (filters.start_date && filters.end_date) {
        query.timestamp = {
          $gte: new Date(filters.start_date),
          $lte: new Date(filters.end_date),
        };
      }

      const total = await AuditLog.countDocuments(query);

      const actionStats = await AuditLog.aggregate([
        { $match: query },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const userStats = await AuditLog.aggregate([
        { $match: query },
        { $group: { _id: '$user_id', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      const severityStats = await AuditLog.aggregate([
        { $match: query },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]);

      logger.info('Audit statistics calculated', { total });

      return {
        total,
        by_action: actionStats,
        top_users: userStats,
        by_severity: severityStats,
        period: {
          start: filters.start_date,
          end: filters.end_date,
        },
      };
    } catch (error) {
      logger.error('Error calculating audit statistics', { error: error.message });
      throw error;
    }
  }
}

module.exports = new AuditService();
