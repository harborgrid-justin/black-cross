/**
 * CustomFeed Repository
 *
 * Data access layer for custom feed operations
 */

const { CustomFeed } = require('../models');

class CustomFeedRepository {
  constructor() {
    this.customFeeds = new Map();
  }

  /**
   * Create a new custom feed
   */
  async create(customFeedData) {
    const customFeed = new CustomFeed(customFeedData);
    this.customFeeds.set(customFeed.id, customFeed);
    return customFeed;
  }

  /**
   * Find custom feed by ID
   */
  async findById(id) {
    return this.customFeeds.get(id) || null;
  }

  /**
   * Find custom feed by name
   */
  async findByName(name) {
    return Array.from(this.customFeeds.values()).find((f) => f.name === name) || null;
  }

  /**
   * Find all custom feeds with optional filters
   */
  async findAll(filters = {}) {
    let results = Array.from(this.customFeeds.values());

    if (filters.output_format) {
      results = results.filter((f) => f.output_format === filters.output_format);
    }

    if (filters.distribution) {
      results = results.filter((f) => f.distribution === filters.distribution);
    }

    if (filters.created_by) {
      results = results.filter((f) => f.created_by === filters.created_by);
    }

    // Sort by created_at descending by default
    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: results.slice(startIndex, endIndex),
      total: results.length,
      page,
      limit,
      totalPages: Math.ceil(results.length / limit)
    };
  }

  /**
   * Update custom feed
   */
  async update(id, updateData) {
    const customFeed = this.customFeeds.get(id);
    if (!customFeed) {
      return null;
    }

    Object.assign(customFeed, updateData);
    customFeed.updated_at = new Date();
    this.customFeeds.set(id, customFeed);
    return customFeed;
  }

  /**
   * Delete custom feed
   */
  async delete(id) {
    return this.customFeeds.delete(id);
  }

  /**
   * Get custom feed statistics
   */
  async getStatistics() {
    const customFeeds = Array.from(this.customFeeds.values());

    return {
      total: customFeeds.length,
      by_format: {
        json: customFeeds.filter((f) => f.output_format === 'json').length,
        csv: customFeeds.filter((f) => f.output_format === 'csv').length,
        stix: customFeeds.filter((f) => f.output_format === 'stix').length,
        xml: customFeeds.filter((f) => f.output_format === 'xml').length
      },
      by_distribution: {
        internal: customFeeds.filter((f) => f.distribution === 'internal').length,
        external: customFeeds.filter((f) => f.distribution === 'external').length,
        restricted: customFeeds.filter((f) => f.distribution === 'restricted').length
      },
      auto_update_enabled: customFeeds.filter((f) => f.auto_update).length
    };
  }

  /**
   * Clear all data (for testing)
   */
  async clear() {
    this.customFeeds.clear();
  }
}

// Singleton instance
const customFeedRepository = new CustomFeedRepository();

module.exports = customFeedRepository;
