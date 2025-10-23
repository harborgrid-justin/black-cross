/**
 * Post-Mortem Service
 * Post-incident analysis and reporting
 */

import Incident from '../models/Incident';
import logger from '../utils/logger';

class PostMortemService {
  /**
   * Create post-mortem report
   */
  async createPostMortem(incidentId, postMortemData, userId) {
    try {
      const incident = await Incident.findOne({ $or: [{ id: incidentId }, { ticket_number: incidentId }] });
      if (!incident) {
        throw new Error('Incident not found');
      }

      if (incident.status !== 'resolved' && incident.status !== 'closed') {
        throw new Error('Post-mortem can only be created for resolved or closed incidents');
      }

      incident.post_mortem = {
        created: true,
        root_cause: postMortemData.root_cause,
        lessons_learned: postMortemData.lessons_learned || [],
        recommendations: postMortemData.recommendations || [],
        created_by: userId,
        created_at: new Date(),
      };

      incident.timeline.push({
        event_type: 'updated',
        description: 'Post-mortem report created',
        user_id: userId,
      });

      await incident.save();
      logger.info(`Post-mortem created for incident ${incident.ticket_number}`);
      return incident.post_mortem;
    } catch (error) {
      logger.error('Error creating post-mortem:', error);
      throw error;
    }
  }

  /**
   * Generate detailed incident report
   */
  async generateReport(incidentId) {
    try {
      const incident = await Incident.findOne({ $or: [{ id: incidentId }, { ticket_number: incidentId }] });
      if (!incident) {
        throw new Error('Incident not found');
      }

      const report = {
        incident_summary: {
          ticket_number: incident.ticket_number,
          title: incident.title,
          description: incident.description,
          status: incident.status,
          priority: incident.priority,
          severity: incident.severity,
          category: incident.category,
        },
        timeline: {
          created: (incident as any).created_at,
          resolved: incident.resolved_at,
          closed: incident.closed_at,
          duration: incident.resolved_at && (incident as any).created_at
            ? ((incident.resolved_at as any) - (incident as any).created_at) / (1000 * 60 * 60)
            : null,
        },
        metrics: {
          evidence_count: incident.evidence.length,
          timeline_events: incident.timeline.length,
          response_actions: incident.response_actions.length,
          affected_assets: incident.affected_assets.length,
          related_threats: incident.related_threats.length,
        },
        sla_performance: {
          response_deadline: incident.sla?.response_deadline,
          resolution_deadline: incident.sla?.resolution_deadline,
          breached: incident.sla?.breached || false,
        },
        personnel: {
          reported_by: incident.reported_by,
          assigned_to: incident.assigned_to,
        },
        post_mortem: incident.post_mortem || null,
        generated_at: new Date(),
      };

      return report;
    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Get lessons learned across multiple incidents
   */
  async aggregateLessonsLearned(filters: Record<string, any> = {}) {
    try {
      const query: Record<string, any> = {
        'post_mortem.created': true,
      };

      if (filters.category) query.category = filters.category;
      if (filters.from_date) {
        query.created_at = { $gte: new Date(filters.from_date) };
      }

      const incidents = await Incident.find(query).select('post_mortem category severity');

      const allLessons = [];
      const allRecommendations = [];

      incidents.forEach((incident) => {
        if (incident.post_mortem.lessons_learned) {
          allLessons.push(...incident.post_mortem.lessons_learned);
        }
        if (incident.post_mortem.recommendations) {
          allRecommendations.push(...incident.post_mortem.recommendations);
        }
      });

      return {
        total_incidents: incidents.length,
        lessons_learned: allLessons,
        recommendations: allRecommendations,
        by_category: this._groupByCategory(incidents),
      };
    } catch (error) {
      logger.error('Error aggregating lessons learned:', error);
      throw error;
    }
  }

  /**
   * Group incidents by category
   */
  _groupByCategory(incidents) {
    const grouped = {};
    incidents.forEach((incident) => {
      if (!grouped[incident.category]) {
        grouped[incident.category] = [];
      }
      grouped[incident.category].push({
        lessons: incident.post_mortem.lessons_learned,
        recommendations: incident.post_mortem.recommendations,
      });
    });
    return grouped;
  }
}

export default new PostMortemService();
