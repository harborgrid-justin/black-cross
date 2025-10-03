/**
 * FeedSource Repository
 *
 * Data access layer for feed source operations
 */

const { FeedSource } = require('../models');

class FeedSourceRepository {
  constructor() {
    this.feedSources = new Map();
  }

  /**
   * Create a new feed source
   */
  async create(feedSourceData) {
    const feedSource = new FeedSource(feedSourceData);
    this.feedSources.set(feedSource.id, feedSource);
    return feedSource;
  }

  /**
   * Find feed source by ID
   */
  async findById(id) {
    return this.feedSources.get(id) || null;
  }

  /**
   * Find feed source by name
   */
  async findByName(name) {
    return Array.from(this.feedSources.values()).find((f) => f.name === name) || null;
  }

  /**
   * Find all feed sources with optional filters
   */
  async findAll(filters = {}) {
    let results = Array.from(this.feedSources.values());

    if (filters.type) {
      results = results.filter((f) => f.type === filters.type);
    }

    if (filters.status) {
      results = results.filter((f) => f.status === filters.status);
    }

    if (filters.enabled !== undefined) {
      results = results.filter((f) => f.enabled === filters.enabled);
    }

    if (filters.category) {
      results = results.filter((f) => f.category === filters.category);
    }

    if (filters.format) {
      results = results.filter((f) => f.format === filters.format);
    }

    if (filters.min_reliability) {
      results = results.filter((f) => f.reliability_score >= filters.min_reliability);
    }

    // Sort by reliability score descending by default
    results.sort((a, b) => b.reliability_score - a.reliability_score);

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
   * Update feed source
   */
  async update(id, updateData) {
    const feedSource = this.feedSources.get(id);
    if (!feedSource) {
      return null;
    }

    Object.assign(feedSource, updateData);
    feedSource.updated_at = new Date();
    this.feedSources.set(id, feedSource);
    return feedSource;
  }

  /**
   * Delete feed source
   */
  async delete(id) {
    return this.feedSources.delete(id);
  }

  /**
   * Get feed source statistics
   */
  async getStatistics() {
    const feedSources = Array.from(this.feedSources.values());

    return {
      total: feedSources.length,
      by_type: {
        commercial: feedSources.filter((f) => f.type === 'commercial').length,
        opensource: feedSources.filter((f) => f.type === 'opensource').length,
        government: feedSources.filter((f) => f.type === 'government').length,
        community: feedSources.filter((f) => f.type === 'community').length,
        custom: feedSources.filter((f) => f.type === 'custom').length
      },
      by_status: {
        active: feedSources.filter((f) => f.status === 'active').length,
        inactive: feedSources.filter((f) => f.status === 'inactive').length,
        error: feedSources.filter((f) => f.status === 'error').length,
        paused: feedSources.filter((f) => f.status === 'paused').length
      },
      enabled: feedSources.filter((f) => f.enabled).length,
      average_reliability: feedSources.reduce((sum, f) => sum + f.reliability_score, 0) / feedSources.length || 0
    };
  }

  /**
   * Get feeds by category
   */
  async findByCategory(category) {
    const feedSources = Array.from(this.feedSources.values());
    return feedSources.filter((f) => f.category === category);
  }

  /**
   * Get feeds due for update
   */
  async findDueForUpdate() {
    const feedSources = Array.from(this.feedSources.values());
    const now = new Date();
    return feedSources.filter((f) => f.enabled
      && f.status !== 'error'
      && (!f.next_update || new Date(f.next_update) <= now));
  }

  /**
   * Clear all data (for testing)
   */
  async clear() {
    this.feedSources.clear();
  }
}

// Singleton instance
const feedSourceRepository = new FeedSourceRepository();

module.exports = feedSourceRepository;
