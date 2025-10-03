/**
 * Incident Model
 * Database model for incident tickets
 */

const { v4: uuidv4 } = require('uuid');

// Incident status enum
const IncidentStatus = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REOPENED: 'reopened'
};

// Priority enum
const IncidentPriority = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Severity enum
const IncidentSeverity = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

/**
 * Incident class representing a security incident
 */
class Incident {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.title = data.title || '';
    this.description = data.description || '';
    this.status = data.status || IncidentStatus.NEW;
    this.priority = data.priority || IncidentPriority.MEDIUM;
    this.severity = data.severity || IncidentSeverity.MEDIUM;
    this.category = data.category || 'general';
    this.assigned_to = data.assigned_to || null;
    this.reported_by = data.reported_by || null;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
    this.resolved_at = data.resolved_at || null;
    this.closed_at = data.closed_at || null;
    this.affected_assets = data.affected_assets || [];
    this.related_threats = data.related_threats || [];
    this.related_incidents = data.related_incidents || [];
    this.timeline = data.timeline || [];
    this.evidence = data.evidence || [];
    this.tags = data.tags || [];
    this.custom_fields = data.custom_fields || {};
    this.sla = data.sla || {
      response_time: 3600000, // 1 hour in ms
      resolution_time: 86400000 // 24 hours in ms
    };
    this.priority_score = data.priority_score || 0;
    this.impact_score = data.impact_score || 0;
    this.urgency_score = data.urgency_score || 0;
  }

  /**
   * Convert to JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      severity: this.severity,
      category: this.category,
      assigned_to: this.assigned_to,
      reported_by: this.reported_by,
      created_at: this.created_at,
      updated_at: this.updated_at,
      resolved_at: this.resolved_at,
      closed_at: this.closed_at,
      affected_assets: this.affected_assets,
      related_threats: this.related_threats,
      related_incidents: this.related_incidents,
      timeline: this.timeline,
      evidence: this.evidence,
      tags: this.tags,
      custom_fields: this.custom_fields,
      sla: this.sla,
      priority_score: this.priority_score,
      impact_score: this.impact_score,
      urgency_score: this.urgency_score
    };
  }

  /**
   * Check if SLA is breached
   */
  isSLABreached() {
    const now = new Date();
    const timeSinceCreation = now - new Date(this.created_at);

    if (this.status === IncidentStatus.NEW) {
      return timeSinceCreation > this.sla.response_time;
    }

    if ([IncidentStatus.IN_PROGRESS, IncidentStatus.REOPENED].includes(this.status)) {
      return timeSinceCreation > this.sla.resolution_time;
    }

    return false;
  }

  /**
   * Calculate time to resolve in milliseconds
   */
  getResolutionTime() {
    if (this.resolved_at) {
      return new Date(this.resolved_at) - new Date(this.created_at);
    }
    return null;
  }
}

module.exports = {
  Incident,
  IncidentStatus,
  IncidentPriority,
  IncidentSeverity
};
