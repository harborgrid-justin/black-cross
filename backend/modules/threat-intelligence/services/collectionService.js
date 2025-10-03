/**
 * Threat Collection Service
 * Handles real-time threat data collection and aggregation
 */

const Threat = require('../models/Threat');
const logger = require('../utils/logger');
const { generateThreatHash, isDuplicate } = require('../utils/deduplication');

class CollectionService {
  /**
   * Collect and store new threat intelligence
   * @param {Object} threatData - Threat data to collect
   * @returns {Promise<Object>} Created threat
   */
  async collectThreat(threatData) {
    try {
      logger.info('Collecting new threat', { name: threatData.name });

      // Generate hash for deduplication
      const hash = generateThreatHash(threatData);

      // Check for existing threat with same hash
      const existingThreats = await Threat.find({
        name: threatData.name,
        type: threatData.type
      }).limit(10);

      for (const existing of existingThreats) {
        if (isDuplicate(threatData, existing.toObject())) {
          logger.info('Duplicate threat detected, updating existing', { id: existing.id });
          return this.updateExistingThreat(existing, threatData);
        }
      }

      // Create new threat
      const threat = new Threat({
        ...threatData,
        status: 'active',
        first_seen: new Date(),
        last_seen: new Date()
      });

      await threat.save();
      logger.info('Threat collected successfully', { id: threat.id });

      return threat;
    } catch (error) {
      logger.error('Error collecting threat', { error: error.message });
      throw error;
    }
  }

  /**
   * Update existing threat with new data
   * @param {Object} existingThreat - Existing threat document
   * @param {Object} newData - New threat data
   * @returns {Promise<Object>} Updated threat
   */
  async updateExistingThreat(existingThreat, newData) {
    try {
      // Merge indicators
      const existingIndicators = new Set(
        existingThreat.indicators.map(i => i.value)
      );
      const newIndicators = (newData.indicators || []).filter(
        i => !existingIndicators.has(i.value)
      );

      // Merge tags
      const mergedTags = [...new Set([
        ...existingThreat.tags,
        ...(newData.tags || [])
      ])];

      // Merge categories
      const mergedCategories = [...new Set([
        ...existingThreat.categories,
        ...(newData.categories || [])
      ])];

      // Update threat
      existingThreat.indicators.push(...newIndicators);
      existingThreat.tags = mergedTags;
      existingThreat.categories = mergedCategories;
      existingThreat.last_seen = new Date();
      existingThreat.confidence = Math.max(
        existingThreat.confidence,
        newData.confidence || 0
      );

      await existingThreat.save();
      logger.info('Existing threat updated', { id: existingThreat.id });

      return existingThreat;
    } catch (error) {
      logger.error('Error updating existing threat', { error: error.message });
      throw error;
    }
  }

  /**
   * Batch collect multiple threats
   * @param {Array} threatDataArray - Array of threat data
   * @returns {Promise<Object>} Collection results
   */
  async batchCollect(threatDataArray) {
    try {
      logger.info('Starting batch collection', { count: threatDataArray.length });

      const results = {
        collected: [],
        updated: [],
        failed: [],
        total: threatDataArray.length
      };

      for (const threatData of threatDataArray) {
        try {
          const threat = await this.collectThreat(threatData);
          if (threat.created_at.getTime() === threat.updated_at.getTime()) {
            results.collected.push(threat.id);
          } else {
            results.updated.push(threat.id);
          }
        } catch (error) {
          results.failed.push({
            data: threatData,
            error: error.message
          });
        }
      }

      logger.info('Batch collection completed', results);
      return results;
    } catch (error) {
      logger.error('Error in batch collection', { error: error.message });
      throw error;
    }
  }

  /**
   * Stream threats in real-time
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Recent threats
   */
  async streamThreats(filters = {}) {
    try {
      const query = { status: 'active' };

      if (filters.severity) {
        query.severity = filters.severity;
      }

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.since) {
        query.created_at = { $gte: new Date(filters.since) };
      }

      const threats = await Threat.find(query)
        .sort({ created_at: -1 })
        .limit(filters.limit || 100)
        .select('-enrichment_data');

      return threats;
    } catch (error) {
      logger.error('Error streaming threats', { error: error.message });
      throw error;
    }
  }

  /**
   * Validate threat data before collection
   * @param {Object} threatData - Threat data to validate
   * @returns {boolean} Validation result
   */
  validateThreatData(threatData) {
    const required = ['name', 'type', 'description'];
    for (const field of required) {
      if (!threatData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    return true;
  }
}

module.exports = new CollectionService();
