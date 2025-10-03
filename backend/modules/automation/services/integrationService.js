/**
 * Integration Management Service
 * Handles security tool integrations (Sub-Feature 15.4)
 */

const Integration = require('../models/Integration');
const logger = require('../utils/logger');

class IntegrationService {
  /**
   * Create integration
   * @param {Object} integrationData - Integration data
   * @returns {Promise<Object>} Created integration
   */
  async createIntegration(integrationData) {
    try {
      logger.info('Creating integration', {
        name: integrationData.name,
        type: integrationData.type,
      });

      const integration = new Integration(integrationData);
      await integration.save();

      logger.info('Integration created', { id: integration.id });

      return integration;
    } catch (error) {
      logger.error('Error creating integration', { error: error.message });
      throw error;
    }
  }

  /**
   * Update integration
   * @param {string} integrationId - Integration ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated integration
   */
  async updateIntegration(integrationId, updateData) {
    try {
      logger.info('Updating integration', { integration_id: integrationId });

      const integration = await Integration.findOne({ id: integrationId });

      if (!integration) {
        throw new Error('Integration not found');
      }

      Object.assign(integration, updateData);
      await integration.save();

      logger.info('Integration updated', { id: integration.id });

      return integration;
    } catch (error) {
      logger.error('Error updating integration', { error: error.message });
      throw error;
    }
  }

  /**
   * Delete integration
   * @param {string} integrationId - Integration ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteIntegration(integrationId) {
    try {
      logger.info('Deleting integration', { integration_id: integrationId });

      const result = await Integration.deleteOne({ id: integrationId });

      if (result.deletedCount === 0) {
        throw new Error('Integration not found');
      }

      logger.info('Integration deleted', { id: integrationId });

      return { deleted: true, id: integrationId };
    } catch (error) {
      logger.error('Error deleting integration', { error: error.message });
      throw error;
    }
  }

  /**
   * List integrations
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Integrations
   */
  async listIntegrations(filters = {}) {
    try {
      logger.info('Listing integrations', filters);

      const query = {};

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.vendor) {
        query.vendor = filters.vendor;
      }

      const integrations = await Integration.find(query)
        .sort({ created_at: -1 })
        .limit(filters.limit || 100)
        .select('-configuration.authentication.credentials_ref -__v');

      logger.info('Integrations retrieved', { count: integrations.length });

      return integrations;
    } catch (error) {
      logger.error('Error listing integrations', { error: error.message });
      throw error;
    }
  }

  /**
   * Get integration by ID
   * @param {string} integrationId - Integration ID
   * @returns {Promise<Object>} Integration details
   */
  async getIntegration(integrationId) {
    try {
      logger.info('Fetching integration', { integration_id: integrationId });

      const integration = await Integration.findOne({ id: integrationId })
        .select('-configuration.authentication.credentials_ref -__v');

      if (!integration) {
        throw new Error('Integration not found');
      }

      return integration;
    } catch (error) {
      logger.error('Error fetching integration', { error: error.message });
      throw error;
    }
  }

  /**
   * Test integration
   * @param {string} integrationId - Integration ID
   * @param {Object} testData - Test data
   * @returns {Promise<Object>} Test result
   */
  async testIntegration(integrationId, testData = {}) {
    try {
      logger.info('Testing integration', { integration_id: integrationId });

      const integration = await Integration.findOne({ id: integrationId });

      if (!integration) {
        throw new Error('Integration not found');
      }

      const testStartTime = Date.now();

      // Perform health check or test action
      const testResult = await this.performHealthCheck(integration);

      const responseTime = Date.now() - testStartTime;

      // Update health check status
      integration.health_check.last_check = new Date();
      integration.health_check.status = testResult.success ? 'healthy' : 'unhealthy';
      integration.health_check.message = testResult.message;

      // Update usage stats
      integration.usage_stats.total_calls++;
      if (testResult.success) {
        integration.usage_stats.successful_calls++;
        integration.status = 'active';
      } else {
        integration.usage_stats.failed_calls++;
        integration.status = 'error';
      }

      // Update average response time
      const totalTime = integration.usage_stats.average_response_time
                       * (integration.usage_stats.total_calls - 1);
      integration.usage_stats.average_response_time = Math.round(
        (totalTime + responseTime) / integration.usage_stats.total_calls,
      );

      integration.usage_stats.last_used = new Date();

      await integration.save();

      logger.info('Integration tested', {
        integration_id: integrationId,
        success: testResult.success,
        response_time: responseTime,
      });

      return {
        success: testResult.success,
        message: testResult.message,
        response_time: responseTime,
        status: integration.health_check.status,
      };
    } catch (error) {
      logger.error('Error testing integration', { error: error.message });
      throw error;
    }
  }

  /**
   * Perform health check on integration
   * @param {Object} integration - Integration object
   * @returns {Promise<Object>} Health check result
   */
  async performHealthCheck(integration) {
    try {
      // Simulate health check
      // In production, this would make actual API calls

      logger.info('Performing health check', {
        integration_id: integration.id,
        endpoint: integration.configuration.endpoint,
      });

      // Simulate success/failure
      const isHealthy = Math.random() > 0.1; // 90% success rate for simulation

      return {
        success: isHealthy,
        message: isHealthy ? 'Integration is healthy' : 'Integration health check failed',
      };
    } catch (error) {
      return {
        success: false,
        message: `Health check error: ${error.message}`,
      };
    }
  }

  /**
   * Get integration types
   * @returns {Array} Available integration types
   */
  getIntegrationTypes() {
    return [
      { type: 'edr', name: 'Endpoint Detection & Response', examples: ['CrowdStrike', 'Carbon Black', 'SentinelOne'] },
      { type: 'xdr', name: 'Extended Detection & Response', examples: ['Palo Alto Cortex', 'Microsoft Defender'] },
      { type: 'firewall', name: 'Firewall', examples: ['Palo Alto', 'Cisco', 'Fortinet'] },
      { type: 'siem', name: 'SIEM', examples: ['Splunk', 'QRadar', 'ArcSight'] },
      { type: 'email_gateway', name: 'Email Gateway', examples: ['Proofpoint', 'Mimecast'] },
      { type: 'identity', name: 'Identity Management', examples: ['Active Directory', 'Okta', 'Ping'] },
      { type: 'cloud', name: 'Cloud Security', examples: ['AWS Security Hub', 'Azure Security Center', 'GCP Security Command Center'] },
      { type: 'network', name: 'Network Devices', examples: ['Cisco Switches', 'Network Controllers'] },
      { type: 'ticketing', name: 'Ticketing Systems', examples: ['Jira', 'ServiceNow'] },
      { type: 'communication', name: 'Communication Platforms', examples: ['Slack', 'Teams', 'Email'] },
      { type: 'custom', name: 'Custom Integration', examples: ['Custom API'] },
    ];
  }

  /**
   * Get integration statistics
   * @returns {Promise<Object>} Integration statistics
   */
  async getStatistics() {
    try {
      const total = await Integration.countDocuments();
      const active = await Integration.countDocuments({ status: 'active' });
      const inactive = await Integration.countDocuments({ status: 'inactive' });
      const error = await Integration.countDocuments({ status: 'error' });

      const byType = await Integration.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
          },
        },
      ]);

      return {
        total,
        by_status: { active, inactive, error },
        by_type: byType.map((item) => ({ type: item._id, count: item.count })),
      };
    } catch (error) {
      logger.error('Error getting statistics', { error: error.message });
      throw error;
    }
  }
}

module.exports = new IntegrationService();
