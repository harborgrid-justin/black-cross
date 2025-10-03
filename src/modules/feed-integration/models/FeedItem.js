/**
 * FeedItem Model
 *
 * Represents a single threat intelligence item from a feed
 */

const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class FeedItem {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.feed_source_id = data.feed_source_id || null;
    this.external_id = data.external_id || null;
    this.type = data.type || 'indicator'; // indicator, threat, malware, campaign, actor
    this.indicator_type = data.indicator_type || null; // ip, domain, url, hash, email, etc.
    this.value = data.value || '';
    this.title = data.title || '';
    this.description = data.description || '';
    this.severity = data.severity || 'medium'; // critical, high, medium, low, info
    this.confidence = data.confidence || 50; // 0-100
    this.tags = data.tags || [];
    this.categories = data.categories || [];
    this.tlp = data.tlp || 'amber'; // white, green, amber, red
    this.first_seen = data.first_seen || new Date();
    this.last_seen = data.last_seen || new Date();
    this.raw_data = data.raw_data || null;
    this.normalized_data = data.normalized_data || {};
    this.hash = data.hash || this.calculateHash();
    this.duplicate_of = data.duplicate_of || null;
    this.is_false_positive = data.is_false_positive || false;
    this.relationships = data.relationships || [];
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Calculate hash for deduplication
   */
  calculateHash() {
    const hashInput = JSON.stringify({
      type: this.type,
      indicator_type: this.indicator_type,
      value: this.value,
      title: this.title
    });
    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }

  /**
   * Mark as duplicate
   */
  markAsDuplicate(originalId) {
    this.duplicate_of = originalId;
    this.updated_at = new Date();
  }

  /**
   * Mark as false positive
   */
  markAsFalsePositive(isFalsePositive = true) {
    this.is_false_positive = isFalsePositive;
    this.updated_at = new Date();
  }

  /**
   * Update last seen timestamp
   */
  updateLastSeen() {
    this.last_seen = new Date();
    this.updated_at = new Date();
  }

  /**
   * Convert to plain object for storage/API
   */
  toJSON() {
    return {
      id: this.id,
      feed_source_id: this.feed_source_id,
      external_id: this.external_id,
      type: this.type,
      indicator_type: this.indicator_type,
      value: this.value,
      title: this.title,
      description: this.description,
      severity: this.severity,
      confidence: this.confidence,
      tags: this.tags,
      categories: this.categories,
      tlp: this.tlp,
      first_seen: this.first_seen,
      last_seen: this.last_seen,
      raw_data: this.raw_data,
      normalized_data: this.normalized_data,
      hash: this.hash,
      duplicate_of: this.duplicate_of,
      is_false_positive: this.is_false_positive,
      relationships: this.relationships,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = FeedItem;
