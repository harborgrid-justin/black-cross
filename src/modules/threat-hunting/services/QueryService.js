/**
 * Query Service
 * Business logic for advanced query builder (Feature 3.1)
 */

const HuntQuery = require('../models/HuntQuery');
const database = require('../models/database');

class QueryService {
  /**
   * Execute a hunt query
   */
  async executeQuery(queryData, userId) {
    const query = new HuntQuery({
      ...queryData,
      createdBy: userId,
    });

    // Validate query syntax
    this.validateQuerySyntax(query.query, query.queryLanguage);

    // Save query if it's new
    let savedQuery = query;
    if (!query.id) {
      savedQuery = await database.saveQuery(query.toJSON());
    }

    // Simulate query execution
    const results = await this.performQuery(query.query, query.dataSources);

    // Update execution stats
    await database.updateQuery(savedQuery.id, {
      executionCount: (savedQuery.executionCount || 0) + 1,
      lastExecutedAt: new Date(),
    });

    return {
      queryId: savedQuery.id,
      results,
      executionTime: results.executionTime,
      rowsReturned: results.data.length,
    };
  }

  /**
   * Save a query for future use
   */
  async saveQuery(queryData, userId) {
    const query = new HuntQuery({
      ...queryData,
      createdBy: userId,
    });

    this.validateQuerySyntax(query.query, query.queryLanguage);

    const saved = await database.saveQuery(query.toJSON());
    return HuntQuery.fromDatabase(saved);
  }

  /**
   * List saved queries
   */
  async listQueries(filters = {}) {
    const queries = await database.listQueries(filters);
    return queries.map((q) => HuntQuery.fromDatabase(q));
  }

  /**
   * Get a specific query
   */
  async getQuery(queryId) {
    const query = await database.getQuery(queryId);
    if (!query) {
      throw new Error('Query not found');
    }
    return HuntQuery.fromDatabase(query);
  }

  /**
   * Update a query
   */
  async updateQuery(queryId, updates, userId) {
    const query = await database.getQuery(queryId);
    if (!query) {
      throw new Error('Query not found');
    }

    if (query.createdBy !== userId) {
      throw new Error('Unauthorized to update this query');
    }

    if (updates.query) {
      this.validateQuerySyntax(updates.query, updates.queryLanguage || query.queryLanguage);
    }

    const updated = await database.updateQuery(queryId, updates);
    return HuntQuery.fromDatabase(updated);
  }

  /**
   * Delete a query
   */
  async deleteQuery(queryId, userId) {
    const query = await database.getQuery(queryId);
    if (!query) {
      throw new Error('Query not found');
    }

    if (query.createdBy !== userId) {
      throw new Error('Unauthorized to delete this query');
    }

    return database.deleteQuery(queryId);
  }

  /**
   * Get query templates
   */
  async getTemplates() {
    const templates = await database.listQueries({ isTemplate: true });
    return templates.map((t) => HuntQuery.fromDatabase(t));
  }

  /**
   * Validate query syntax
   */
  validateQuerySyntax(query, language) {
    if (!query || query.trim().length === 0) {
      throw new Error('Query cannot be empty');
    }

    // Basic validation based on language
    if (language === 'sql') {
      const forbidden = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER'];
      const upperQuery = query.toUpperCase();
      forbidden.forEach((word) => {
        if (upperQuery.includes(word)) {
          throw new Error(`Forbidden keyword: ${word}`);
        }
      });
    }

    return true;
  }

  /**
   * Perform the actual query (simulated)
   */
  async performQuery(query, dataSources) {
    const startTime = Date.now();

    // Simulate query execution with mock data
    await new Promise((resolve) => { setTimeout(resolve, 100); });

    const mockData = [
      {
        id: 1, timestamp: new Date(), event: 'login_attempt', user: 'admin', source_ip: '192.168.1.100',
      },
      {
        id: 2, timestamp: new Date(), event: 'file_access', user: 'admin', resource: '/etc/passwd',
      },
      {
        id: 3, timestamp: new Date(), event: 'network_scan', source_ip: '192.168.1.100', ports: [22, 80, 443],
      },
    ];

    const executionTime = Date.now() - startTime;

    return {
      data: mockData,
      executionTime,
      dataSources,
    };
  }

  /**
   * Optimize query performance
   */
  async optimizeQuery(query, _language) {
    // Simulate query optimization
    const suggestions = [
      'Add index on timestamp column',
      'Consider limiting result set size',
      'Use prepared statements for better caching',
    ];

    return {
      originalQuery: query,
      optimizedQuery: query,
      suggestions,
    };
  }
}

module.exports = new QueryService();
