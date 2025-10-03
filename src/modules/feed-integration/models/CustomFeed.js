/**
 * CustomFeed Model
 *
 * Represents a custom-created threat intelligence feed
 */

const { v4: uuidv4 } = require('uuid');

class CustomFeed {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.description = data.description || '';
    this.output_format = data.output_format || 'json'; // json, csv, stix, xml
    this.fields = data.fields || []; // Array of field definitions
    this.filters = data.filters || {}; // Filtering criteria
    this.distribution = data.distribution || 'internal'; // internal, external, restricted
    this.access_control = data.access_control || {
      users: [],
      teams: [],
      organizations: []
    };
    this.version = data.version || '1.0.0';
    this.auto_update = data.auto_update !== undefined ? data.auto_update : true;
    this.update_frequency = data.update_frequency || '0 */1 * * *'; // hourly by default
    this.documentation = data.documentation || '';
    this.statistics = data.statistics || {
      total_items: 0,
      subscribers: 0,
      downloads: 0
    };
    this.created_by = data.created_by || null;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Add field definition
   */
  addField(field) {
    this.fields.push({
      name: field.name,
      type: field.type,
      required: field.required || false,
      description: field.description || ''
    });
    this.updated_at = new Date();
  }

  /**
   * Update filters
   */
  updateFilters(filters) {
    this.filters = { ...this.filters, ...filters };
    this.updated_at = new Date();
  }

  /**
   * Record download
   */
  recordDownload() {
    this.statistics.downloads++;
    this.updated_at = new Date();
  }

  /**
   * Convert to plain object for storage/API
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      output_format: this.output_format,
      fields: this.fields,
      filters: this.filters,
      distribution: this.distribution,
      access_control: this.access_control,
      version: this.version,
      auto_update: this.auto_update,
      update_frequency: this.update_frequency,
      documentation: this.documentation,
      statistics: this.statistics,
      created_by: this.created_by,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = CustomFeed;
