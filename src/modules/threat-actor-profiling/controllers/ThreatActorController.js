/**
 * Threat Actor Controller
 * 
 * HTTP request handlers for threat actor profiling endpoints
 */

const services = require('../services');
const validators = require('../validators');

class ThreatActorController {
  /**
   * Create threat actor
   * POST /api/v1/threat-actors
   */
  async createActor(req, res) {
    try {
      const { error, value } = validators.threatActorSchemas.create.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          success: false,
          error: error.details[0].message 
        });
      }

      const actor = await services.threatActorService.createActor(value);
      
      res.status(201).json({
        success: true,
        data: actor,
        message: 'Threat actor created successfully'
      });
    } catch (err) {
      res.status(500).json({ 
        success: false,
        error: err.message 
      });
    }
  }

  /**
   * Get threat actor by ID
   * GET /api/v1/threat-actors/:id
   */
  async getActorById(req, res) {
    try {
      const actor = await services.threatActorService.getActorById(req.params.id);
      
      res.json({
        success: true,
        data: actor
      });
    } catch (err) {
      const statusCode = err.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({ 
        success: false,
        error: err.message 
      });
    }
  }

  /**
   * Update threat actor
   * PATCH /api/v1/threat-actors/:id
   */
  async updateActor(req, res) {
    try {
      const { error, value } = validators.threatActorSchemas.update.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          success: false,
          error: error.details[0].message 
        });
      }

      const actor = await services.threatActorService.updateActor(req.params.id, value);
      
      res.json({
        success: true,
        data: actor,
        message: 'Threat actor updated successfully'
      });
    } catch (err) {
      const statusCode = err.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({ 
        success: false,
        error: err.message 
      });
    }
  }

  /**
   * List threat actors
   * GET /api/v1/threat-actors
   */
  async listActors(req, res) {
    try {
      const { error, value } = validators.querySchemas.list.validate(req.query);
      if (error) {
        return res.status(400).json({ 
          success: false,
          error: error.details[0].message 
        });
      }

      const result = await services.threatActorService.listActors(value);
      
      res.json({
        success: true,
        data: result.actors,
        pagination: {
          total: result.total,
          limit: result.limit,
          skip: result.skip,
          has_more: result.skip + result.actors.length < result.total
        }
      });
    } catch (err) {
      res.status(500).json({ 
        success: false,
        error: err.message 
      });
    }
  }

  /**
   * Delete threat actor
   * DELETE /api/v1/threat-actors/:id
   */
  async deleteActor(req, res) {
    try {
      await services.threatActorService.deleteActor(req.params.id);
      
      res.json({
        success: true,
        message: 'Threat actor deleted successfully'
      });
    } catch (err) {
      const statusCode = err.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({ 
        success: false,
        error: err.message 
      });
    }
  }

  /**
   * Add alias to threat actor
   * POST /api/v1/threat-actors/:id/aliases
   */
  async addAlias(req, res) {
    try {
      const { error, value } = validators.threatActorSchemas.addAlias.validate(req.body);
      if (error) {
        return res.status(400).json({ 
          success: false,
          error: error.details[0].message 
        });
      }

      const actor = await services.threatActorService.addAlias(req.params.id, value.alias);
      
      res.json({
        success: true,
        data: actor,
        message: 'Alias added successfully'
      });
    } catch (err) {
      const statusCode = err.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({ 
        success: false,
        error: err.message 
      });
    }
  }

  /**
   * Get threat actor statistics
   * GET /api/v1/threat-actors/statistics
   */
  async getStatistics(req, res) {
    try {
      const stats = await services.threatActorService.getStatistics();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (err) {
      res.status(500).json({ 
        success: false,
        error: err.message 
      });
    }
  }

  /**
   * Calculate threat score
   * POST /api/v1/threat-actors/:id/calculate-score
   */
  async calculateThreatScore(req, res) {
    try {
      const score = await services.threatActorService.calculateThreatScore(req.params.id);
      
      res.json({
        success: true,
        data: { threat_score: score },
        message: 'Threat score calculated successfully'
      });
    } catch (err) {
      const statusCode = err.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({ 
        success: false,
        error: err.message 
      });
    }
  }
}

module.exports = new ThreatActorController();
