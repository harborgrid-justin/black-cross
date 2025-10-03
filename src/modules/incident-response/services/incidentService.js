/**
 * Incident Service
 * Business logic for incident creation and tracking
 */

const { Incident, IncidentStatus } = require('../models');
const dataStore = require('./dataStore');
const timelineService = require('./timelineService');
const { EventType } = require('../models');

class IncidentService {
  /**
   * Create new incident
   */
  async createIncident(data) {
    const incident = new Incident(data);
    await dataStore.createIncident(incident);

    // Create timeline event
    await timelineService.createEvent({
      incident_id: incident.id,
      type: EventType.INCIDENT_CREATED,
      title: 'Incident Created',
      description: `Incident ${incident.id} created: ${incident.title}`,
      user_id: data.reported_by,
      metadata: {
        status: incident.status,
        priority: incident.priority,
        severity: incident.severity
      }
    });

    return incident;
  }

  /**
   * Get incident by ID
   */
  async getIncident(id) {
    return await dataStore.getIncident(id);
  }

  /**
   * Update incident
   */
  async updateIncident(id, updates, userId = null) {
    const incident = await dataStore.getIncident(id);
    if (!incident) {
      throw new Error('Incident not found');
    }

    const oldStatus = incident.status;
    const updatedIncident = await dataStore.updateIncident(id, updates);

    // Track status changes
    if (updates.status && updates.status !== oldStatus) {
      await timelineService.createEvent({
        incident_id: id,
        type: EventType.STATUS_CHANGED,
        title: 'Status Changed',
        description: `Status changed from ${oldStatus} to ${updates.status}`,
        user_id: userId,
        metadata: {
          old_status: oldStatus,
          new_status: updates.status
        }
      });

      // Track resolved time
      if (updates.status === IncidentStatus.RESOLVED) {
        await dataStore.updateIncident(id, { resolved_at: new Date() });
      }
    }

    // Track assignment changes
    if (updates.assigned_to && updates.assigned_to !== incident.assigned_to) {
      await timelineService.createEvent({
        incident_id: id,
        type: EventType.ASSIGNED,
        title: 'Incident Assigned',
        description: `Incident assigned to ${updates.assigned_to}`,
        user_id: userId,
        metadata: {
          old_assignee: incident.assigned_to,
          new_assignee: updates.assigned_to
        }
      });
    }

    return updatedIncident;
  }

  /**
   * Delete incident
   */
  async deleteIncident(id) {
    return await dataStore.deleteIncident(id);
  }

  /**
   * List incidents with filters
   */
  async listIncidents(filters = {}) {
    return await dataStore.listIncidents(filters);
  }

  /**
   * Get priority queue (incidents ordered by priority score)
   */
  async getPriorityQueue(filters = {}) {
    const result = await dataStore.listIncidents(filters);
    result.incidents.sort((a, b) => b.priority_score - a.priority_score);
    return result;
  }

  /**
   * Link related incidents
   */
  async linkIncidents(incidentId, relatedIncidentId, userId = null) {
    const incident = await dataStore.getIncident(incidentId);
    if (!incident) {
      throw new Error('Incident not found');
    }

    if (!incident.related_incidents.includes(relatedIncidentId)) {
      incident.related_incidents.push(relatedIncidentId);
      await dataStore.updateIncident(incidentId, incident);

      await timelineService.createEvent({
        incident_id: incidentId,
        type: EventType.RELATED_INCIDENT,
        title: 'Related Incident Linked',
        description: `Linked to incident ${relatedIncidentId}`,
        user_id: userId,
        metadata: {
          related_incident_id: relatedIncidentId
        }
      });
    }

    return incident;
  }

  /**
   * Get incident statistics
   */
  async getStatistics() {
    return await dataStore.getIncidentStats();
  }

  /**
   * Close incident
   */
  async closeIncident(id, userId = null) {
    const incident = await dataStore.getIncident(id);
    if (!incident) {
      throw new Error('Incident not found');
    }

    if (incident.status !== IncidentStatus.RESOLVED) {
      throw new Error('Incident must be resolved before closing');
    }

    return await this.updateIncident(id, {
      status: IncidentStatus.CLOSED,
      closed_at: new Date()
    }, userId);
  }

  /**
   * Reopen incident
   */
  async reopenIncident(id, reason, userId = null) {
    const incident = await dataStore.getIncident(id);
    if (!incident) {
      throw new Error('Incident not found');
    }

    await timelineService.createEvent({
      incident_id: id,
      type: EventType.STATUS_CHANGED,
      title: 'Incident Reopened',
      description: reason || 'Incident reopened',
      user_id: userId,
      metadata: {
        previous_status: incident.status,
        reason
      }
    });

    return await this.updateIncident(id, {
      status: IncidentStatus.REOPENED,
      resolved_at: null,
      closed_at: null
    }, userId);
  }
}

module.exports = new IncidentService();
