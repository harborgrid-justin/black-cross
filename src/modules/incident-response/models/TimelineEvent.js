/**
 * Timeline Event Model
 * Model for incident timeline events
 */

const { v4: uuidv4 } = require('uuid');

// Event type enum
const EventType = {
  INCIDENT_CREATED: 'incident_created',
  STATUS_CHANGED: 'status_changed',
  ASSIGNED: 'assigned',
  COMMENT_ADDED: 'comment_added',
  EVIDENCE_ADDED: 'evidence_added',
  WORKFLOW_EXECUTED: 'workflow_executed',
  NOTIFICATION_SENT: 'notification_sent',
  ESCALATED: 'escalated',
  RELATED_INCIDENT: 'related_incident',
  CUSTOM: 'custom'
};

/**
 * TimelineEvent class for incident timeline tracking
 */
class TimelineEvent {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.incident_id = data.incident_id;
    this.type = data.type || EventType.CUSTOM;
    this.title = data.title || '';
    this.description = data.description || '';
    this.timestamp = data.timestamp || new Date();
    this.user_id = data.user_id || null;
    this.metadata = data.metadata || {};
    this.evidence_ids = data.evidence_ids || [];
    this.annotations = data.annotations || [];
    this.created_at = data.created_at || new Date();
  }

  /**
   * Add annotation to event
   */
  addAnnotation(user_id, text) {
    this.annotations.push({
      id: uuidv4(),
      user_id,
      text,
      created_at: new Date()
    });
  }

  toJSON() {
    return {
      id: this.id,
      incident_id: this.incident_id,
      type: this.type,
      title: this.title,
      description: this.description,
      timestamp: this.timestamp,
      user_id: this.user_id,
      metadata: this.metadata,
      evidence_ids: this.evidence_ids,
      annotations: this.annotations,
      created_at: this.created_at
    };
  }
}

module.exports = {
  TimelineEvent,
  EventType
};
