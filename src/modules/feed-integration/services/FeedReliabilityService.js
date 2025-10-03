/**
 * Feed Reliability Service
 *
 * Business logic for feed reliability scoring and assessment
 */

const { feedSourceRepository, feedItemRepository } = require('../repositories');

class FeedReliabilityService {
  /**
   * Calculate reliability score for a feed source
   */
  async calculateReliabilityScore(feedSourceId) {
    const source = await feedSourceRepository.findById(feedSourceId);
    if (!source) {
      throw new Error('Feed source not found');
    }

    // Update the score based on current statistics
    source.updateReliabilityScore();
    await feedSourceRepository.update(feedSourceId, source);

    return {
      feed_id: feedSourceId,
      feed_name: source.name,
      reliability_score: source.reliability_score,
      metrics: {
        success_rate: this.calculateSuccessRate(source),
        false_positive_rate: this.calculateFalsePositiveRate(source),
        timeliness_score: this.calculateTimelinessScore(source),
        volume_score: this.calculateVolumeScore(source)
      },
      status: this.getReliabilityStatus(source.reliability_score),
      last_updated: new Date()
    };
  }

  /**
   * Calculate success rate
   */
  calculateSuccessRate(source) {
    const totalUpdates = source.statistics.successful_updates + source.statistics.failed_updates;
    if (totalUpdates === 0) return 0;
    return ((source.statistics.successful_updates / totalUpdates) * 100).toFixed(2);
  }

  /**
   * Calculate false positive rate
   */
  calculateFalsePositiveRate(source) {
    if (source.statistics.total_items === 0) return 0;
    return ((source.statistics.false_positives / source.statistics.total_items) * 100).toFixed(2);
  }

  /**
   * Calculate timeliness score
   */
  calculateTimelinessScore(source) {
    if (!source.last_updated) return 0;

    const hoursSinceUpdate = (Date.now() - new Date(source.last_updated).getTime()) / (1000 * 60 * 60);

    if (hoursSinceUpdate < 1) return 100;
    if (hoursSinceUpdate < 6) return 90;
    if (hoursSinceUpdate < 24) return 70;
    if (hoursSinceUpdate < 72) return 50;
    return 30;
  }

  /**
   * Calculate volume score
   */
  calculateVolumeScore(source) {
    const newItems = source.statistics.new_items;

    if (newItems > 1000) return 100;
    if (newItems > 500) return 80;
    if (newItems > 100) return 60;
    if (newItems > 10) return 40;
    return 20;
  }

  /**
   * Get reliability status
   */
  getReliabilityStatus(score) {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    if (score >= 20) return 'poor';
    return 'critical';
  }

  /**
   * Update feed reliability score manually
   */
  async updateReliabilityScore(feedSourceId, score, reason = null) {
    const source = await feedSourceRepository.findById(feedSourceId);
    if (!source) {
      throw new Error('Feed source not found');
    }

    source.reliability_score = Math.max(0, Math.min(100, score));
    source.updated_at = new Date();

    if (reason) {
      if (!source.metadata) source.metadata = {};
      if (!source.metadata.reliability_notes) source.metadata.reliability_notes = [];
      source.metadata.reliability_notes.push({
        score,
        reason,
        timestamp: new Date()
      });
    }

    await feedSourceRepository.update(feedSourceId, source);

    return {
      feed_id: feedSourceId,
      new_score: source.reliability_score,
      reason,
      updated_at: source.updated_at
    };
  }

  /**
   * Get reliability report for a feed
   */
  async getReliabilityReport(feedSourceId) {
    const source = await feedSourceRepository.findById(feedSourceId);
    if (!source) {
      throw new Error('Feed source not found');
    }

    const items = await feedItemRepository.findByFeedSource(feedSourceId);

    return {
      feed: {
        id: source.id,
        name: source.name,
        type: source.type,
        reliability_score: source.reliability_score,
        status: this.getReliabilityStatus(source.reliability_score)
      },
      statistics: source.statistics,
      metrics: {
        success_rate: this.calculateSuccessRate(source),
        false_positive_rate: this.calculateFalsePositiveRate(source),
        timeliness_score: this.calculateTimelinessScore(source),
        volume_score: this.calculateVolumeScore(source)
      },
      item_quality: {
        total_items: items.length,
        unique_items: items.filter((i) => !i.duplicate_of).length,
        false_positives: items.filter((i) => i.is_false_positive).length,
        high_confidence: items.filter((i) => i.confidence >= 70).length,
        low_confidence: items.filter((i) => i.confidence < 40).length
      },
      recommendations: this.generateRecommendations(source, items),
      report_timestamp: new Date()
    };
  }

  /**
   * Generate recommendations based on reliability analysis
   */
  generateRecommendations(source, items) {
    const recommendations = [];

    if (source.reliability_score < 40) {
      recommendations.push({
        level: 'critical',
        message: 'Feed reliability is critically low. Consider disabling or replacing this feed.',
        action: 'review_feed'
      });
    }

    if (source.statistics.failed_updates > 5) {
      recommendations.push({
        level: 'high',
        message: 'Multiple failed updates detected. Check feed configuration and connectivity.',
        action: 'check_configuration'
      });
    }

    const fpRate = parseFloat(this.calculateFalsePositiveRate(source));
    if (fpRate > 15) {
      recommendations.push({
        level: 'high',
        message: `High false positive rate (${fpRate}%). Implement additional validation rules.`,
        action: 'reduce_false_positives'
      });
    }

    if (this.calculateTimelinessScore(source) < 50) {
      recommendations.push({
        level: 'medium',
        message: 'Feed updates are not timely. Consider adjusting update schedule.',
        action: 'adjust_schedule'
      });
    }

    const lowConfItems = items.filter((i) => i.confidence < 40).length;
    if (lowConfItems > items.length * 0.3) {
      recommendations.push({
        level: 'medium',
        message: 'High proportion of low-confidence items. Verify feed quality.',
        action: 'verify_quality'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        level: 'info',
        message: 'Feed reliability is good. Continue monitoring.',
        action: 'continue_monitoring'
      });
    }

    return recommendations;
  }

  /**
   * Compare feed reliability across sources
   */
  async compareFeeds(feedSourceIds = []) {
    const comparisons = [];

    // If no specific feeds provided, get all
    if (feedSourceIds.length === 0) {
      const allFeeds = await feedSourceRepository.findAll({ limit: 1000 });
      feedSourceIds = allFeeds.data.map((f) => f.id);
    }

    for (const feedId of feedSourceIds) {
      const report = await this.getReliabilityReport(feedId);
      comparisons.push(report);
    }

    // Sort by reliability score descending
    comparisons.sort((a, b) => b.feed.reliability_score - a.feed.reliability_score);

    return {
      total_feeds: comparisons.length,
      best_feed: comparisons[0]?.feed || null,
      worst_feed: comparisons[comparisons.length - 1]?.feed || null,
      average_score: comparisons.reduce((sum, c) => sum + c.feed.reliability_score, 0) / comparisons.length,
      comparisons
    };
  }

  /**
   * Track false positive for a feed
   */
  async trackFalsePositive(feedSourceId, feedItemId) {
    const source = await feedSourceRepository.findById(feedSourceId);
    const item = await feedItemRepository.findById(feedItemId);

    if (!source || !item) {
      throw new Error('Feed source or item not found');
    }

    // Mark item as false positive
    item.markAsFalsePositive(true);
    await feedItemRepository.update(feedItemId, item);

    // Update feed source statistics
    source.recordFalsePositive(1);
    await feedSourceRepository.update(feedSourceId, source);

    return {
      feed_id: feedSourceId,
      item_id: feedItemId,
      new_reliability_score: source.reliability_score,
      false_positive_rate: this.calculateFalsePositiveRate(source)
    };
  }

  /**
   * Get trending reliability metrics
   */
  async getTrendingMetrics(period = '30d') {
    const allFeeds = await feedSourceRepository.findAll({ limit: 1000 });

    const trending = {
      improving: [],
      declining: [],
      stable: []
    };

    // Note: In a real implementation, this would analyze historical data
    // For now, we'll categorize based on current reliability scores
    for (const feed of allFeeds.data) {
      const category = {
        id: feed.id,
        name: feed.name,
        score: feed.reliability_score,
        status: this.getReliabilityStatus(feed.reliability_score)
      };

      if (feed.reliability_score >= 70) {
        trending.stable.push(category);
      } else if (feed.reliability_score >= 40) {
        trending.improving.push(category);
      } else {
        trending.declining.push(category);
      }
    }

    return {
      period,
      timestamp: new Date(),
      summary: {
        total_feeds: allFeeds.total,
        improving: trending.improving.length,
        declining: trending.declining.length,
        stable: trending.stable.length
      },
      trending
    };
  }
}

module.exports = new FeedReliabilityService();
