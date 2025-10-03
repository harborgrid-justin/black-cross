/**
 * Feed Source Management Service
 *
 * Business logic for managing commercial and open-source feed sources
 */

const { feedSourceRepository } = require('../repositories');

class FeedSourceManagementService {
  /**
   * Create a new feed source
   */
  async createFeedSource(feedSourceData) {
    const existing = await feedSourceRepository.findByName(feedSourceData.name);
    if (existing) {
      throw new Error('Feed source with this name already exists');
    }

    return await feedSourceRepository.create(feedSourceData);
  }

  /**
   * Get feed source by ID
   */
  async getFeedSource(id) {
    return await feedSourceRepository.findById(id);
  }

  /**
   * Update feed source
   */
  async updateFeedSource(id, updateData) {
    const source = await feedSourceRepository.findById(id);
    if (!source) {
      throw new Error('Feed source not found');
    }

    return await feedSourceRepository.update(id, updateData);
  }

  /**
   * Delete feed source
   */
  async deleteFeedSource(id) {
    const source = await feedSourceRepository.findById(id);
    if (!source) {
      throw new Error('Feed source not found');
    }

    return await feedSourceRepository.delete(id);
  }

  /**
   * List all feed sources
   */
  async listFeedSources(filters = {}) {
    return await feedSourceRepository.findAll(filters);
  }

  /**
   * Get commercial feed sources
   */
  async getCommercialFeeds(filters = {}) {
    return await feedSourceRepository.findAll({
      ...filters,
      type: 'commercial'
    });
  }

  /**
   * Get open-source feed sources
   */
  async getOpenSourceFeeds(filters = {}) {
    return await feedSourceRepository.findAll({
      ...filters,
      type: 'opensource'
    });
  }

  /**
   * Get government feed sources
   */
  async getGovernmentFeeds(filters = {}) {
    return await feedSourceRepository.findAll({
      ...filters,
      type: 'government'
    });
  }

  /**
   * Get community feed sources
   */
  async getCommunityFeeds(filters = {}) {
    return await feedSourceRepository.findAll({
      ...filters,
      type: 'community'
    });
  }

  /**
   * Get feed sources by category
   */
  async getFeedsByCategory(category) {
    return await feedSourceRepository.findByCategory(category);
  }

  /**
   * Get feed source statistics
   */
  async getFeedSourceStatistics() {
    return await feedSourceRepository.getStatistics();
  }

  /**
   * Get recommended feed sources based on requirements
   */
  async getRecommendedFeeds(requirements = {}) {
    const allFeeds = await feedSourceRepository.findAll({ limit: 1000 });
    const recommendations = [];

    for (const feed of allFeeds.data) {
      let score = 0;
      const reasons = [];

      // Category match
      if (requirements.category && feed.category === requirements.category) {
        score += 30;
        reasons.push(`Matches required category: ${requirements.category}`);
      }

      // Type preference
      if (requirements.type && feed.type === requirements.type) {
        score += 20;
        reasons.push(`Matches feed type preference: ${requirements.type}`);
      }

      // Reliability threshold
      if (requirements.min_reliability) {
        if (feed.reliability_score >= requirements.min_reliability) {
          score += 25;
          reasons.push(`Meets reliability threshold: ${feed.reliability_score}%`);
        } else {
          continue; // Skip if below minimum reliability
        }
      } else {
        // Add reliability as base score
        score += (feed.reliability_score / 100) * 25;
      }

      // Format preference
      if (requirements.format && feed.format === requirements.format) {
        score += 15;
        reasons.push(`Supports required format: ${requirements.format}`);
      }

      // Cost consideration
      if (requirements.budget) {
        if (feed.metadata.cost === null || feed.metadata.cost === 0) {
          score += 10;
          reasons.push('Free feed source');
        } else if (feed.metadata.cost <= requirements.budget) {
          score += 5;
          reasons.push('Within budget');
        }
      }

      if (score > 0) {
        recommendations.push({
          feed: feed.toJSON(),
          recommendation_score: score,
          reasons
        });
      }
    }

    // Sort by recommendation score
    recommendations.sort((a, b) => b.recommendation_score - a.recommendation_score);

    return {
      total_recommendations: recommendations.length,
      requirements,
      recommendations: recommendations.slice(0, 10) // Top 10
    };
  }

  /**
   * Test feed source connectivity
   */
  async testFeedSource(feedSourceId) {
    const source = await feedSourceRepository.findById(feedSourceId);
    if (!source) {
      throw new Error('Feed source not found');
    }

    const testResult = {
      feed_id: feedSourceId,
      feed_name: source.name,
      connectivity: false,
      authentication: false,
      format_valid: false,
      response_time: 0,
      errors: [],
      tested_at: new Date()
    };

    try {
      const ParsingService = require('./ParsingService');
      const startTime = Date.now();

      // Try to fetch and parse the feed
      await ParsingService.parseFeed(source);

      testResult.connectivity = true;
      testResult.authentication = true;
      testResult.format_valid = true;
      testResult.response_time = Date.now() - startTime;
    } catch (error) {
      testResult.errors.push(error.message);

      if (error.message.includes('authentication') || error.message.includes('401')) {
        testResult.authentication = false;
      }
      if (error.message.includes('format') || error.message.includes('parse')) {
        testResult.format_valid = false;
      }
      if (error.message.includes('fetch') || error.message.includes('network')) {
        testResult.connectivity = false;
      }
    }

    return testResult;
  }

  /**
   * Get feed source coverage analysis
   */
  async getCoverageAnalysis() {
    const allFeeds = await feedSourceRepository.findAll({ limit: 1000 });

    const coverage = {
      by_category: {},
      by_format: {},
      by_type: {},
      gaps: []
    };

    // Analyze coverage
    allFeeds.data.forEach((feed) => {
      // Category coverage
      if (feed.category) {
        coverage.by_category[feed.category] = (coverage.by_category[feed.category] || 0) + 1;
      }

      // Format coverage
      coverage.by_format[feed.format] = (coverage.by_format[feed.format] || 0) + 1;

      // Type coverage
      coverage.by_type[feed.type] = (coverage.by_type[feed.type] || 0) + 1;
    });

    // Identify gaps
    const expectedCategories = ['malware', 'phishing', 'ransomware', 'apt', 'general'];
    expectedCategories.forEach((cat) => {
      if (!coverage.by_category[cat] || coverage.by_category[cat] < 2) {
        coverage.gaps.push({
          type: 'category',
          name: cat,
          severity: 'medium',
          recommendation: `Add more ${cat} threat intelligence feeds`
        });
      }
    });

    // Check for format diversity
    if (Object.keys(coverage.by_format).length < 3) {
      coverage.gaps.push({
        type: 'format',
        severity: 'low',
        recommendation: 'Consider adding feeds in different formats for redundancy'
      });
    }

    return coverage;
  }

  /**
   * Bulk import feed sources
   */
  async bulkImportFeeds(feedSources) {
    const results = {
      total: feedSources.length,
      imported: 0,
      failed: 0,
      errors: []
    };

    for (const feedData of feedSources) {
      try {
        await this.createFeedSource(feedData);
        results.imported++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          feed_name: feedData.name,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Export feed source configurations
   */
  async exportFeedConfigurations(feedSourceIds = []) {
    let feeds;

    if (feedSourceIds.length > 0) {
      feeds = [];
      for (const id of feedSourceIds) {
        const feed = await feedSourceRepository.findById(id);
        if (feed) feeds.push(feed);
      }
    } else {
      const result = await feedSourceRepository.findAll({ limit: 10000 });
      feeds = result.data;
    }

    return {
      export_date: new Date(),
      total_feeds: feeds.length,
      feeds: feeds.map((f) => ({
        name: f.name,
        type: f.type,
        url: f.url,
        format: f.format,
        schedule: f.schedule,
        category: f.category,
        priority: f.priority,
        metadata: f.metadata,
        // Exclude sensitive authentication data
        authentication: f.authentication ? { type: f.authentication.type } : null
      }))
    };
  }

  /**
   * Get feed integration templates
   */
  getIntegrationTemplates() {
    return {
      'AlienVault OTX': {
        type: 'commercial',
        format: 'json',
        authentication: { type: 'api_key' },
        url: 'https://otx.alienvault.com/api/v1/pulses/subscribed',
        category: 'general'
      },
      MISP: {
        type: 'opensource',
        format: 'misp',
        authentication: { type: 'api_key' },
        url: 'https://your-misp-instance/events',
        category: 'general'
      },
      'Abuse.ch': {
        type: 'opensource',
        format: 'csv',
        authentication: null,
        url: 'https://urlhaus.abuse.ch/downloads/csv_recent/',
        category: 'malware'
      },
      OpenCTI: {
        type: 'opensource',
        format: 'stix',
        authentication: { type: 'api_key' },
        url: 'https://your-opencti-instance/api',
        category: 'general'
      }
    };
  }
}

module.exports = new FeedSourceManagementService();
