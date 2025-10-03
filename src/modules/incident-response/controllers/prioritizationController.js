/**
 * Prioritization Controller
 * Handle HTTP requests for incident prioritization
 */

const { prioritizationService } = require('../services');

class PrioritizationController {
  /**
   * Prioritize incident
   * POST /api/v1/incidents/:id/prioritize
   */
  async prioritizeIncident(req, res) {
    try {
      const incident = await prioritizationService.prioritizeIncident(
        req.params.id,
        req.body.factors || {}
      );

      res.json({
        success: true,
        data: incident.toJSON(),
        scores: {
          priority_score: incident.priority_score,
          impact_score: incident.impact_score,
          urgency_score: incident.urgency_score
        }
      });
    } catch (err) {
      if (err.message === 'Incident not found') {
        return res.status(404).json({ error: 'Not Found', message: err.message });
      }
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Reprioritize all incidents
   * POST /api/v1/incidents/reprioritize
   */
  async reprioritizeAll(req, res) {
    try {
      const incidents = await prioritizationService.reprioritizeAll();

      res.json({
        success: true,
        data: incidents.map(i => i.toJSON()),
        count: incidents.length
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Get custom prioritization rules
   * GET /api/v1/incidents/prioritization-rules
   */
  async getCustomRules(req, res) {
    try {
      const rules = await prioritizationService.getCustomRules();

      res.json({
        success: true,
        data: rules
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }
}

module.exports = new PrioritizationController();
