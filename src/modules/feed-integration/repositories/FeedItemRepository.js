/**
 * FeedItem Repository
 *
 * Data access layer for feed item operations
 */

const { FeedItem } = require('../models');

class FeedItemRepository {
  constructor() {
    this.feedItems = new Map();
    this.hashIndex = new Map(); // For quick hash lookups
  }

  /**
   * Create a new feed item
   */
  async create(feedItemData) {
    const feedItem = new FeedItem(feedItemData);
    this.feedItems.set(feedItem.id, feedItem);
    this.hashIndex.set(feedItem.hash, feedItem.id);
    return feedItem;
  }

  /**
   * Find feed item by ID
   */
  async findById(id) {
    return this.feedItems.get(id) || null;
  }

  /**
   * Find feed item by hash
   */
  async findByHash(hash) {
    const id = this.hashIndex.get(hash);
    return id ? this.feedItems.get(id) : null;
  }

  /**
   * Find all feed items with optional filters
   */
  async findAll(filters = {}) {
    let results = Array.from(this.feedItems.values());

    if (filters.feed_source_id) {
      results = results.filter((f) => f.feed_source_id === filters.feed_source_id);
    }

    if (filters.type) {
      results = results.filter((f) => f.type === filters.type);
    }

    if (filters.indicator_type) {
      results = results.filter((f) => f.indicator_type === filters.indicator_type);
    }

    if (filters.severity) {
      results = results.filter((f) => f.severity === filters.severity);
    }

    if (filters.is_duplicate !== undefined) {
      results = results.filter((f) => (f.duplicate_of !== null) === filters.is_duplicate);
    }

    if (filters.is_false_positive !== undefined) {
      results = results.filter((f) => f.is_false_positive === filters.is_false_positive);
    }

    if (filters.min_confidence) {
      results = results.filter((f) => f.confidence >= filters.min_confidence);
    }

    if (filters.start_date) {
      const startDate = new Date(filters.start_date);
      results = results.filter((f) => new Date(f.created_at) >= startDate);
    }

    if (filters.end_date) {
      const endDate = new Date(filters.end_date);
      results = results.filter((f) => new Date(f.created_at) <= endDate);
    }

    // Sort by created_at descending by default
    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 100;
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
   * Update feed item
   */
  async update(id, updateData) {
    const feedItem = this.feedItems.get(id);
    if (!feedItem) {
      return null;
    }

    Object.assign(feedItem, updateData);
    feedItem.updated_at = new Date();
    this.feedItems.set(id, feedItem);
    return feedItem;
  }

  /**
   * Delete feed item
   */
  async delete(id) {
    const feedItem = this.feedItems.get(id);
    if (feedItem) {
      this.hashIndex.delete(feedItem.hash);
    }
    return this.feedItems.delete(id);
  }

  /**
   * Get feed item statistics
   */
  async getStatistics() {
    const feedItems = Array.from(this.feedItems.values());

    return {
      total: feedItems.length,
      by_type: {
        indicator: feedItems.filter((f) => f.type === 'indicator').length,
        threat: feedItems.filter((f) => f.type === 'threat').length,
        malware: feedItems.filter((f) => f.type === 'malware').length,
        campaign: feedItems.filter((f) => f.type === 'campaign').length,
        actor: feedItems.filter((f) => f.type === 'actor').length
      },
      by_severity: {
        critical: feedItems.filter((f) => f.severity === 'critical').length,
        high: feedItems.filter((f) => f.severity === 'high').length,
        medium: feedItems.filter((f) => f.severity === 'medium').length,
        low: feedItems.filter((f) => f.severity === 'low').length,
        info: feedItems.filter((f) => f.severity === 'info').length
      },
      duplicates: feedItems.filter((f) => f.duplicate_of !== null).length,
      false_positives: feedItems.filter((f) => f.is_false_positive).length,
      unique_items: feedItems.filter((f) => f.duplicate_of === null).length
    };
  }

  /**
   * Find duplicates by hash
   */
  async findDuplicates(hash) {
    const feedItems = Array.from(this.feedItems.values());
    return feedItems.filter((f) => f.hash === hash);
  }

  /**
   * Get items by feed source
   */
  async findByFeedSource(feedSourceId) {
    const feedItems = Array.from(this.feedItems.values());
    return feedItems.filter((f) => f.feed_source_id === feedSourceId);
  }

  /**
   * Clear all data (for testing)
   */
  async clear() {
    this.feedItems.clear();
    this.hashIndex.clear();
  }
}

// Singleton instance
const feedItemRepository = new FeedItemRepository();

module.exports = feedItemRepository;
