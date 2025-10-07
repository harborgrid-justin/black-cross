/**
 * Threat Intelligence Controller
 * Handles HTTP requests for threat operations
 */

import collectionService from '../services/collectionService';
import categorizationService from '../services/categorizationService';
import archivalService from '../services/archivalService';
import enrichmentService from '../services/enrichmentService';
import correlationService from '../services/correlationService';
import contextService from '../services/contextService';
import Threat from '../models/Threat';
import logger from '../utils/logger';
import type { Request, Response } from 'express';

class ThreatController {
  /**
   * List all threats with filters
   * GET /api/v1/threat-intelligence/threats
   */
  async listThreats(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1, limit = 20, severity, type, categories, tags,
      } = req.query;

      const query: any = {};
      if (severity) query.severity = severity;
      if (type) query.type = type;
      if (categories && typeof categories === 'string') query.categories = { $in: categories.split(',') };
      if (tags && typeof tags === 'string') query.tags = { $in: tags.split(',') };

      const threats = await Threat.find(query)
        .sort({ created_at: -1 })
        .limit(parseInt(limit as string, 10))
        .skip((parseInt(page as string, 10) - 1) * parseInt(limit as string, 10));

      const total = await Threat.countDocuments(query);

      res.json({
        success: true,
        data: threats,
        pagination: {
          page: parseInt(page as string, 10),
          limit: parseInt(limit as string, 10),
          total,
          pages: Math.ceil(total / parseInt(limit as string, 10)),
        },
      });
    } catch (error: any) {
      logger.error('Error in listThreats controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get single threat by ID
   * GET /api/v1/threat-intelligence/threats/:id
   */
  async getThreat(req: Request, res: Response): Promise<void> {
    try {
      const threat = await Threat.findOne({ id: req.params.id });
      if (!threat) {
        res.status(404).json({
          success: false,
          error: 'Threat not found',
        });
        return;
      }
      res.json({
        success: true,
        data: threat,
      });
    } catch (error: any) {
      logger.error('Error in getThreat controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update threat
   * PUT /api/v1/threat-intelligence/threats/:id
   */
  async updateThreat(req: Request, res: Response): Promise<void> {
    try {
      const threat = await Threat.findOneAndUpdate(
        { id: req.params.id },
        { $set: req.body },
        { new: true, runValidators: true },
      );
      if (!threat) {
        res.status(404).json({
          success: false,
          error: 'Threat not found',
        });
        return;
      }
      res.json({
        success: true,
        data: threat,
      });
    } catch (error: any) {
      logger.error('Error in updateThreat controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Delete threat
   * DELETE /api/v1/threat-intelligence/threats/:id
   */
  async deleteThreat(req: Request, res: Response): Promise<void> {
    try {
      const threat = await Threat.findOneAndDelete({ id: req.params['id'] });
      if (!threat) {
        res.status(404).json({
          success: false,
          error: 'Threat not found',
        });
        return;
      }
      res.json({
        success: true,
        message: 'Threat deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error in deleteThreat controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Collect threat intelligence
   * POST /api/v1/threat-intelligence/threats/collect
   */
  async collectThreat(req: Request, res: Response): Promise<void> {
    try {
      const threat = await collectionService.collectThreat(req.body);
      res.status(201).json({
        success: true,
        data: threat,
      });
    } catch (error: any) {
      logger.error('Error in collectThreat controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Stream real-time threats
   * GET /api/v1/threat-intelligence/threats/stream
   */
  async streamThreats(req: Request, res: Response): Promise<void> {
    try {
      const filters: any = {
        severity: req.query['severity'],
        type: req.query['type'],
        since: req.query['since'],
        limit: parseInt(req.query['limit'] as string, 10) || 100,
      };

      const threats = await collectionService.streamThreats(filters);
      res.json({
        success: true,
        data: threats,
        count: threats.length,
      });
    } catch (error: any) {
      logger.error('Error in streamThreats controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Categorize threats
   * POST /api/v1/threat-intelligence/threats/categorize
   */
  async categorizeThreat(req: Request, res: Response): Promise<void> {
    try {
      const { threat_id: threatId, categories, auto_categorize: autoCategorize } = req.body;

      let threat;
      if (autoCategorize) {
        threat = await categorizationService.autoCategorizeThreat(threatId);
      } else {
        threat = await categorizationService.categorizeThreat(threatId, categories);
      }

      res.json({
        success: true,
        data: threat,
      });
    } catch (error: any) {
      logger.error('Error in categorizeThreat controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * List categories
   * GET /api/v1/threat-intelligence/threats/categories
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await categorizationService.getCategories();
      res.json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      logger.error('Error in getCategories controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Archive threats
   * POST /api/v1/threat-intelligence/threats/archive
   */
  async archiveThreats(req: Request, res: Response): Promise<void> {
    try {
      const result = await archivalService.archiveThreats(req.body);
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Error in archiveThreats controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get historical threats
   * GET /api/v1/threat-intelligence/threats/history
   */
  async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const filters: any = {
        from_date: req.query['from_date'],
        to_date: req.query['to_date'],
        type: req.query['type'],
        severity: req.query['severity'],
        limit: parseInt(req.query['limit'] as string, 10) || 1000,
      };

      const threats = await archivalService.getHistoricalThreats(filters);
      res.json({
        success: true,
        data: threats,
        count: threats.length,
      });
    } catch (error: any) {
      logger.error('Error in getHistory controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Enrich threat data
   * POST /api/v1/threat-intelligence/threats/enrich
   */
  async enrichThreat(req: Request, res: Response): Promise<void> {
    try {
      const { threat_id, sources } = req.body;
      const threat = await enrichmentService.enrichThreat(threat_id, sources);
      res.json({
        success: true,
        data: threat,
      });
    } catch (error: any) {
      logger.error('Error in enrichThreat controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get enriched threat
   * GET /api/v1/threat-intelligence/threats/:id/enriched
   */
  async getEnrichedThreat(req: Request, res: Response): Promise<void> {
    try {
      const threat = await enrichmentService.getEnrichedThreat(req.params['id']);
      res.json({
        success: true,
        data: threat,
      });
    } catch (error: any) {
      logger.error('Error in getEnrichedThreat controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Correlate threats
   * POST /api/v1/threat-intelligence/threats/correlate
   */
  async correlateThreats(req: Request, res: Response): Promise<void> {
    try {
      const { threat_id, min_similarity, correlation_types } = req.body;
      const options = {
        min_similarity,
        correlation_types,
      };

      const correlations = await correlationService.correlateThreats(threat_id, options);
      res.json({
        success: true,
        data: correlations,
        count: correlations.length,
      });
    } catch (error: any) {
      logger.error('Error in correlateThreats controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get related threats
   * GET /api/v1/threat-intelligence/threats/:id/related
   */
  async getRelatedThreats(req: Request, res: Response): Promise<void> {
    try {
      const threats = await correlationService.getRelatedThreats(req.params['id']);
      res.json({
        success: true,
        data: threats,
        count: threats.length,
      });
    } catch (error: any) {
      logger.error('Error in getRelatedThreats controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get threat context
   * GET /api/v1/threat-intelligence/threats/:id/context
   */
  async getThreatContext(req: Request, res: Response): Promise<void> {
    try {
      const context = await contextService.getThreatContext(req.params['id']);
      res.json({
        success: true,
        data: context,
      });
    } catch (error: any) {
      logger.error('Error in getThreatContext controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Analyze threats
   * POST /api/v1/threat-intelligence/threats/analyze
   */
  async analyzeThreats(req: Request, res: Response): Promise<void> {
    try {
      const { threat_ids } = req.body;
      const analysis = await contextService.analyzePatterns(threat_ids);
      res.json({
        success: true,
        data: analysis,
      });
    } catch (error: any) {
      logger.error('Error in analyzeThreats controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export default new ThreatController();
