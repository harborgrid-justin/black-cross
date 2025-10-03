/**
 * FeedSource Model
 *
 * Represents a threat intelligence feed source with configuration,
 * scheduling, and reliability tracking
 */

const { v4: uuidv4 } = require('uuid');

class FeedSource {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.type = data.type || 'commercial'; // commercial, opensource, government, community, custom
    this.url = data.url || '';
    this.format = data.format || 'json'; // stix, taxii, json, csv, xml, openioc, misp, custom
    this.authentication = data.authentication || null; // { type: 'api_key|basic|oauth', credentials: {} }
    this.schedule = data.schedule || '0 */6 * * *'; // cron pattern
    this.enabled = data.enabled !== undefined ? data.enabled : true;
    this.reliability_score = data.reliability_score || 50.0;
    this.status = data.status || 'active'; // active, inactive, error, paused
    this.last_updated = data.last_updated || null;
    this.next_update = data.next_update || null;
    this.category = data.category || 'general'; // malware, phishing, ransomware, apt, general
    this.priority = data.priority || 'medium'; // critical, high, medium, low
    this.statistics = data.statistics || {
      total_items: 0,
      new_items: 0,
      false_positives: 0,
      successful_updates: 0,
      failed_updates: 0,
      average_update_time: 0,
      last_error: null
    };
    this.metadata = data.metadata || {
      provider: '',
      description: '',
      tags: [],
      cost: null,
      license: null,
      coverage: []
    };
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Update reliability score based on performance metrics
   */
  updateReliabilityScore() {
    const stats = this.statistics;
    const totalUpdates = stats.successful_updates + stats.failed_updates;

    if (totalUpdates === 0) {
      return this.reliability_score;
    }

    // Calculate success rate (0-40 points)
    const successRate = (stats.successful_updates / totalUpdates) * 40;

    // Calculate false positive rate (0-30 points)
    const fpRate = stats.total_items > 0
      ? (1 - (stats.false_positives / stats.total_items)) * 30
      : 15;

    // Timeliness score (0-20 points)
    const timelinessScore = this.last_updated
      ? Math.max(0, 20 - (Date.now() - new Date(this.last_updated).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Update volume score (0-10 points)
    const volumeScore = Math.min(10, (stats.new_items / 100) * 10);

    this.reliability_score = Math.min(100, successRate + fpRate + timelinessScore + volumeScore);
    return this.reliability_score;
  }

  /**
   * Record successful feed update
   */
  recordSuccess(itemsProcessed, newItems) {
    this.statistics.successful_updates++;
    this.statistics.total_items += itemsProcessed;
    this.statistics.new_items += newItems;
    this.last_updated = new Date();
    this.status = 'active';
    this.updateReliabilityScore();
    this.updated_at = new Date();
  }

  /**
   * Record failed feed update
   */
  recordFailure(error) {
    this.statistics.failed_updates++;
    this.statistics.last_error = error;
    this.status = 'error';
    this.updateReliabilityScore();
    this.updated_at = new Date();
  }

  /**
   * Record false positive
   */
  recordFalsePositive(count = 1) {
    this.statistics.false_positives += count;
    this.updateReliabilityScore();
    this.updated_at = new Date();
  }

  /**
   * Check if feed is healthy
   */
  isHealthy() {
    return this.status === 'active' && this.reliability_score > 30;
  }

  /**
   * Convert to plain object for storage/API
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      url: this.url,
      format: this.format,
      authentication: this.authentication,
      schedule: this.schedule,
      enabled: this.enabled,
      reliability_score: this.reliability_score,
      status: this.status,
      last_updated: this.last_updated,
      next_update: this.next_update,
      category: this.category,
      priority: this.priority,
      statistics: this.statistics,
      metadata: this.metadata,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = FeedSource;
