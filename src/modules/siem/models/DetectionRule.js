/**
 * DetectionRule Model
 * 
 * Represents a custom detection rule for security events
 */

const { v4: uuidv4 } = require('uuid');

class DetectionRule {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.description = data.description || '';
    this.enabled = data.enabled !== undefined ? data.enabled : true;
    this.severity = data.severity || 'medium'; // critical, high, medium, low, info
    this.rule_type = data.rule_type || 'threshold'; // threshold, anomaly, correlation, signature
    this.conditions = data.conditions || [];
    this.threshold = data.threshold || null;
    this.time_window = data.time_window || 300; // seconds
    this.alert_template = data.alert_template || {};
    this.actions = data.actions || [];
    this.tags = data.tags || [];
    this.version = data.version || 1;
    this.created_by = data.created_by || null;
    this.last_modified_by = data.last_modified_by || null;
    this.last_triggered = data.last_triggered || null;
    this.trigger_count = data.trigger_count || 0;
    this.false_positive_count = data.false_positive_count || 0;
    this.schedule = data.schedule || null;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Trigger rule and record statistics
   */
  trigger() {
    this.last_triggered = new Date();
    this.trigger_count++;
    this.updated_at = new Date();
  }

  /**
   * Record false positive
   */
  recordFalsePositive() {
    this.false_positive_count++;
    this.updated_at = new Date();
  }

  /**
   * Calculate rule effectiveness
   */
  getEffectiveness() {
    if (this.trigger_count === 0) return 0;
    return ((this.trigger_count - this.false_positive_count) / this.trigger_count * 100).toFixed(2);
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
   * Update rule version
   */
  updateVersion(userId) {
    this.version++;
    this.last_modified_by = userId;
    this.updated_at = new Date();
  }

  /**
   * Evaluate if event matches rule conditions
   */
  matches(event) {
    if (!this.enabled) return false;

    // Simple condition matching logic
    return this.conditions.every(condition => {
      const eventValue = event[condition.field] || event.normalized_fields[condition.field];
      
      switch (condition.operator) {
        case 'equals':
          return eventValue === condition.value;
        case 'contains':
          return String(eventValue).includes(condition.value);
        case 'regex':
          return new RegExp(condition.value).test(eventValue);
        case 'greater_than':
          return Number(eventValue) > Number(condition.value);
        case 'less_than':
          return Number(eventValue) < Number(condition.value);
        default:
          return false;
      }
    });
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
      severity: this.severity,
      rule_type: this.rule_type,
      conditions: this.conditions,
      threshold: this.threshold,
      time_window: this.time_window,
      alert_template: this.alert_template,
      actions: this.actions,
      tags: this.tags,
      version: this.version,
      created_by: this.created_by,
      last_modified_by: this.last_modified_by,
      last_triggered: this.last_triggered,
      trigger_count: this.trigger_count,
      false_positive_count: this.false_positive_count,
      effectiveness: this.getEffectiveness(),
      schedule: this.schedule,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = DetectionRule;
