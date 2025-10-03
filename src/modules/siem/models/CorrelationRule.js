/**
 * CorrelationRule Model
 * 
 * Represents a rule for correlating multiple security events
 */

const { v4: uuidv4 } = require('uuid');

class CorrelationRule {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.description = data.description || '';
    this.enabled = data.enabled !== undefined ? data.enabled : true;
    this.correlation_type = data.correlation_type || 'sequential'; // sequential, parallel, grouped
    this.event_conditions = data.event_conditions || [];
    this.time_window = data.time_window || 600; // seconds
    this.min_events = data.min_events || 2;
    this.max_events = data.max_events || null;
    this.grouping_fields = data.grouping_fields || [];
    this.severity = data.severity || 'medium';
    this.alert_on_match = data.alert_on_match !== undefined ? data.alert_on_match : true;
    this.actions = data.actions || [];
    this.created_by = data.created_by || null;
    this.last_matched = data.last_matched || null;
    this.match_count = data.match_count || 0;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Record correlation match
   */
  recordMatch() {
    this.last_matched = new Date();
    this.match_count++;
    this.updated_at = new Date();
  }

  /**
   * Enable rule
   */
  enable() {
    this.enabled = true;
    this.updated_at = new Date();
  }

  /**
   * Disable rule
   */
  disable() {
    this.enabled = false;
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
      enabled: this.enabled,
      correlation_type: this.correlation_type,
      event_conditions: this.event_conditions,
      time_window: this.time_window,
      min_events: this.min_events,
      max_events: this.max_events,
      grouping_fields: this.grouping_fields,
      severity: this.severity,
      alert_on_match: this.alert_on_match,
      actions: this.actions,
      created_by: this.created_by,
      last_matched: this.last_matched,
      match_count: this.match_count,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = CorrelationRule;
