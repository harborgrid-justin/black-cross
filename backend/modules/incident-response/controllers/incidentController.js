/**
 * Incident Controller
 * HTTP request handlers for incident management
 */

const incidentService = require('../services/incidentService');
const prioritizationService = require('../services/prioritizationService');
const workflowService = require('../services/workflowService');
const postMortemService = require('../services/postMortemService');
const notificationService = require('../services/notificationService');

class IncidentController {
  // Create incident
  async createIncident(req, res) {
    try {
      const incident = await incidentService.createIncident(req.body);

      // Auto-prioritize if requested
      if (req.body.auto_prioritize) {
        await prioritizationService.prioritizeIncident(incident.id);
      }

      // Auto-trigger workflows if applicable
      if (req.body.auto_trigger_workflows) {
        await workflowService.autoTriggerWorkflows(incident);
      }

      res.status(201).json(incident);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get incident
  async getIncident(req, res) {
    try {
      const incident = await incidentService.getIncident(req.params.id);
      res.json(incident);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Update incident
  async updateIncident(req, res) {
    try {
      const incident = await incidentService.updateIncident(
        req.params.id,
        req.body,
        req.user?.id || 'system',
      );
      res.json(incident);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // List incidents
  async listIncidents(req, res) {
    try {
      const result = await incidentService.listIncidents(req.query, {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 50,
        sort: req.query.sort,
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Prioritize incident
  async prioritizeIncident(req, res) {
    try {
      const result = await prioritizationService.prioritizeIncident(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get priority queue
  async getPriorityQueue(req, res) {
    try {
      const incidents = await incidentService.getPriorityQueue();
      res.json(incidents);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Execute workflow
  async executeWorkflow(req, res) {
    try {
      const result = await workflowService.executeWorkflow(
        req.params.id,
        req.body.workflow_id,
        req.user?.id || 'system',
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get workflows
  async getWorkflows(req, res) {
    try {
      const workflows = await workflowService.listWorkflows(req.query);
      res.json(workflows);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Create post-mortem
  async createPostMortem(req, res) {
    try {
      const postMortem = await postMortemService.createPostMortem(
        req.params.id,
        req.body,
        req.user?.id || 'system',
      );
      res.json(postMortem);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Generate report
  async generateReport(req, res) {
    try {
      const report = await postMortemService.generateReport(req.params.id);
      res.json(report);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get timeline
  async getTimeline(req, res) {
    try {
      const timeline = await incidentService.getTimeline(req.params.id);
      res.json(timeline);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Add timeline event
  async addTimelineEvent(req, res) {
    try {
      const timeline = await incidentService.addTimelineEvent(req.params.id, req.body);
      res.json(timeline);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Add evidence
  async addEvidence(req, res) {
    try {
      const incident = await incidentService.addEvidence(req.params.id, req.body);
      res.json(incident);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get evidence
  async getEvidence(req, res) {
    try {
      const evidence = await incidentService.getEvidence(
        req.params.id,
        req.params.evidence_id,
      );
      res.json(evidence);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Send notification
  async sendNotification(req, res) {
    try {
      const notification = await notificationService.sendNotification(
        req.params.id,
        req.body,
        req.user?.id || 'system',
      );
      res.json(notification);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get communications
  async getCommunications(req, res) {
    try {
      const communications = await notificationService.getCommunications(req.params.id);
      res.json(communications);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Get statistics
  async getStatistics(req, res) {
    try {
      const stats = await incidentService.getStatistics(req.query.timeRange);
      res.json(stats);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete incident
  async deleteIncident(req, res) {
    try {
      await incidentService.deleteIncident(req.params.id);
      res.json({ success: true, message: 'Incident deleted successfully' });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = new IncidentController();
