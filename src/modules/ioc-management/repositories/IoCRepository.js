/**
 * IoC Repository
 * 
 * Data access layer for IoC operations
 * In-memory implementation (can be replaced with actual database)
 */

const IoC = require('../models/IoC');

class IoCRepository {
  constructor() {
    this.iocs = new Map();
    this.valueIndex = new Map(); // For quick lookup by value
  }

  /**
   * Create a new IoC
   */
  async create(iocData) {
    const ioc = new IoC(iocData);
    this.iocs.set(ioc.id, ioc);
    this.valueIndex.set(`${ioc.type}:${ioc.value}`, ioc.id);
    return ioc;
  }

  /**
   * Find IoC by ID
   */
  async findById(id) {
    return this.iocs.get(id) || null;
  }

  /**
   * Find IoC by value and type
   */
  async findByValue(value, type = null) {
    if (type) {
      const id = this.valueIndex.get(`${type}:${value}`);
      return id ? this.iocs.get(id) : null;
    }
    
    // Search across all types
    for (const ioc of this.iocs.values()) {
      if (ioc.value === value) {
        return ioc;
      }
    }
    return null;
  }

  /**
   * Find all IoCs matching criteria
   */
  async find(criteria = {}) {
    let results = Array.from(this.iocs.values());

    if (criteria.type) {
      results = results.filter(ioc => ioc.type === criteria.type);
    }

    if (criteria.status) {
      results = results.filter(ioc => ioc.status === criteria.status);
    }

    if (criteria.severity) {
      results = results.filter(ioc => ioc.severity === criteria.severity);
    }

    if (criteria.tags && criteria.tags.length > 0) {
      results = results.filter(ioc => 
        criteria.tags.some(tag => ioc.tags.includes(tag))
      );
    }

    if (criteria.min_confidence !== undefined) {
      results = results.filter(ioc => ioc.confidence >= criteria.min_confidence);
    }

    if (criteria.since) {
      const sinceDate = new Date(criteria.since);
      results = results.filter(ioc => new Date(ioc.created_at) >= sinceDate);
    }

    return results;
  }

  /**
   * Search IoCs by text
   */
  async search(query, options = {}) {
    const { type, status, limit = 100, offset = 0 } = options;
    let results = Array.from(this.iocs.values());

    // Filter by query
    if (query) {
      const queryLower = query.toLowerCase();
      results = results.filter(ioc => 
        ioc.value.toLowerCase().includes(queryLower) ||
        ioc.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
        (ioc.metadata.description && ioc.metadata.description.toLowerCase().includes(queryLower))
      );
    }

    // Apply filters
    if (type) {
      results = results.filter(ioc => ioc.type === type);
    }

    if (status) {
      results = results.filter(ioc => ioc.status === status);
    }

    // Sort by confidence desc, then by last_seen desc
    results.sort((a, b) => {
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      return new Date(b.last_seen) - new Date(a.last_seen);
    });

    const total = results.length;
    results = results.slice(offset, offset + limit);

    return {
      data: results,
      total,
      limit,
      offset
    };
  }

  /**
   * Update an IoC
   */
  async update(id, updates) {
    const ioc = this.iocs.get(id);
    if (!ioc) {
      throw new Error('IoC not found');
    }

    // Update fields
    Object.assign(ioc, updates);
    ioc.updated_at = new Date();

    // Update index if value or type changed
    if (updates.value || updates.type) {
      this.valueIndex.set(`${ioc.type}:${ioc.value}`, ioc.id);
    }

    return ioc;
  }

  /**
   * Delete an IoC
   */
  async delete(id) {
    const ioc = this.iocs.get(id);
    if (!ioc) {
      return false;
    }

    this.valueIndex.delete(`${ioc.type}:${ioc.value}`);
    this.iocs.delete(id);
    return true;
  }

  /**
   * Bulk create IoCs
   */
  async bulkCreate(iocsData) {
    const created = [];
    const errors = [];

    for (const data of iocsData) {
      try {
        const ioc = await this.create(data);
        created.push(ioc);
      } catch (error) {
        errors.push({
          data,
          error: error.message
        });
      }
    }

    return { created, errors };
  }

  /**
   * Get statistics
   */
  async getStats() {
    const iocs = Array.from(this.iocs.values());
    
    const stats = {
      total: iocs.length,
      by_type: {},
      by_status: {},
      by_severity: {},
      avg_confidence: 0,
      active: 0,
      expired: 0
    };

    let totalConfidence = 0;

    iocs.forEach(ioc => {
      // By type
      stats.by_type[ioc.type] = (stats.by_type[ioc.type] || 0) + 1;
      
      // By status
      stats.by_status[ioc.status] = (stats.by_status[ioc.status] || 0) + 1;
      
      // By severity
      stats.by_severity[ioc.severity] = (stats.by_severity[ioc.severity] || 0) + 1;
      
      // Confidence
      totalConfidence += ioc.confidence;
      
      // Active/expired
      if (ioc.status === 'active') {
        stats.active += 1;
      }
      if (ioc.isExpired()) {
        stats.expired += 1;
      }
    });

    stats.avg_confidence = iocs.length > 0 ? (totalConfidence / iocs.length).toFixed(2) : 0;

    return stats;
  }

  /**
   * Find expired IoCs
   */
  async findExpired() {
    const iocs = Array.from(this.iocs.values());
    return iocs.filter(ioc => ioc.isExpired());
  }

  /**
   * Find duplicates
   */
  async findDuplicates() {
    const duplicates = [];
    const seen = new Map();

    for (const ioc of this.iocs.values()) {
      const key = `${ioc.type}:${ioc.value}`;
      if (seen.has(key)) {
        duplicates.push({
          original: seen.get(key),
          duplicate: ioc
        });
      } else {
        seen.set(key, ioc);
      }
    }

    return duplicates;
  }

  /**
   * Count IoCs
   */
  async count(criteria = {}) {
    const results = await this.find(criteria);
    return results.length;
  }

  /**
   * Clear all IoCs (for testing)
   */
  async clear() {
    this.iocs.clear();
    this.valueIndex.clear();
  }
}

module.exports = new IoCRepository();
