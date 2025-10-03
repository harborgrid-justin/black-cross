/**
 * LogSource Model
 * 
 * Represents a log source configuration
 */

const { v4: uuidv4 } = require('uuid');

class LogSource {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.description = data.description || '';
    this.source_type = data.source_type || 'syslog'; // syslog, cef, leef, json, windows_event, aws, azure, gcp
    this.protocol = data.protocol || 'udp'; // udp, tcp, http, https
    this.host = data.host || null;
    this.port = data.port || null;
    this.parser_config = data.parser_config || {};
    this.normalization_rules = data.normalization_rules || [];
    this.enrichment_enabled = data.enrichment_enabled !== undefined ? data.enrichment_enabled : true;
    this.status = data.status || 'active'; // active, inactive, error
    this.last_event_time = data.last_event_time || null;
    this.event_count = data.event_count || 0;
    this.error_count = data.error_count || 0;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Update last event time
   */
  recordEvent() {
    this.last_event_time = new Date();
    this.event_count++;
    this.updated_at = new Date();
  }

  /**
   * Record parsing error
   */
  recordError() {
    this.error_count++;
    this.updated_at = new Date();
  }

  /**
   * Update source status
   */
  updateStatus(status) {
    this.status = status;
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
      source_type: this.source_type,
      protocol: this.protocol,
      host: this.host,
      port: this.port,
      parser_config: this.parser_config,
      normalization_rules: this.normalization_rules,
      enrichment_enabled: this.enrichment_enabled,
      status: this.status,
      last_event_time: this.last_event_time,
      event_count: this.event_count,
      error_count: this.error_count,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = LogSource;
