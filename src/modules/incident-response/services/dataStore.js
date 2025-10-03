/**
 * Data Store Service
 * In-memory data store with persistence capability
 * In production, this would be replaced with actual database connections
 */

class DataStore {
  constructor() {
    this.incidents = new Map();
    this.evidence = new Map();
    this.timelineEvents = new Map();
    this.workflows = new Map();
    this.notifications = new Map();
    this.postMortems = new Map();
  }

  // Incident operations
  async createIncident(incident) {
    this.incidents.set(incident.id, incident);
    return incident;
  }

  async getIncident(id) {
    return this.incidents.get(id) || null;
  }

  async updateIncident(id, updates) {
    const incident = this.incidents.get(id);
    if (incident) {
      Object.assign(incident, updates, { updated_at: new Date() });
      this.incidents.set(id, incident);
      return incident;
    }
    return null;
  }

  async deleteIncident(id) {
    return this.incidents.delete(id);
  }

  async listIncidents(filters = {}) {
    let incidents = Array.from(this.incidents.values());

    // Apply filters
    if (filters.status) {
      incidents = incidents.filter(i => i.status === filters.status);
    }
    if (filters.priority) {
      incidents = incidents.filter(i => i.priority === filters.priority);
    }
    if (filters.severity) {
      incidents = incidents.filter(i => i.severity === filters.severity);
    }
    if (filters.assigned_to) {
      incidents = incidents.filter(i => i.assigned_to === filters.assigned_to);
    }
    if (filters.category) {
      incidents = incidents.filter(i => i.category === filters.category);
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      incidents: incidents.slice(start, end),
      total: incidents.length,
      page,
      limit,
      totalPages: Math.ceil(incidents.length / limit)
    };
  }

  // Evidence operations
  async createEvidence(evidence) {
    this.evidence.set(evidence.id, evidence);
    return evidence;
  }

  async getEvidence(id) {
    return this.evidence.get(id) || null;
  }

  async listEvidenceByIncident(incidentId) {
    return Array.from(this.evidence.values())
      .filter(e => e.incident_id === incidentId);
  }

  async deleteEvidence(id) {
    return this.evidence.delete(id);
  }

  // Timeline event operations
  async createTimelineEvent(event) {
    this.timelineEvents.set(event.id, event);
    return event;
  }

  async getTimelineEvent(id) {
    return this.timelineEvents.get(id) || null;
  }

  async listTimelineEventsByIncident(incidentId) {
    return Array.from(this.timelineEvents.values())
      .filter(e => e.incident_id === incidentId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // Workflow operations
  async createWorkflow(workflow) {
    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  async getWorkflow(id) {
    return this.workflows.get(id) || null;
  }

  async updateWorkflow(id, updates) {
    const workflow = this.workflows.get(id);
    if (workflow) {
      Object.assign(workflow, updates, { updated_at: new Date() });
      this.workflows.set(id, workflow);
      return workflow;
    }
    return null;
  }

  async listWorkflowsByIncident(incidentId) {
    return Array.from(this.workflows.values())
      .filter(w => w.incident_id === incidentId);
  }

  // Notification operations
  async createNotification(notification) {
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async getNotification(id) {
    return this.notifications.get(id) || null;
  }

  async updateNotification(id, updates) {
    const notification = this.notifications.get(id);
    if (notification) {
      Object.assign(notification, updates);
      this.notifications.set(id, notification);
      return notification;
    }
    return null;
  }

  async listNotificationsByIncident(incidentId) {
    return Array.from(this.notifications.values())
      .filter(n => n.incident_id === incidentId);
  }

  // PostMortem operations
  async createPostMortem(postMortem) {
    this.postMortems.set(postMortem.id, postMortem);
    return postMortem;
  }

  async getPostMortem(id) {
    return this.postMortems.get(id) || null;
  }

  async getPostMortemByIncident(incidentId) {
    return Array.from(this.postMortems.values())
      .find(pm => pm.incident_id === incidentId) || null;
  }

  async updatePostMortem(id, updates) {
    const postMortem = this.postMortems.get(id);
    if (postMortem) {
      Object.assign(postMortem, updates, { updated_at: new Date() });
      this.postMortems.set(id, postMortem);
      return postMortem;
    }
    return null;
  }

  // Analytics and stats
  async getIncidentStats() {
    const incidents = Array.from(this.incidents.values());
    
    return {
      total: incidents.length,
      by_status: this._groupBy(incidents, 'status'),
      by_priority: this._groupBy(incidents, 'priority'),
      by_severity: this._groupBy(incidents, 'severity'),
      by_category: this._groupBy(incidents, 'category'),
      sla_breached: incidents.filter(i => i.isSLABreached()).length,
      avg_resolution_time: this._calculateAvgResolutionTime(incidents)
    };
  }

  _groupBy(array, key) {
    return array.reduce((acc, item) => {
      const value = item[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  _calculateAvgResolutionTime(incidents) {
    const resolved = incidents.filter(i => i.resolved_at);
    if (resolved.length === 0) return 0;

    const total = resolved.reduce((sum, i) => {
      return sum + (new Date(i.resolved_at) - new Date(i.created_at));
    }, 0);

    return Math.round(total / resolved.length);
  }

  // Clear all data (for testing)
  clearAll() {
    this.incidents.clear();
    this.evidence.clear();
    this.timelineEvents.clear();
    this.workflows.clear();
    this.notifications.clear();
    this.postMortems.clear();
  }
}

// Singleton instance
const dataStore = new DataStore();

module.exports = dataStore;
