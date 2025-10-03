/**
 * Feed Scheduling Service
 *
 * Business logic for feed scheduling and management
 */

const { feedSourceRepository } = require('../repositories');
const FeedAggregationService = require('./FeedAggregationService');

class FeedSchedulingService {
  constructor() {
    this.scheduledJobs = new Map();
  }

  /**
   * Schedule a feed for periodic updates
   */
  async scheduleFeed(feedSourceId, schedule) {
    const source = await feedSourceRepository.findById(feedSourceId);
    if (!source) {
      throw new Error('Feed source not found');
    }

    // Validate cron pattern
    if (!this.validateCronPattern(schedule)) {
      throw new Error('Invalid cron pattern');
    }

    // Update feed source with schedule
    source.schedule = schedule;
    source.next_update = this.calculateNextUpdate(schedule);
    await feedSourceRepository.update(feedSourceId, source);

    return {
      feed_id: feedSourceId,
      schedule,
      next_update: source.next_update,
      scheduled_at: new Date()
    };
  }

  /**
   * Validate cron pattern
   */
  validateCronPattern(pattern) {
    // Basic cron validation (simplified)
    const cronRegex = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;
    return cronRegex.test(pattern);
  }

  /**
   * Calculate next update time based on cron schedule
   */
  calculateNextUpdate(cronPattern) {
    // Simplified calculation - in production, use a proper cron parser
    const now = new Date();
    const parts = cronPattern.split(' ');

    // Basic parsing for common patterns
    if (cronPattern.includes('*/1 * * * *')) {
      // Every minute
      return new Date(now.getTime() + 60000);
    } if (cronPattern.includes('0 * * * *')) {
      // Every hour
      return new Date(now.getTime() + 3600000);
    } if (cronPattern.includes('0 */6 * * *')) {
      // Every 6 hours
      return new Date(now.getTime() + 21600000);
    } if (cronPattern.includes('0 0 * * *')) {
      // Daily
      return new Date(now.getTime() + 86400000);
    }

    // Default to 1 hour from now
    return new Date(now.getTime() + 3600000);
  }

  /**
   * Get feed status
   */
  async getFeedStatus(feedSourceId) {
    const source = await feedSourceRepository.findById(feedSourceId);
    if (!source) {
      throw new Error('Feed source not found');
    }

    const now = new Date();
    const lastUpdate = source.last_updated ? new Date(source.last_updated) : null;
    const nextUpdate = source.next_update ? new Date(source.next_update) : null;

    return {
      feed_id: feedSourceId,
      feed_name: source.name,
      enabled: source.enabled,
      status: source.status,
      schedule: source.schedule,
      last_update: {
        timestamp: lastUpdate,
        time_ago: lastUpdate ? this.getTimeAgo(lastUpdate) : 'Never'
      },
      next_update: {
        timestamp: nextUpdate,
        time_until: nextUpdate ? this.getTimeUntil(nextUpdate) : 'Not scheduled'
      },
      is_overdue: nextUpdate && nextUpdate < now,
      statistics: source.statistics
    };
  }

  /**
   * Get time ago string
   */
  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }

  /**
   * Get time until string
   */
  getTimeUntil(date) {
    const seconds = Math.floor((date - new Date()) / 1000);

    if (seconds < 0) return 'Overdue';
    if (seconds < 60) return `in ${seconds} seconds`;
    if (seconds < 3600) return `in ${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `in ${Math.floor(seconds / 3600)} hours`;
    return `in ${Math.floor(seconds / 86400)} days`;
  }

  /**
   * Manually trigger feed update
   */
  async triggerUpdate(feedSourceId) {
    const source = await feedSourceRepository.findById(feedSourceId);
    if (!source) {
      throw new Error('Feed source not found');
    }

    if (!source.enabled) {
      throw new Error('Feed is disabled');
    }

    // Process the feed
    const result = await FeedAggregationService.processFeedSource(source);

    // Update statistics
    source.recordSuccess(result.total_items, result.new_items);
    source.next_update = this.calculateNextUpdate(source.schedule);
    await feedSourceRepository.update(feedSourceId, source);

    return {
      feed_id: feedSourceId,
      feed_name: source.name,
      result,
      next_update: source.next_update,
      updated_at: new Date()
    };
  }

  /**
   * Get feeds due for update
   */
  async getFeedsDueForUpdate() {
    return await feedSourceRepository.findDueForUpdate();
  }

  /**
   * Process all due feeds
   */
  async processScheduledFeeds() {
    const dueFeeds = await this.getFeedsDueForUpdate();

    const results = {
      total_processed: 0,
      successful: 0,
      failed: 0,
      feeds: []
    };

    for (const feed of dueFeeds) {
      try {
        const result = await this.triggerUpdate(feed.id);
        results.successful++;
        results.feeds.push({
          feed_id: feed.id,
          feed_name: feed.name,
          status: 'success',
          result
        });
      } catch (error) {
        results.failed++;
        results.feeds.push({
          feed_id: feed.id,
          feed_name: feed.name,
          status: 'failed',
          error: error.message
        });

        // Record failure
        feed.recordFailure(error.message);
        await feedSourceRepository.update(feed.id, feed);
      }
      results.total_processed++;
    }

    return results;
  }

  /**
   * Pause feed updates
   */
  async pauseFeed(feedSourceId) {
    const source = await feedSourceRepository.findById(feedSourceId);
    if (!source) {
      throw new Error('Feed source not found');
    }

    source.status = 'paused';
    source.enabled = false;
    await feedSourceRepository.update(feedSourceId, source);

    return {
      feed_id: feedSourceId,
      status: 'paused',
      paused_at: new Date()
    };
  }

  /**
   * Resume feed updates
   */
  async resumeFeed(feedSourceId) {
    const source = await feedSourceRepository.findById(feedSourceId);
    if (!source) {
      throw new Error('Feed source not found');
    }

    source.status = 'active';
    source.enabled = true;
    source.next_update = this.calculateNextUpdate(source.schedule);
    await feedSourceRepository.update(feedSourceId, source);

    return {
      feed_id: feedSourceId,
      status: 'active',
      next_update: source.next_update,
      resumed_at: new Date()
    };
  }

  /**
   * Get scheduling statistics
   */
  async getSchedulingStatistics() {
    const allFeeds = await feedSourceRepository.findAll({ limit: 1000 });
    const dueFeeds = await this.getFeedsDueForUpdate();

    return {
      total_feeds: allFeeds.total,
      enabled_feeds: allFeeds.data.filter((f) => f.enabled).length,
      scheduled_feeds: allFeeds.data.filter((f) => f.schedule).length,
      due_for_update: dueFeeds.length,
      paused_feeds: allFeeds.data.filter((f) => f.status === 'paused').length,
      error_feeds: allFeeds.data.filter((f) => f.status === 'error').length,
      timestamp: new Date()
    };
  }

  /**
   * Get update history for a feed
   */
  async getUpdateHistory(feedSourceId, limit = 10) {
    const source = await feedSourceRepository.findById(feedSourceId);
    if (!source) {
      throw new Error('Feed source not found');
    }

    // In a real implementation, this would query a separate history table
    // For now, return summary from statistics
    return {
      feed_id: feedSourceId,
      feed_name: source.name,
      total_updates: source.statistics.successful_updates + source.statistics.failed_updates,
      successful_updates: source.statistics.successful_updates,
      failed_updates: source.statistics.failed_updates,
      last_update: source.last_updated,
      last_error: source.statistics.last_error,
      average_update_time: source.statistics.average_update_time
    };
  }

  /**
   * Optimize feed schedule based on activity
   */
  async optimizeSchedule(feedSourceId) {
    const source = await feedSourceRepository.findById(feedSourceId);
    if (!source) {
      throw new Error('Feed source not found');
    }

    let recommendedSchedule = source.schedule;
    const stats = source.statistics;

    // If feed has high activity, suggest more frequent updates
    if (stats.new_items / Math.max(1, stats.successful_updates) > 100) {
      recommendedSchedule = '0 */1 * * *'; // Hourly
    }
    // If feed has low activity, suggest less frequent updates
    else if (stats.new_items / Math.max(1, stats.successful_updates) < 10) {
      recommendedSchedule = '0 0 */12 * *'; // Twice daily
    }
    // Medium activity - every 6 hours
    else {
      recommendedSchedule = '0 */6 * * *';
    }

    return {
      feed_id: feedSourceId,
      current_schedule: source.schedule,
      recommended_schedule: recommendedSchedule,
      reason: this.getScheduleOptimizationReason(stats),
      apply_recommendation: recommendedSchedule !== source.schedule
    };
  }

  /**
   * Get schedule optimization reason
   */
  getScheduleOptimizationReason(stats) {
    const avgNewItems = stats.new_items / Math.max(1, stats.successful_updates);

    if (avgNewItems > 100) {
      return 'High activity detected - recommend more frequent updates';
    } if (avgNewItems < 10) {
      return 'Low activity detected - recommend less frequent updates to save resources';
    }
    return 'Moderate activity - current schedule appears optimal';
  }
}

module.exports = new FeedSchedulingService();
