/**
 * Threat Categorization Service
 * Handles threat categorization and tagging
 */

const Threat = require('../models/Threat');
const Taxonomy = require('../models/Taxonomy');
const logger = require('../utils/logger');

class CategorizationService {
  /**
   * Categorize a threat
   * @param {string} threatId - Threat ID
   * @param {Array} categories - Categories to assign
   * @returns {Promise<Object>} Updated threat
   */
  async categorizeThreat(threatId, categories) {
    try {
      logger.info('Categorizing threat', { threatId, categories });

      const threat = await Threat.findOne({ id: threatId });
      if (!threat) {
        throw new Error('Threat not found');
      }

      // Merge with existing categories
      threat.categories = [...new Set([...threat.categories, ...categories])];
      await threat.save();

      logger.info('Threat categorized successfully', { threatId });
      return threat;
    } catch (error) {
      logger.error('Error categorizing threat', { error: error.message });
      throw error;
    }
  }

  /**
   * Auto-categorize threat using ML and pattern matching
   * @param {string} threatId - Threat ID
   * @returns {Promise<Object>} Updated threat with categories
   */
  async autoCategorizeThreat(threatId) {
    try {
      logger.info('Auto-categorizing threat', { threatId });

      const threat = await Threat.findOne({ id: threatId });
      if (!threat) {
        throw new Error('Threat not found');
      }

      const suggestedCategories = [];

      // Rule-based categorization
      if (threat.type === 'malware') {
        suggestedCategories.push('malware');

        // Check for specific malware types
        const name = threat.name.toLowerCase();
        const desc = threat.description.toLowerCase();

        if (name.includes('ransom') || desc.includes('ransom')) {
          suggestedCategories.push('ransomware', 'extortion');
        }
        if (name.includes('trojan') || desc.includes('trojan')) {
          suggestedCategories.push('trojan');
        }
        if (name.includes('rat') || desc.includes('remote access')) {
          suggestedCategories.push('remote-access-trojan');
        }
      }

      if (threat.type === 'phishing') {
        suggestedCategories.push('phishing', 'social-engineering');

        const desc = threat.description.toLowerCase();
        if (desc.includes('credential') || desc.includes('login')) {
          suggestedCategories.push('credential-theft');
        }
      }

      // MITRE ATT&CK categorization
      if (threat.mitre_attack?.tactics?.length) {
        suggestedCategories.push(...threat.mitre_attack.tactics.map((t) => `mitre-${t.toLowerCase()}`));
      }

      // Severity-based categorization
      if (threat.severity === 'critical' || threat.severity === 'high') {
        suggestedCategories.push('high-priority');
      }

      // Apply suggested categories
      threat.categories = [...new Set([...threat.categories, ...suggestedCategories])];
      await threat.save();

      logger.info('Threat auto-categorized', { threatId, categories: suggestedCategories });
      return threat;
    } catch (error) {
      logger.error('Error auto-categorizing threat', { error: error.message });
      throw error;
    }
  }

  /**
   * Add tags to a threat
   * @param {string} threatId - Threat ID
   * @param {Array} tags - Tags to add
   * @returns {Promise<Object>} Updated threat
   */
  async addTags(threatId, tags) {
    try {
      logger.info('Adding tags to threat', { threatId, tags });

      const threat = await Threat.findOne({ id: threatId });
      if (!threat) {
        throw new Error('Threat not found');
      }

      threat.tags = [...new Set([...threat.tags, ...tags])];
      await threat.save();

      logger.info('Tags added successfully', { threatId });
      return threat;
    } catch (error) {
      logger.error('Error adding tags', { error: error.message });
      throw error;
    }
  }

  /**
   * Remove tags from a threat
   * @param {string} threatId - Threat ID
   * @param {Array} tags - Tags to remove
   * @returns {Promise<Object>} Updated threat
   */
  async removeTags(threatId, tags) {
    try {
      logger.info('Removing tags from threat', { threatId, tags });

      const threat = await Threat.findOne({ id: threatId });
      if (!threat) {
        throw new Error('Threat not found');
      }

      threat.tags = threat.tags.filter((tag) => !tags.includes(tag));
      await threat.save();

      logger.info('Tags removed successfully', { threatId });
      return threat;
    } catch (error) {
      logger.error('Error removing tags', { error: error.message });
      throw error;
    }
  }

  /**
   * Get all available categories
   * @returns {Promise<Object>} Categories from taxonomies
   */
  async getCategories() {
    try {
      const taxonomies = await Taxonomy.find({ is_active: true })
        .select('name categories');

      const allCategories = [];
      for (const taxonomy of taxonomies) {
        for (const category of taxonomy.categories) {
          allCategories.push({
            taxonomy: taxonomy.name,
            category: category.name,
            description: category.description,
            level: category.level,
          });
        }
      }

      // Add default categories
      const defaultCategories = [
        'malware', 'phishing', 'ransomware', 'apt', 'botnet',
        'ddos', 'vulnerability', 'exploit', 'high-priority',
        'credential-theft', 'social-engineering', 'data-exfiltration',
      ];

      return {
        taxonomies: allCategories,
        defaults: defaultCategories,
        total: allCategories.length + defaultCategories.length,
      };
    } catch (error) {
      logger.error('Error getting categories', { error: error.message });
      throw error;
    }
  }

  /**
   * Search threats by categories or tags
   * @param {Object} filters - Search filters
   * @returns {Promise<Array>} Matching threats
   */
  async searchByCategoriesOrTags(filters) {
    try {
      const query = {};

      if (filters.categories?.length) {
        query.categories = { $in: filters.categories };
      }

      if (filters.tags?.length) {
        query.tags = { $in: filters.tags };
      }

      if (filters.severity) {
        query.severity = filters.severity;
      }

      const threats = await Threat.find(query)
        .sort({ created_at: -1 })
        .limit(filters.limit || 100);

      return threats;
    } catch (error) {
      logger.error('Error searching by categories/tags', { error: error.message });
      throw error;
    }
  }
}

module.exports = new CategorizationService();
