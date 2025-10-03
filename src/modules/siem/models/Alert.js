/**
 * Alert Model
 * 
 * Represents a security alert generated from events or rules
 */

const { v4: uuidv4 } = require('uuid');

class Alert {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.title = data.title || '';
    this.description = data.description || '';
    this.severity = data.severity || 'medium'; // critical, high, medium, low, info
    this.priority = data.priority || 'medium'; // critical, high, medium, low
    this.status = data.status || 'open'; // open, acknowledged, investigating, resolved, false_positive
    this.rule_id = data.rule_id || null;
    this.rule_name = data.rule_name || null;
    this.event_ids = data.event_ids || [];
    this.correlation_id = data.correlation_id || null;
    this.source_events = data.source_events || [];
    this.assigned_to = data.assigned_to || null;
    this.assigned_at = data.assigned_at || null;
    this.acknowledged_by = data.acknowledged_by || null;
    this.acknowledged_at = data.acknowledged_at || null;
    this.resolved_by = data.resolved_by || null;
    this.resolved_at = data.resolved_at || null;
    this.resolution_notes = data.resolution_notes || '';
    this.false_positive = data.false_positive || false;
    this.suppressed = data.suppressed || false;
    this.suppression_reason = data.suppression_reason || '';
    this.escalated = data.escalated || false;
    this.escalation_level = data.escalation_level || 0;
    this.tags = data.tags || [];
    this.comments = data.comments || [];
    this.actions_taken = data.actions_taken || [];
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Acknowledge alert
   */
  acknowledge(userId) {
    this.status = 'acknowledged';
    this.acknowledged_by = userId;
    this.acknowledged_at = new Date();
    this.updated_at = new Date();
  }

  /**
   * Assign alert to user
   */
  assign(userId) {
    this.assigned_to = userId;
    this.assigned_at = new Date();
    this.updated_at = new Date();
  }

  /**
   * Resolve alert
   */
  resolve(userId, notes) {
    this.status = 'resolved';
    this.resolved_by = userId;
    this.resolved_at = new Date();
    this.resolution_notes = notes;
    this.updated_at = new Date();
  }

  /**
   * Mark as false positive
   */
  markAsFalsePositive(userId, reason) {
    this.status = 'false_positive';
    this.false_positive = true;
    this.resolved_by = userId;
    this.resolved_at = new Date();
    this.resolution_notes = reason;
    this.updated_at = new Date();
  }

  /**
   * Suppress alert
   */
  suppress(reason) {
    this.suppressed = true;
    this.suppression_reason = reason;
    this.updated_at = new Date();
  }

  /**
   * Escalate alert
   */
  escalate() {
    this.escalated = true;
    this.escalation_level++;
    this.updated_at = new Date();
  }

  /**
   * Add comment to alert
   */
  addComment(userId, comment) {
    this.comments.push({
      user_id: userId,
      comment: comment,
      timestamp: new Date()
    });
    this.updated_at = new Date();
  }

  /**
   * Record action taken
   */
  recordAction(action, userId) {
    this.actions_taken.push({
      action: action,
      user_id: userId,
      timestamp: new Date()
    });
    this.updated_at = new Date();
  }

  /**
   * Convert to plain object for storage/API
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      severity: this.severity,
      priority: this.priority,
      status: this.status,
      rule_id: this.rule_id,
      rule_name: this.rule_name,
      event_ids: this.event_ids,
      correlation_id: this.correlation_id,
      source_events: this.source_events,
      assigned_to: this.assigned_to,
      assigned_at: this.assigned_at,
      acknowledged_by: this.acknowledged_by,
      acknowledged_at: this.acknowledged_at,
      resolved_by: this.resolved_by,
      resolved_at: this.resolved_at,
      resolution_notes: this.resolution_notes,
      false_positive: this.false_positive,
      suppressed: this.suppressed,
      suppression_reason: this.suppression_reason,
      escalated: this.escalated,
      escalation_level: this.escalation_level,
      tags: this.tags,
      comments: this.comments,
      actions_taken: this.actions_taken,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Alert;
