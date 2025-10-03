/**
 * Source Model
 * 
 * Represents a threat intelligence source for IoCs
 */

const { v4: uuidv4 } = require('uuid');

class Source {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.type = data.type || 'unknown'; // feed, manual, api, partner, internal
    this.url = data.url || null;
    this.reliability = data.reliability !== undefined ? data.reliability : 50; // 0-100
    this.description = data.description || '';
    this.active = data.active !== undefined ? data.active : true;
    this.ioc_count = data.ioc_count || 0;
    this.last_updated = data.last_updated || new Date();
    this.metadata = data.metadata || {};
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Update reliability score
   */
  updateReliability(score) {
    this.reliability = Math.max(0, Math.min(100, score));
    this.updated_at = new Date();
  }

  /**
   * Increment IoC count
   */
  incrementIoCCount() {
    this.ioc_count += 1;
    this.last_updated = new Date();
    this.updated_at = new Date();
  }

  /**
   * Convert to plain object
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      url: this.url,
      reliability: this.reliability,
      description: this.description,
      active: this.active,
      ioc_count: this.ioc_count,
      last_updated: this.last_updated,
      metadata: this.metadata,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Source;
