/**
 * LogSource Repository
 * 
 * Handles data persistence for log sources
 */

const LogSource = require('../models/LogSource');

class LogSourceRepository {
  constructor() {
    this.sources = new Map();
  }

  /**
   * Create new log source
   */
  async create(sourceData) {
    const source = new LogSource(sourceData);
    this.sources.set(source.id, source);
    return source;
  }

  /**
   * Find source by ID
   */
  async findById(id) {
    return this.sources.get(id) || null;
  }

  /**
   * Find all sources
   */
  async findAll(filters = {}) {
    let sources = Array.from(this.sources.values());

    if (filters.status) {
      sources = sources.filter(s => s.status === filters.status);
    }

    if (filters.source_type) {
      sources = sources.filter(s => s.source_type === filters.source_type);
    }

    return sources;
  }

  /**
   * Find active sources
   */
  async findActive() {
    return Array.from(this.sources.values()).filter(s => s.status === 'active');
  }

  /**
   * Update source
   */
  async update(id, updates) {
    const source = this.sources.get(id);
    if (!source) return null;

    Object.assign(source, updates);
    source.updated_at = new Date();
    this.sources.set(id, source);
    return source;
  }

  /**
   * Delete source
   */
  async delete(id) {
    return this.sources.delete(id);
  }

  /**
   * Clear all sources (for testing)
   */
  async clear() {
    this.sources.clear();
  }
}

module.exports = new LogSourceRepository();
