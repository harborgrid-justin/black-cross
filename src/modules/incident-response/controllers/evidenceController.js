/**
 * Evidence Controller
 * Handle HTTP requests for evidence operations
 */

const { evidenceService } = require('../services');
const {
  collectEvidenceSchema,
  transferCustodySchema,
  tagEvidenceSchema,
  deleteEvidenceSchema,
  searchEvidenceSchema
} = require('../validators/evidenceValidator');

class EvidenceController {
  /**
   * Collect evidence
   * POST /api/v1/incidents/:id/evidence
   */
  async collectEvidence(req, res) {
    try {
      const { error, value } = collectEvidenceSchema.validate({
        incident_id: req.params.id,
        ...req.body
      });
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const userId = req.user?.id || 'system';
      const evidence = await evidenceService.collectEvidence(value, userId);

      res.status(201).json({
        success: true,
        data: evidence.toJSON()
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Get evidence
   * GET /api/v1/incidents/:incidentId/evidence/:evidenceId
   */
  async getEvidence(req, res) {
    try {
      const evidence = await evidenceService.getEvidence(req.params.evidenceId);
      
      if (!evidence) {
        return res.status(404).json({ error: 'Not Found', message: 'Evidence not found' });
      }

      res.json({
        success: true,
        data: evidence.toJSON()
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * List evidence for incident
   * GET /api/v1/incidents/:id/evidence
   */
  async listEvidence(req, res) {
    try {
      const evidence = await evidenceService.listEvidenceByIncident(req.params.id);

      res.json({
        success: true,
        data: evidence.map(e => e.toJSON()),
        count: evidence.length
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Transfer custody
   * POST /api/v1/evidence/:id/transfer
   */
  async transferCustody(req, res) {
    try {
      const { error, value } = transferCustodySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const fromUserId = req.user?.id || 'system';
      const evidence = await evidenceService.transferCustody(
        req.params.id,
        fromUserId,
        value.to_user_id,
        value.notes || ''
      );

      res.json({
        success: true,
        data: evidence.toJSON()
      });
    } catch (err) {
      if (err.message === 'Evidence not found') {
        return res.status(404).json({ error: 'Not Found', message: err.message });
      }
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Tag evidence
   * POST /api/v1/evidence/:id/tags
   */
  async tagEvidence(req, res) {
    try {
      const { error, value } = tagEvidenceSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const userId = req.user?.id || 'system';
      const evidence = await evidenceService.tagEvidence(
        req.params.id,
        value.tags,
        userId
      );

      res.json({
        success: true,
        data: evidence.toJSON()
      });
    } catch (err) {
      if (err.message === 'Evidence not found') {
        return res.status(404).json({ error: 'Not Found', message: err.message });
      }
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Delete evidence
   * DELETE /api/v1/evidence/:id
   */
  async deleteEvidence(req, res) {
    try {
      const { error, value } = deleteEvidenceSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const userId = req.user?.id || 'system';
      const result = await evidenceService.deleteEvidence(
        req.params.id,
        userId,
        value.reason
      );

      res.json({
        success: true,
        message: result.message
      });
    } catch (err) {
      if (err.message === 'Evidence not found') {
        return res.status(404).json({ error: 'Not Found', message: err.message });
      }
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Get chain of custody
   * GET /api/v1/evidence/:id/chain-of-custody
   */
  async getChainOfCustody(req, res) {
    try {
      const chain = await evidenceService.getChainOfCustody(req.params.id);

      res.json({
        success: true,
        data: chain
      });
    } catch (err) {
      if (err.message === 'Evidence not found') {
        return res.status(404).json({ error: 'Not Found', message: err.message });
      }
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Search evidence
   * GET /api/v1/evidence/search
   */
  async searchEvidence(req, res) {
    try {
      const { error, value } = searchEvidenceSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          error: 'Validation Error',
          details: error.details.map(d => d.message)
        });
      }

      const results = await evidenceService.searchEvidence(value.query, value);

      res.json({
        success: true,
        data: results.map(e => e.toJSON()),
        count: results.length
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }

  /**
   * Get evidence statistics
   * GET /api/v1/incidents/:id/evidence/stats
   */
  async getEvidenceStats(req, res) {
    try {
      const stats = await evidenceService.getEvidenceStats(req.params.id);

      res.json({
        success: true,
        data: stats
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }
}

module.exports = new EvidenceController();
