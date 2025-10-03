/**
 * Custom Feed Service
 *
 * Business logic for custom feed creation and management
 */

const { customFeedRepository, feedItemRepository } = require('../repositories');

class CustomFeedService {
  /**
   * Create a custom feed
   */
  async createCustomFeed(feedData) {
    const existing = await customFeedRepository.findByName(feedData.name);
    if (existing) {
      throw new Error('Custom feed with this name already exists');
    }

    return await customFeedRepository.create(feedData);
  }

  /**
   * Get custom feed by ID
   */
  async getCustomFeed(id) {
    return await customFeedRepository.findById(id);
  }

  /**
   * Update custom feed
   */
  async updateCustomFeed(id, updateData) {
    const feed = await customFeedRepository.findById(id);
    if (!feed) {
      throw new Error('Custom feed not found');
    }

    // Increment version if significant changes
    if (updateData.fields || updateData.filters) {
      const versionParts = feed.version.split('.');
      versionParts[1] = parseInt(versionParts[1]) + 1;
      updateData.version = versionParts.join('.');
    }

    return await customFeedRepository.update(id, updateData);
  }

  /**
   * Delete custom feed
   */
  async deleteCustomFeed(id) {
    const feed = await customFeedRepository.findById(id);
    if (!feed) {
      throw new Error('Custom feed not found');
    }

    return await customFeedRepository.delete(id);
  }

  /**
   * List custom feeds
   */
  async listCustomFeeds(filters = {}) {
    return await customFeedRepository.findAll(filters);
  }

  /**
   * Generate feed data based on custom feed configuration
   */
  async generateFeedData(customFeedId) {
    const customFeed = await customFeedRepository.findById(customFeedId);
    if (!customFeed) {
      throw new Error('Custom feed not found');
    }

    // Get feed items based on filters
    const items = await feedItemRepository.findAll({
      ...customFeed.filters,
      limit: 10000
    });

    // Apply field selection
    const selectedData = items.data.map((item) => {
      const selected = {};

      if (customFeed.fields.length > 0) {
        // Only include specified fields
        customFeed.fields.forEach((field) => {
          if (item[field.name] !== undefined) {
            selected[field.name] = item[field.name];
          }
        });
      } else {
        // Include all fields
        return item.toJSON();
      }

      return selected;
    });

    // Format based on output format
    const formattedData = this.formatFeedOutput(selectedData, customFeed.output_format);

    // Update statistics
    customFeed.statistics.total_items = selectedData.length;
    await customFeedRepository.update(customFeedId, customFeed);

    return {
      feed_id: customFeedId,
      feed_name: customFeed.name,
      version: customFeed.version,
      format: customFeed.output_format,
      item_count: selectedData.length,
      generated_at: new Date(),
      data: formattedData
    };
  }

  /**
   * Format feed output based on specified format
   */
  formatFeedOutput(data, format) {
    switch (format.toLowerCase()) {
      case 'json':
        return data;

      case 'csv':
        return this.convertToCSV(data);

      case 'xml':
        return this.convertToXML(data);

      case 'stix':
        return this.convertToSTIX(data);

      default:
        return data;
    }
  }

  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = [headers.join(',')];

    data.forEach((item) => {
      const values = headers.map((header) => {
        const value = item[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      rows.push(values.join(','));
    });

    return rows.join('\n');
  }

  /**
   * Convert data to XML format
   */
  convertToXML(data) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<feed>\n';

    data.forEach((item) => {
      xml += '  <item>\n';
      Object.entries(item).forEach(([key, value]) => {
        xml += `    <${key}>${this.escapeXML(value)}</${key}>\n`;
      });
      xml += '  </item>\n';
    });

    xml += '</feed>';
    return xml;
  }

  /**
   * Escape XML special characters
   */
  escapeXML(value) {
    if (typeof value !== 'string') return value;
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Convert data to STIX format
   */
  convertToSTIX(data) {
    return {
      type: 'bundle',
      id: `bundle--${this.generateUUID()}`,
      spec_version: '2.1',
      objects: data.map((item) => ({
        type: 'indicator',
        id: `indicator--${item.id || this.generateUUID()}`,
        created: item.created_at || new Date().toISOString(),
        modified: item.updated_at || new Date().toISOString(),
        name: item.title || item.value,
        pattern: `[${item.indicator_type}:value = '${item.value}']`,
        valid_from: item.first_seen || new Date().toISOString(),
        indicator_types: item.categories || [],
        confidence: item.confidence || 50
      }))
    };
  }

  /**
   * Generate simple UUID
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Add field to custom feed
   */
  async addField(customFeedId, field) {
    const feed = await customFeedRepository.findById(customFeedId);
    if (!feed) {
      throw new Error('Custom feed not found');
    }

    feed.addField(field);
    return await customFeedRepository.update(customFeedId, feed);
  }

  /**
   * Update filters for custom feed
   */
  async updateFilters(customFeedId, filters) {
    const feed = await customFeedRepository.findById(customFeedId);
    if (!feed) {
      throw new Error('Custom feed not found');
    }

    feed.updateFilters(filters);
    return await customFeedRepository.update(customFeedId, feed);
  }

  /**
   * Publish custom feed
   */
  async publishFeed(customFeedId) {
    const feedData = await this.generateFeedData(customFeedId);

    // In a real implementation, this would publish to a distribution endpoint
    // For now, we just return the feed data

    const feed = await customFeedRepository.findById(customFeedId);
    feed.recordDownload();
    await customFeedRepository.update(customFeedId, feed);

    return {
      ...feedData,
      published: true,
      published_at: new Date()
    };
  }

  /**
   * Get custom feed statistics
   */
  async getStatistics() {
    return await customFeedRepository.getStatistics();
  }

  /**
   * Get custom feed documentation
   */
  async getDocumentation(customFeedId) {
    const feed = await customFeedRepository.findById(customFeedId);
    if (!feed) {
      throw new Error('Custom feed not found');
    }

    return {
      feed_id: feed.id,
      name: feed.name,
      description: feed.description,
      version: feed.version,
      output_format: feed.output_format,
      fields: feed.fields,
      filters: feed.filters,
      distribution: feed.distribution,
      documentation: feed.documentation,
      usage: {
        total_downloads: feed.statistics.downloads,
        subscribers: feed.statistics.subscribers
      },
      examples: this.generateExamples(feed)
    };
  }

  /**
   * Generate usage examples for custom feed
   */
  generateExamples(feed) {
    const examples = [];

    // REST API example
    examples.push({
      type: 'REST API',
      method: 'GET',
      url: `/api/v1/feeds/custom/${feed.id}/generate`,
      description: 'Fetch the latest feed data'
    });

    // cURL example
    examples.push({
      type: 'cURL',
      command: `curl -X GET "https://api.example.com/api/v1/feeds/custom/${feed.id}/generate" -H "Authorization: Bearer YOUR_TOKEN"`,
      description: 'Download feed using cURL'
    });

    return examples;
  }

  /**
   * Validate custom feed configuration
   */
  validateFeedConfig(feedData) {
    const errors = [];

    if (!feedData.name || feedData.name.trim() === '') {
      errors.push('Feed name is required');
    }

    if (!feedData.output_format) {
      errors.push('Output format is required');
    }

    const validFormats = ['json', 'csv', 'xml', 'stix'];
    if (feedData.output_format && !validFormats.includes(feedData.output_format.toLowerCase())) {
      errors.push(`Invalid output format. Must be one of: ${validFormats.join(', ')}`);
    }

    if (feedData.fields) {
      feedData.fields.forEach((field, index) => {
        if (!field.name) {
          errors.push(`Field at index ${index} is missing name`);
        }
        if (!field.type) {
          errors.push(`Field '${field.name}' is missing type`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new CustomFeedService();
