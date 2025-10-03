/**
 * Incident Service
 * Business logic for incident creation, tracking, and management
 */

const Incident = require('../models/Incident');
const logger = require('../utils/logger');

class IncidentService {
  /**
   * Create a new incident
   */
  async createIncident(incidentData) {
    try {
      const incident = new Incident({
        ...incidentData,
        timeline: [{
          event_type: 'created',
          description: 'Incident created',
          user_id: incidentData.reported_by,
        }],
      });

      // Calculate SLA deadlines
      if (incidentData.priority) {
        const slaConfig = this._getSLAConfig(incidentData.priority);
        incident.sla = {
          response_time: slaConfig.response_time,
          resolution_time: slaConfig.resolution_time,
          response_deadline: new Date(Date.now() + slaConfig.response_time * 60000),
          resolution_deadline: new Date(Date.now() + slaConfig.resolution_time * 60000),
        };
      }

      await incident.save();
      logger.info(`Incident created: ${incident.ticket_number}`);
      return incident;
    } catch (error) {
      logger.error('Error creating incident:', error);
      throw error;
    }
  }

  /**
   * Get incident by ID or ticket number
   */
  async getIncident(identifier) {
    try {
      const query = identifier.startsWith('INC-')
        ? { ticket_number: identifier }
        : { id: identifier };

      const incident = await Incident.findOne(query);
      if (!incident) {
        throw new Error('Incident not found');
      }
      return incident;
    } catch (error) {
      logger.error('Error fetching incident:', error);
      throw error;
    }
  }

  /**
   * Update incident
   */
  async updateIncident(identifier, updates, userId) {
    try {
      const incident = await this.getIncident(identifier);

      // Track changes in timeline
      const changedFields = Object.keys(updates).filter((key) => incident[key] !== updates[key]);

      if (changedFields.length > 0) {
        incident.timeline.push({
          event_type: 'updated',
          description: `Updated: ${changedFields.join(', ')}`,
          user_id: userId,
          metadata: { changes: changedFields },
        });
      }

      // Update fields
      Object.assign(incident, updates);

      // Handle status changes
      if (updates.status === 'resolved' && !incident.resolved_at) {
        incident.resolved_at = new Date();
      }
      if (updates.status === 'closed' && !incident.closed_at) {
        incident.closed_at = new Date();
      }

      await incident.save();
      logger.info(`Incident updated: ${incident.ticket_number}`);
      return incident;
    } catch (error) {
      logger.error('Error updating incident:', error);
      throw error;
    }
  }

  /**
   * Assign incident to user
   */
  async assignIncident(identifier, assigneeId, assignedBy) {
    try {
      const incident = await this.getIncident(identifier);

      incident.assigned_to = assigneeId;
      incident.timeline.push({
        event_type: 'assigned',
        description: `Assigned to ${assigneeId}`,
        user_id: assignedBy,
      });

      await incident.save();
      logger.info(`Incident ${incident.ticket_number} assigned to ${assigneeId}`);
      return incident;
    } catch (error) {
      logger.error('Error assigning incident:', error);
      throw error;
    }
  }

  /**
   * Add evidence to incident
   */
  async addEvidence(identifier, evidenceData) {
    try {
      const incident = await this.getIncident(identifier);

      incident.evidence.push({
        ...evidenceData,
        chain_of_custody: [{
          action: 'collected',
          user_id: evidenceData.collected_by,
          timestamp: new Date(),
        }],
      });

      incident.timeline.push({
        event_type: 'evidence_added',
        description: `Evidence added: ${evidenceData.type}`,
        user_id: evidenceData.collected_by,
      });

      await incident.save();
      logger.info(`Evidence added to incident ${incident.ticket_number}`);
      return incident;
    } catch (error) {
      logger.error('Error adding evidence:', error);
      throw error;
    }
  }

  /**
   * Get evidence by ID
   */
  async getEvidence(incidentId, evidenceId) {
    try {
      const incident = await this.getIncident(incidentId);
      const evidence = incident.evidence.find((e) => e.id === evidenceId);

      if (!evidence) {
        throw new Error('Evidence not found');
      }

      return evidence;
    } catch (error) {
      logger.error('Error fetching evidence:', error);
      throw error;
    }
  }

  /**
   * Get incident timeline
   */
  async getTimeline(identifier) {
    try {
      const incident = await this.getIncident(identifier);
      return incident.timeline.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      logger.error('Error fetching timeline:', error);
      throw error;
    }
  }

  /**
   * Add timeline event
   */
  async addTimelineEvent(identifier, eventData) {
    try {
      const incident = await this.getIncident(identifier);

      incident.timeline.push({
        ...eventData,
        timestamp: new Date(),
      });

      await incident.save();
      return incident.timeline;
    } catch (error) {
      logger.error('Error adding timeline event:', error);
      throw error;
    }
  }

  /**
   * List incidents with filters
   */
  async listIncidents(filters = {}, options = {}) {
    try {
      const {
        status,
        priority,
        severity,
        category,
        assigned_to,
        reported_by,
        from_date,
        to_date,
      } = filters;

      const {
        page = 1,
        limit = 50,
        sort = '-created_at',
      } = options;

      const query = {};
      if (status) query.status = Array.isArray(status) ? { $in: status } : status;
      if (priority) query.priority = Array.isArray(priority) ? { $in: priority } : priority;
      if (severity) query.severity = Array.isArray(severity) ? { $in: severity } : severity;
      if (category) query.category = Array.isArray(category) ? { $in: category } : category;
      if (assigned_to) query.assigned_to = assigned_to;
      if (reported_by) query.reported_by = reported_by;

      if (from_date || to_date) {
        query.created_at = {};
        if (from_date) query.created_at.$gte = new Date(from_date);
        if (to_date) query.created_at.$lte = new Date(to_date);
      }

      const skip = (page - 1) * limit;
      const incidents = await Incident.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await Incident.countDocuments(query);

      return {
        incidents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error listing incidents:', error);
      throw error;
    }
  }

  /**
   * Get priority queue (incidents needing attention)
   */
  async getPriorityQueue() {
    try {
      const incidents = await Incident.find({
        status: { $nin: ['resolved', 'closed'] },
      })
        .sort({ priority_score: -1, created_at: 1 })
        .limit(50);

      return incidents;
    } catch (error) {
      logger.error('Error fetching priority queue:', error);
      throw error;
    }
  }

  /**
   * Check SLA breaches
   */
  async checkSLABreaches() {
    try {
      const now = new Date();
      const breachedIncidents = await Incident.find({
        status: { $nin: ['resolved', 'closed'] },
        $or: [
          { 'sla.response_deadline': { $lte: now } },
          { 'sla.resolution_deadline': { $lte: now } },
        ],
        'sla.breached': false,
      });

      for (const incident of breachedIncidents) {
        incident.sla.breached = true;
        incident.timeline.push({
          event_type: 'escalated',
          description: 'SLA breached',
          metadata: { breach_type: 'sla_deadline' },
        });
        await incident.save();
      }

      return breachedIncidents;
    } catch (error) {
      logger.error('Error checking SLA breaches:', error);
      throw error;
    }
  }

  /**
   * Get SLA configuration based on priority
   */
  _getSLAConfig(priority) {
    const slaConfigs = {
      critical: { response_time: 15, resolution_time: 240 }, // 15 min, 4 hours
      high: { response_time: 60, resolution_time: 480 }, // 1 hour, 8 hours
      medium: { response_time: 240, resolution_time: 1440 }, // 4 hours, 24 hours
      low: { response_time: 480, resolution_time: 2880 }, // 8 hours, 48 hours
    };
    return slaConfigs[priority] || slaConfigs.medium;
  }

  /**
   * Get incident statistics
   */
  async getStatistics(timeRange = '30d') {
    try {
      const days = parseInt(timeRange);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const stats = await Incident.aggregate([
        { $match: { created_at: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            by_status: {
              $push: '$status',
            },
            by_priority: {
              $push: '$priority',
            },
            by_severity: {
              $push: '$severity',
            },
            avg_resolution_time: {
              $avg: {
                $cond: [
                  { $ne: ['$resolved_at', null] },
                  { $subtract: ['$resolved_at', '$created_at'] },
                  null,
                ],
              },
            },
          },
        },
      ]);

      return stats[0] || {
        total: 0,
        by_status: [],
        by_priority: [],
        by_severity: [],
        avg_resolution_time: 0,
      };
    } catch (error) {
      logger.error('Error fetching statistics:', error);
      throw error;
    }
  }
}

module.exports = new IncidentService();
