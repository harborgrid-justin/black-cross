/**
 * Incident Controller
 * Handle HTTP requests for incident operations
 */

const { incidentService } = require('../services');
const {
  createIncidentSchema,
  updateIncidentSchema,
  listIncidentsSchema,
  reopenIncidentSchema,
  linkIncidentsSchema
} = require('../validators/incidentValidator');

class IncidentController {
  /**
   * Create new incident
   * POST /api/v1/incidents
   */
  async createIncident(req, res) {
    try {
      const { error, value } = createIncidentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const incident = await incidentService.createIncident(value);
      
      res.status(201).json({
        success: true,
        data: incident.toJSON()
      });
    } catch (err) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
      });
    }
  }

  /**
   * Get incident by ID
   * GET /api/v1/incidents/:id
   */
  async getIncident(req, res) {
    try {
      const incident = await incidentService.getIncident(req.params.id);
      
      if (!incident) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Incident not found'
        });
      }

      res.json({
        success: true,
        data: incident.toJSON()
      });
    } catch (err) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
      });
    }
  }

  /**
   * Update incident
   * PATCH /api/v1/incidents/:id
   */
  async updateIncident(req, res) {
    try {
      const { error, value } = updateIncidentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const userId = req.user?.id || null;
      const incident = await incidentService.updateIncident(req.params.id, value, userId);

      res.json({
        success: true,
        data: incident.toJSON()
      });
    } catch (err) {
      if (err.message === 'Incident not found') {
        return res.status(404).json({
          error: 'Not Found',
          message: err.message
        });
      }
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
      });
    }
  }

  /**
   * Delete incident
   * DELETE /api/v1/incidents/:id
   */
  async deleteIncident(req, res) {
    try {
      const success = await incidentService.deleteIncident(req.params.id);
      
      if (!success) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Incident not found'
        });
      }

      res.json({
        success: true,
        message: 'Incident deleted successfully'
      });
    } catch (err) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
      });
    }
  }

  /**
   * List incidents
   * GET /api/v1/incidents
   */
  async listIncidents(req, res) {
    try {
      const { error, value } = listIncidentsSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const result = await incidentService.listIncidents(value);

      res.json({
        success: true,
        data: result.incidents.map(i => i.toJSON()),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (err) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
      });
    }
  }

  /**
   * Get priority queue
   * GET /api/v1/incidents/priority-queue
   */
  async getPriorityQueue(req, res) {
    try {
      const { error, value } = listIncidentsSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const result = await incidentService.getPriorityQueue(value);

      res.json({
        success: true,
        data: result.incidents.map(i => i.toJSON()),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (err) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
      });
    }
  }

  /**
   * Close incident
   * POST /api/v1/incidents/:id/close
   */
  async closeIncident(req, res) {
    try {
      const userId = req.user?.id || null;
      const incident = await incidentService.closeIncident(req.params.id, userId);

      res.json({
        success: true,
        data: incident.toJSON()
      });
    } catch (err) {
      if (err.message.includes('not found') || err.message.includes('must be resolved')) {
        return res.status(400).json({
          error: 'Bad Request',
          message: err.message
        });
      }
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
      });
    }
  }

  /**
   * Reopen incident
   * POST /api/v1/incidents/:id/reopen
   */
  async reopenIncident(req, res) {
    try {
      const { error, value } = reopenIncidentSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const userId = req.user?.id || null;
      const incident = await incidentService.reopenIncident(
        req.params.id,
        value.reason,
        userId
      );

      res.json({
        success: true,
        data: incident.toJSON()
      });
    } catch (err) {
      if (err.message === 'Incident not found') {
        return res.status(404).json({
          error: 'Not Found',
          message: err.message
        });
      }
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
      });
    }
  }

  /**
   * Link incidents
   * POST /api/v1/incidents/:id/link
   */
  async linkIncidents(req, res) {
    try {
      const { error, value } = linkIncidentsSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const userId = req.user?.id || null;
      const incident = await incidentService.linkIncidents(
        req.params.id,
        value.related_incident_id,
        userId
      );

      res.json({
        success: true,
        data: incident.toJSON()
      });
    } catch (err) {
      if (err.message === 'Incident not found') {
        return res.status(404).json({
          error: 'Not Found',
          message: err.message
        });
      }
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
      });
    }
  }

  /**
   * Get incident statistics
   * GET /api/v1/incidents/stats
   */
  async getStatistics(req, res) {
    try {
      const stats = await incidentService.getStatistics();

      res.json({
        success: true,
        data: stats
      });
    } catch (err) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
      });
    }
  }
}

module.exports = new IncidentController();
