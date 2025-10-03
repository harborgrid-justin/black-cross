/**
 * IoC Search and Filtering Service
 * 
 * Sub-feature 7.7: IoC Search and Filtering
 * Advanced search and filtering capabilities
 */

const { iocRepository } = require('../repositories');

class SearchService {
  /**
   * Simple search
   */
  async search(query, options = {}) {
    const {
      type = null,
      status = null,
      limit = 50,
      offset = 0
    } = options;

    return await iocRepository.search(query, { type, status, limit, offset });
  }

  /**
   * Advanced search with complex criteria
   */
  async advancedSearch(criteria) {
    const {
      query = null,
      type = null,
      types = [],
      status = null,
      severity = null,
      min_confidence = null,
      max_confidence = null,
      tags = [],
      tags_operator = 'OR',  // OR, AND
      sources = [],
      date_range = null,
      has_enrichment = null,
      has_sightings = null,
      sighting_count_min = null,
      sighting_count_max = null,
      sort_by = 'confidence',
      sort_order = 'desc',
      limit = 50,
      offset = 0
    } = criteria;

    let results = await iocRepository.find();

    // Apply filters
    if (query) {
      const queryLower = query.toLowerCase();
      results = results.filter(ioc => 
        ioc.value.toLowerCase().includes(queryLower) ||
        ioc.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
        (ioc.metadata.description && ioc.metadata.description.toLowerCase().includes(queryLower))
      );
    }

    if (type) {
      results = results.filter(ioc => ioc.type === type);
    }

    if (types && types.length > 0) {
      results = results.filter(ioc => types.includes(ioc.type));
    }

    if (status) {
      results = results.filter(ioc => ioc.status === status);
    }

    if (severity) {
      results = results.filter(ioc => ioc.severity === severity);
    }

    if (min_confidence !== null) {
      results = results.filter(ioc => ioc.confidence >= min_confidence);
    }

    if (max_confidence !== null) {
      results = results.filter(ioc => ioc.confidence <= max_confidence);
    }

    // Tags filtering
    if (tags && tags.length > 0) {
      if (tags_operator === 'AND') {
        results = results.filter(ioc => 
          tags.every(tag => ioc.tags.includes(tag))
        );
      } else { // OR
        results = results.filter(ioc => 
          tags.some(tag => ioc.tags.includes(tag))
        );
      }
    }

    // Sources filtering
    if (sources && sources.length > 0) {
      results = results.filter(ioc => 
        ioc.sources.some(s => sources.includes(s.name))
      );
    }

    // Date range filtering
    if (date_range) {
      if (date_range.start) {
        const startDate = new Date(date_range.start);
        results = results.filter(ioc => new Date(ioc.first_seen) >= startDate);
      }
      if (date_range.end) {
        const endDate = new Date(date_range.end);
        results = results.filter(ioc => new Date(ioc.first_seen) <= endDate);
      }
    }

    // Enrichment filtering
    if (has_enrichment !== null) {
      results = results.filter(ioc => {
        const hasEnrich = Object.values(ioc.enrichment).some(v => v !== null && v !== undefined);
        return has_enrichment ? hasEnrich : !hasEnrich;
      });
    }

    // Sightings filtering
    if (has_sightings !== null) {
      results = results.filter(ioc => {
        const hasSight = ioc.sightings.length > 0;
        return has_sightings ? hasSight : !hasSight;
      });
    }

    if (sighting_count_min !== null) {
      results = results.filter(ioc => ioc.sightings.length >= sighting_count_min);
    }

    if (sighting_count_max !== null) {
      results = results.filter(ioc => ioc.sightings.length <= sighting_count_max);
    }

    // Sorting
    results = this.sortResults(results, sort_by, sort_order);

    // Pagination
    const total = results.length;
    const paginated = results.slice(offset, offset + limit);

    return {
      data: paginated.map(ioc => ioc.toJSON ? ioc.toJSON() : ioc),
      total,
      limit,
      offset,
      has_more: (offset + limit) < total
    };
  }

  /**
   * Sort results
   */
  sortResults(results, sortBy, sortOrder) {
    const order = sortOrder === 'asc' ? 1 : -1;

    return results.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'confidence':
          aVal = a.confidence;
          bVal = b.confidence;
          break;
        case 'severity':
          const severityMap = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
          aVal = severityMap[a.severity] || 0;
          bVal = severityMap[b.severity] || 0;
          break;
        case 'first_seen':
          aVal = new Date(a.first_seen);
          bVal = new Date(b.first_seen);
          break;
        case 'last_seen':
          aVal = new Date(a.last_seen);
          bVal = new Date(b.last_seen);
          break;
        case 'sightings':
          aVal = a.sightings.length;
          bVal = b.sightings.length;
          break;
        case 'value':
          aVal = a.value;
          bVal = b.value;
          return order * aVal.localeCompare(bVal);
        default:
          return 0;
      }

      return order * (aVal - bVal);
    });
  }

  /**
   * Filter by tags
   */
  async filterByTags(tags, operator = 'OR') {
    const criteria = { tags, tags_operator: operator };
    return await this.advancedSearch(criteria);
  }

  /**
   * Filter by time range
   */
  async filterByTimeRange(startDate, endDate) {
    const criteria = {
      date_range: { start: startDate, end: endDate }
    };
    return await this.advancedSearch(criteria);
  }

  /**
   * Filter by confidence range
   */
  async filterByConfidence(minConfidence, maxConfidence = 100) {
    const criteria = {
      min_confidence: minConfidence,
      max_confidence: maxConfidence
    };
    return await this.advancedSearch(criteria);
  }

  /**
   * Save search query
   */
  async saveSearch(name, criteria, options = {}) {
    const savedSearch = {
      id: `search-${Date.now()}`,
      name,
      criteria,
      created_at: new Date(),
      created_by: options.user_id || 'system',
      description: options.description || null
    };

    // In production, this would be saved to database
    // For now, return the saved search object
    return savedSearch;
  }

  /**
   * Execute saved search
   */
  async executeSavedSearch(searchId) {
    // Mock - in production, would load from database
    // For now, return empty results
    return {
      search_id: searchId,
      executed_at: new Date(),
      data: [],
      total: 0
    };
  }

  /**
   * Get search facets for filtering UI
   */
  async getSearchFacets() {
    const allIoCs = await iocRepository.find();

    const facets = {
      types: {},
      statuses: {},
      severities: {},
      tags: {},
      sources: {},
      confidence_ranges: {
        'high (80-100)': 0,
        'medium (50-79)': 0,
        'low (0-49)': 0
      }
    };

    allIoCs.forEach(ioc => {
      // Type facets
      facets.types[ioc.type] = (facets.types[ioc.type] || 0) + 1;

      // Status facets
      facets.statuses[ioc.status] = (facets.statuses[ioc.status] || 0) + 1;

      // Severity facets
      facets.severities[ioc.severity] = (facets.severities[ioc.severity] || 0) + 1;

      // Tag facets
      ioc.tags.forEach(tag => {
        facets.tags[tag] = (facets.tags[tag] || 0) + 1;
      });

      // Source facets
      ioc.sources.forEach(source => {
        facets.sources[source.name] = (facets.sources[source.name] || 0) + 1;
      });

      // Confidence range facets
      if (ioc.confidence >= 80) {
        facets.confidence_ranges['high (80-100)']++;
      } else if (ioc.confidence >= 50) {
        facets.confidence_ranges['medium (50-79)']++;
      } else {
        facets.confidence_ranges['low (0-49)']++;
      }
    });

    return facets;
  }

  /**
   * Full-text search across all fields
   */
  async fullTextSearch(query, options = {}) {
    const queryLower = query.toLowerCase();
    const allIoCs = await iocRepository.find();

    const results = allIoCs.filter(ioc => {
      // Search in value
      if (ioc.value.toLowerCase().includes(queryLower)) {
        return true;
      }

      // Search in tags
      if (ioc.tags.some(tag => tag.toLowerCase().includes(queryLower))) {
        return true;
      }

      // Search in metadata
      if (ioc.metadata.description && ioc.metadata.description.toLowerCase().includes(queryLower)) {
        return true;
      }

      // Search in enrichment data
      if (ioc.enrichment.malware_families) {
        if (ioc.enrichment.malware_families.some(f => f.family.toLowerCase().includes(queryLower))) {
          return true;
        }
      }

      if (ioc.enrichment.threat_actors) {
        if (ioc.enrichment.threat_actors.some(a => a.name.toLowerCase().includes(queryLower))) {
          return true;
        }
      }

      return false;
    });

    const limit = options.limit || 50;
    const offset = options.offset || 0;

    return {
      query,
      data: results.slice(offset, offset + limit).map(ioc => ioc.toJSON ? ioc.toJSON() : ioc),
      total: results.length,
      limit,
      offset
    };
  }

  /**
   * Get search suggestions based on partial query
   */
  async getSuggestions(partialQuery, limit = 10) {
    const queryLower = partialQuery.toLowerCase();
    const allIoCs = await iocRepository.find();

    const suggestions = new Set();

    allIoCs.forEach(ioc => {
      // Suggest IoC values
      if (ioc.value.toLowerCase().startsWith(queryLower)) {
        suggestions.add(ioc.value);
      }

      // Suggest tags
      ioc.tags.forEach(tag => {
        if (tag.toLowerCase().startsWith(queryLower)) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Export search results
   */
  async exportSearchResults(criteria, format = 'json') {
    const results = await this.advancedSearch(criteria);
    
    const bulkService = require('./BulkService');
    return await bulkService.bulkExport({ /* Match IoCs from results */ }, { format });
  }
}

module.exports = new SearchService();
