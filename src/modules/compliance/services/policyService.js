/**
 * Policy Management Service
 * Handles policy lifecycle management and enforcement
 */

const { v4: uuidv4 } = require('uuid');
const Policy = require('../models/Policy');
const logger = require('../utils/logger');

class PolicyService {
  /**
   * Create a new policy
   * @param {Object} policyData - Policy data
   * @returns {Promise<Object>} Created policy
   */
  async createPolicy(policyData) {
    try {
      logger.info('Creating new policy', { policy_id: policyData.policy_id });

      const policy = new Policy({
        ...policyData,
        id: uuidv4(),
        status: 'draft',
      });

      await policy.save();
      logger.info('Policy created successfully', { id: policy.id });

      return policy;
    } catch (error) {
      logger.error('Error creating policy', { error: error.message });
      throw error;
    }
  }

  /**
   * Get policy by ID
   * @param {String} policyId - Policy identifier
   * @returns {Promise<Object>} Policy
   */
  async getPolicy(policyId) {
    try {
      logger.info('Retrieving policy', { policyId });

      const policy = await Policy.findOne({ id: policyId }).lean();

      if (!policy) {
        throw new Error('Policy not found');
      }

      logger.info('Policy retrieved', { id: policy.id });
      return policy;
    } catch (error) {
      logger.error('Error retrieving policy', { error: error.message });
      throw error;
    }
  }

  /**
   * List policies with filtering
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Policies
   */
  async listPolicies(filters = {}) {
    try {
      logger.info('Listing policies', { filters });

      const query = {};

      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.category) {
        query.category = filters.category;
      }
      if (filters.owner) {
        query.owner = filters.owner;
      }
      if (filters.framework) {
        query.frameworks = filters.framework;
      }

      const limit = parseInt(filters.limit, 10) || 50;
      const skip = parseInt(filters.skip, 10) || 0;

      const policies = await Policy.find(query)
        .sort({ updated_at: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const total = await Policy.countDocuments(query);

      logger.info('Policies retrieved', { count: policies.length, total });

      return {
        policies,
        total,
        limit,
        skip,
      };
    } catch (error) {
      logger.error('Error listing policies', { error: error.message });
      throw error;
    }
  }

  /**
   * Update policy
   * @param {String} policyId - Policy identifier
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated policy
   */
  async updatePolicy(policyId, updates) {
    try {
      logger.info('Updating policy', { policyId });

      const policy = await Policy.findOneAndUpdate(
        { id: policyId },
        { $set: updates },
        { new: true },
      );

      if (!policy) {
        throw new Error('Policy not found');
      }

      logger.info('Policy updated successfully', { id: policy.id });
      return policy;
    } catch (error) {
      logger.error('Error updating policy', { error: error.message });
      throw error;
    }
  }

  /**
   * Approve policy
   * @param {String} policyId - Policy identifier
   * @param {Object} approvalData - Approval data
   * @returns {Promise<Object>} Approved policy
   */
  async approvePolicy(policyId, approvalData) {
    try {
      logger.info('Approving policy', { policyId });

      const policy = await Policy.findOneAndUpdate(
        { id: policyId, status: 'review' },
        {
          $set: {
            status: 'approved',
            approver: approvalData.approver,
            approval_date: new Date(),
          },
        },
        { new: true },
      );

      if (!policy) {
        throw new Error('Policy not found or not in review status');
      }

      logger.info('Policy approved successfully', { id: policy.id });
      return policy;
    } catch (error) {
      logger.error('Error approving policy', { error: error.message });
      throw error;
    }
  }

  /**
   * Publish policy
   * @param {String} policyId - Policy identifier
   * @param {Date} effectiveDate - Effective date
   * @returns {Promise<Object>} Published policy
   */
  async publishPolicy(policyId, effectiveDate) {
    try {
      logger.info('Publishing policy', { policyId });

      const policy = await Policy.findOneAndUpdate(
        { id: policyId, status: 'approved' },
        {
          $set: {
            status: 'published',
            effective_date: effectiveDate || new Date(),
          },
        },
        { new: true },
      );

      if (!policy) {
        throw new Error('Policy not found or not approved');
      }

      logger.info('Policy published successfully', { id: policy.id });
      return policy;
    } catch (error) {
      logger.error('Error publishing policy', { error: error.message });
      throw error;
    }
  }

  /**
   * Record policy acknowledgment
   * @param {String} policyId - Policy identifier
   * @param {Object} acknowledgmentData - Acknowledgment data
   * @returns {Promise<Object>} Updated policy
   */
  async acknowledgePolicy(policyId, acknowledgmentData) {
    try {
      logger.info('Recording policy acknowledgment', { policyId });

      const policy = await Policy.findOneAndUpdate(
        { id: policyId },
        {
          $push: {
            acknowledgments: {
              user_id: acknowledgmentData.user_id,
              username: acknowledgmentData.username,
              acknowledged_at: new Date(),
              version: acknowledgmentData.version,
            },
          },
        },
        { new: true },
      );

      if (!policy) {
        throw new Error('Policy not found');
      }

      logger.info('Policy acknowledgment recorded', {
        id: policy.id,
        user_id: acknowledgmentData.user_id,
      });

      return policy;
    } catch (error) {
      logger.error('Error recording acknowledgment', { error: error.message });
      throw error;
    }
  }

  /**
   * Get policies requiring review
   * @returns {Promise<Array>} Policies needing review
   */
  async getPoliciesForReview() {
    try {
      logger.info('Retrieving policies for review');

      const today = new Date();

      const policies = await Policy.find({
        status: 'published',
        next_review_date: { $lte: today },
      })
        .sort({ next_review_date: 1 })
        .lean();

      logger.info('Policies for review retrieved', { count: policies.length });

      return policies;
    } catch (error) {
      logger.error('Error retrieving policies for review', { error: error.message });
      throw error;
    }
  }

  /**
   * Add policy exception
   * @param {String} policyId - Policy identifier
   * @param {Object} exceptionData - Exception data
   * @returns {Promise<Object>} Updated policy
   */
  async addException(policyId, exceptionData) {
    try {
      logger.info('Adding policy exception', { policyId });

      const policy = await Policy.findOneAndUpdate(
        { id: policyId },
        {
          $push: {
            exceptions: {
              user_id: exceptionData.user_id,
              reason: exceptionData.reason,
              approved_by: exceptionData.approved_by,
              approval_date: new Date(),
              expiry_date: exceptionData.expiry_date,
            },
          },
        },
        { new: true },
      );

      if (!policy) {
        throw new Error('Policy not found');
      }

      logger.info('Policy exception added', { id: policy.id });
      return policy;
    } catch (error) {
      logger.error('Error adding policy exception', { error: error.message });
      throw error;
    }
  }

  /**
   * Archive policy
   * @param {String} policyId - Policy identifier
   * @returns {Promise<Object>} Archived policy
   */
  async archivePolicy(policyId) {
    try {
      logger.info('Archiving policy', { policyId });

      const policy = await Policy.findOneAndUpdate(
        { id: policyId },
        { $set: { status: 'archived' } },
        { new: true },
      );

      if (!policy) {
        throw new Error('Policy not found');
      }

      logger.info('Policy archived successfully', { id: policy.id });
      return policy;
    } catch (error) {
      logger.error('Error archiving policy', { error: error.message });
      throw error;
    }
  }
}

module.exports = new PolicyService();
