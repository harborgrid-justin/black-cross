/**
 * Taxonomy Controller
 * Handles HTTP requests for taxonomy operations
 */

const taxonomyService = require('../services/taxonomyService');
const logger = require('../utils/logger');

class TaxonomyController {
  /**
   * Create taxonomy
   * POST /api/v1/threat-intelligence/taxonomies
   */
  async createTaxonomy(req, res) {
    try {
      const taxonomy = await taxonomyService.createTaxonomy(req.body);
      res.status(201).json({
        success: true,
        data: taxonomy,
      });
    } catch (error) {
      logger.error('Error in createTaxonomy controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update taxonomy
   * PUT /api/v1/threat-intelligence/taxonomies/:id
   */
  async updateTaxonomy(req, res) {
    try {
      const taxonomy = await taxonomyService.updateTaxonomy(req.params.id, req.body);
      res.json({
        success: true,
        data: taxonomy,
      });
    } catch (error) {
      logger.error('Error in updateTaxonomy controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get taxonomy
   * GET /api/v1/threat-intelligence/taxonomies/:id
   */
  async getTaxonomy(req, res) {
    try {
      const taxonomy = await taxonomyService.getTaxonomy(req.params.id);
      res.json({
        success: true,
        data: taxonomy,
      });
    } catch (error) {
      logger.error('Error in getTaxonomy controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * List taxonomies
   * GET /api/v1/threat-intelligence/taxonomies
   */
  async listTaxonomies(req, res) {
    try {
      const filters = {
        is_active: req.query.is_active === 'true',
        type: req.query.type,
        is_default: req.query.is_default === 'true',
        limit: parseInt(req.query.limit) || 100,
      };

      const taxonomies = await taxonomyService.listTaxonomies(filters);
      res.json({
        success: true,
        data: taxonomies,
        count: taxonomies.length,
      });
    } catch (error) {
      logger.error('Error in listTaxonomies controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Delete taxonomy
   * DELETE /api/v1/threat-intelligence/taxonomies/:id
   */
  async deleteTaxonomy(req, res) {
    try {
      await taxonomyService.deleteTaxonomy(req.params.id);
      res.json({
        success: true,
        message: 'Taxonomy deleted successfully',
      });
    } catch (error) {
      logger.error('Error in deleteTaxonomy controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Export taxonomy
   * GET /api/v1/threat-intelligence/taxonomies/:id/export
   */
  async exportTaxonomy(req, res) {
    try {
      const format = req.query.format || 'json';
      const data = await taxonomyService.exportTaxonomy(req.params.id, format);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=taxonomy-${req.params.id}.json`);
      res.json(data);
    } catch (error) {
      logger.error('Error in exportTaxonomy controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Import taxonomy
   * POST /api/v1/threat-intelligence/taxonomies/import
   */
  async importTaxonomy(req, res) {
    try {
      const taxonomy = await taxonomyService.importTaxonomy(req.body);
      res.status(201).json({
        success: true,
        data: taxonomy,
      });
    } catch (error) {
      logger.error('Error in importTaxonomy controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new TaxonomyController();
