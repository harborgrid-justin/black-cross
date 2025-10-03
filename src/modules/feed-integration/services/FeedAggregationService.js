/**
 * Feed Aggregation Service
 *
 * Business logic for multi-source feed aggregation
 */

const { feedSourceRepository, feedItemRepository } = require('../repositories');
const ParsingService = require('./ParsingService');
const DeduplicationService = require('./DeduplicationService');

class FeedAggregationService {
  /**
   * Aggregate feeds from multiple sources
   */
  async aggregateFeeds(feedSourceIds = []) {
    const results = {
      total_sources: feedSourceIds.length,
      successful: 0,
      failed: 0,
      total_items: 0,
      new_items: 0,
      duplicates: 0,
      errors: []
    };

    // If no specific sources provided, get all enabled sources
    if (feedSourceIds.length === 0) {
      const allSources = await feedSourceRepository.findAll({ enabled: true });
      feedSourceIds = allSources.data.map((s) => s.id);
      results.total_sources = feedSourceIds.length;
    }

    // Process each feed source
    for (const sourceId of feedSourceIds) {
      try {
        const source = await feedSourceRepository.findById(sourceId);
        if (!source) {
          results.errors.push({ sourceId, error: 'Feed source not found' });
          results.failed++;
          continue;
        }

        if (!source.enabled) {
          results.errors.push({ sourceId, error: 'Feed source is disabled' });
          results.failed++;
          continue;
        }

        // Fetch and process feed
        const feedResult = await this.processFeedSource(source);

        results.successful++;
        results.total_items += feedResult.total_items;
        results.new_items += feedResult.new_items;
        results.duplicates += feedResult.duplicates;

        // Update feed source statistics
        source.recordSuccess(feedResult.total_items, feedResult.new_items);
        await feedSourceRepository.update(source.id, source);
      } catch (error) {
        results.errors.push({ sourceId, error: error.message });
        results.failed++;

        // Record failure on the feed source
        const source = await feedSourceRepository.findById(sourceId);
        if (source) {
          source.recordFailure(error.message);
          await feedSourceRepository.update(source.id, source);
        }
      }
    }

    return results;
  }

  /**
   * Process a single feed source
   */
  async processFeedSource(feedSource) {
    // Parse the feed data
    const parsedData = await ParsingService.parseFeed(feedSource);

    const result = {
      total_items: parsedData.items.length,
      new_items: 0,
      duplicates: 0
    };

    // Process each item
    for (const item of parsedData.items) {
      // Add feed source reference
      item.feed_source_id = feedSource.id;

      // Check for duplicates
      const duplicate = await DeduplicationService.findDuplicate(item);

      if (duplicate) {
        result.duplicates++;
        // Update last_seen on the duplicate
        duplicate.updateLastSeen();
        await feedItemRepository.update(duplicate.id, duplicate);
      } else {
        // Create new feed item
        await feedItemRepository.create(item);
        result.new_items++;
      }
    }

    return result;
  }

  /**
   * Get aggregation status across all feeds
   */
  async getAggregationStatus() {
    const sources = await feedSourceRepository.findAll({ limit: 10000 });
    const items = await feedItemRepository.getStatistics();

    const healthySources = sources.data.filter((s) => s.isHealthy()).length;
    const activeFeeds = sources.data.filter((s) => s.status === 'active').length;

    return {
      total_sources: sources.total,
      active_sources: activeFeeds,
      healthy_sources: healthySources,
      error_sources: sources.data.filter((s) => s.status === 'error').length,
      total_items: items.total,
      unique_items: items.unique_items,
      duplicates: items.duplicates,
      false_positives: items.false_positives,
      last_aggregation: new Date(),
      health_score: (healthySources / sources.total * 100).toFixed(2)
    };
  }

  /**
   * List all feed sources
   */
  async listSources(filters = {}) {
    return await feedSourceRepository.findAll(filters);
  }

  /**
   * Get feed source by ID
   */
  async getSource(id) {
    return await feedSourceRepository.findById(id);
  }

  /**
   * Monitor feed health
   */
  async monitorFeedHealth() {
    const sources = await feedSourceRepository.findAll({ limit: 10000 });
    const healthReport = {
      timestamp: new Date(),
      total_feeds: sources.total,
      healthy: [],
      degraded: [],
      unhealthy: []
    };

    for (const source of sources.data) {
      const healthStatus = {
        id: source.id,
        name: source.name,
        reliability_score: source.reliability_score,
        status: source.status,
        last_updated: source.last_updated
      };

      if (source.reliability_score >= 70) {
        healthReport.healthy.push(healthStatus);
      } else if (source.reliability_score >= 40) {
        healthReport.degraded.push(healthStatus);
      } else {
        healthReport.unhealthy.push(healthStatus);
      }
    }

    return healthReport;
  }

  /**
   * Get feed conflict resolution recommendations
   */
  async resolveConflicts(feedItemIds) {
    const items = [];
    for (const id of feedItemIds) {
      const item = await feedItemRepository.findById(id);
      if (item) items.push(item);
    }

    if (items.length === 0) {
      return null;
    }

    // Find the most reliable source
    const sourcePriority = {};
    for (const item of items) {
      const source = await feedSourceRepository.findById(item.feed_source_id);
      if (source) {
        sourcePriority[item.id] = source.reliability_score;
      }
    }

    // Sort items by source reliability
    items.sort((a, b) => (sourcePriority[b.id] || 0) - (sourcePriority[a.id] || 0));

    return {
      recommended: items[0],
      conflicts: items.slice(1),
      resolution_strategy: 'highest_reliability_source',
      reasoning: 'Selected item from feed source with highest reliability score'
    };
  }

  /**
   * Get feed categorization
   */
  async categorizeFeed(feedSourceId) {
    const source = await feedSourceRepository.findById(feedSourceId);
    if (!source) {
      return null;
    }

    const items = await feedItemRepository.findByFeedSource(feedSourceId);

    // Analyze items to categorize the feed
    const categories = {};
    const types = {};
    const severities = {};

    items.forEach((item) => {
      item.categories.forEach((cat) => {
        categories[cat] = (categories[cat] || 0) + 1;
      });
      types[item.type] = (types[item.type] || 0) + 1;
      severities[item.severity] = (severities[item.severity] || 0) + 1;
    });

    return {
      feed_id: feedSourceId,
      feed_name: source.name,
      primary_category: Object.keys(categories).sort((a, b) => categories[b] - categories[a])[0],
      categories,
      types,
      severities,
      total_items: items.length
    };
  }
}

module.exports = new FeedAggregationService();
