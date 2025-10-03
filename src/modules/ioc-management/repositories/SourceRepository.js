/**
 * Source Repository
 * 
 * Data access layer for Source operations
 */

const Source = require('../models/Source');

class SourceRepository {
  constructor() {
    this.sources = new Map();
  }

  /**
   * Create a new source
   */
  async create(sourceData) {
    const source = new Source(sourceData);
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
   * Find source by name
   */
  async findByName(name) {
    for (const source of this.sources.values()) {
      if (source.name === name) {
        return source;
      }
    }
    return null;
  }

  /**
   * Find all sources
   */
  async findAll(filters = {}) {
    let results = Array.from(this.sources.values());

    if (filters.active !== undefined) {
      results = results.filter(s => s.active === filters.active);
    }

    if (filters.type) {
      results = results.filter(s => s.type === filters.type);
    }

    return results;
  }

  /**
   * Update a source
   */
  async update(id, updates) {
    const source = this.sources.get(id);
    if (!source) {
      throw new Error('Source not found');
    }

    Object.assign(source, updates);
    source.updated_at = new Date();
    return source;
  }

  /**
   * Delete a source
   */
  async delete(id) {
    return this.sources.delete(id);
  }

  /**
   * Get statistics
   */
  async getStats() {
    const sources = Array.from(this.sources.values());
    
    return {
      total: sources.length,
      active: sources.filter(s => s.active).length,
      inactive: sources.filter(s => !s.active).length,
      by_type: sources.reduce((acc, s) => {
        acc[s.type] = (acc[s.type] || 0) + 1;
        return acc;
      }, {}),
      avg_reliability: sources.length > 0 
        ? (sources.reduce((sum, s) => sum + s.reliability, 0) / sources.length).toFixed(2)
        : 0,
      total_iocs: sources.reduce((sum, s) => sum + s.ioc_count, 0)
    };
  }

  /**
   * Clear all sources (for testing)
   */
  async clear() {
    this.sources.clear();
  }
}

module.exports = new SourceRepository();
