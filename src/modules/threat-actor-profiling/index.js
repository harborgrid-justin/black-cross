/**
 * Threat Actor Profiling Module
 * 
 * Main entry point for threat actor profiling module
 * Comprehensive threat actor intelligence and tracking system
 */

const express = require('express');
const router = express.Router();
const services = require('./services');
const validators = require('./validators');
const ThreatActorController = require('./controllers/ThreatActorController');

// ==================== Module Health Check ====================

/**
 * Health check
 * GET /api/v1/threat-actors/health
 */
router.get('/health', (req, res) => {
  res.json({
    module: 'threat-actor-profiling',
    status: 'operational',
    version: '1.0.0',
    features: [
      'actor-database-tracking',
      'ttps-mapping',
      'attribution-analysis',
      'campaign-tracking',
      'motivation-capability-assessment',
      'geographic-sector-analysis',
      'relationship-mapping'
    ],
    timestamp: new Date().toISOString()
  });
});

// ==================== Threat Actor Endpoints ====================

/**
 * Create threat actor
 * POST /api/v1/threat-actors
 */
router.post('/', ThreatActorController.createActor);

/**
 * List threat actors
 * GET /api/v1/threat-actors
 */
router.get('/', ThreatActorController.listActors);

/**
 * Get threat actor statistics
 * GET /api/v1/threat-actors/statistics
 */
router.get('/statistics', ThreatActorController.getStatistics);

/**
 * Get recently active actors
 * GET /api/v1/threat-actors/recent
 */
router.get('/recent', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 90;
    const actors = await services.threatActorService.getRecentlyActive(days);
    res.json({
      success: true,
      data: actors,
      period_days: days
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Search by infrastructure
 * GET /api/v1/threat-actors/search/infrastructure
 */
router.get('/search/infrastructure', async (req, res) => {
  try {
    const { indicator } = req.query;
    if (!indicator) {
      return res.status(400).json({ 
        success: false, 
        error: 'Indicator parameter is required' 
      });
    }
    const actors = await services.threatActorService.searchByInfrastructure(indicator);
    res.json({
      success: true,
      data: actors,
      indicator
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get threat actor by ID
 * GET /api/v1/threat-actors/:id
 */
router.get('/:id', ThreatActorController.getActorById);

/**
 * Update threat actor
 * PATCH /api/v1/threat-actors/:id
 */
router.patch('/:id', ThreatActorController.updateActor);

/**
 * Delete threat actor
 * DELETE /api/v1/threat-actors/:id
 */
router.delete('/:id', ThreatActorController.deleteActor);

/**
 * Add alias
 * POST /api/v1/threat-actors/:id/aliases
 */
router.post('/:id/aliases', ThreatActorController.addAlias);

/**
 * Calculate threat score
 * POST /api/v1/threat-actors/:id/calculate-score
 */
router.post('/:id/calculate-score', ThreatActorController.calculateThreatScore);

// ==================== TTP Mapping Endpoints ====================

/**
 * Get TTPs for actor
 * GET /api/v1/threat-actors/:id/ttps
 */
router.get('/:id/ttps', async (req, res) => {
  try {
    const ttps = await services.ttpMappingService.getTTPs(req.params.id);
    res.json({
      success: true,
      data: ttps
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Add TTP to actor
 * POST /api/v1/threat-actors/:id/ttps
 */
router.post('/:id/ttps', async (req, res) => {
  try {
    const { error, value } = validators.ttpSchemas.add.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.details[0].message 
      });
    }

    const actor = await services.ttpMappingService.addTTP(req.params.id, value);
    res.status(201).json({
      success: true,
      data: actor,
      message: 'TTP added successfully'
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Get TTP frequency analysis
 * GET /api/v1/threat-actors/:id/ttps/frequency
 */
router.get('/:id/ttps/frequency', async (req, res) => {
  try {
    const analysis = await services.ttpMappingService.getTTPFrequencyAnalysis(req.params.id);
    res.json({
      success: true,
      data: analysis
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Get defensive recommendations based on TTPs
 * GET /api/v1/threat-actors/:id/ttps/recommendations
 */
router.get('/:id/ttps/recommendations', async (req, res) => {
  try {
    const recommendations = await services.ttpMappingService.getDefensiveRecommendations(req.params.id);
    res.json({
      success: true,
      data: recommendations
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Get TTP evolution
 * GET /api/v1/threat-actors/:id/ttps/evolution
 */
router.get('/:id/ttps/evolution', async (req, res) => {
  try {
    const evolution = await services.ttpMappingService.getTTPEvolution(req.params.id);
    res.json({
      success: true,
      data: evolution
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Analyze TTP overlap between actors
 * GET /api/v1/threat-actors/:id/ttps/overlap/:id2
 */
router.get('/:id/ttps/overlap/:id2', async (req, res) => {
  try {
    const overlap = await services.ttpMappingService.analyzeTTPOverlap(
      req.params.id, 
      req.params.id2
    );
    res.json({
      success: true,
      data: overlap
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

// ==================== Attribution Endpoints ====================

/**
 * Perform attribution analysis
 * POST /api/v1/threat-actors/attribute
 */
router.post('/attribute', async (req, res) => {
  try {
    const { error, value } = validators.attributionSchemas.create.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.details[0].message 
      });
    }

    const attribution = await services.attributionService.performAttribution(value);
    res.status(201).json({
      success: true,
      data: attribution,
      message: 'Attribution analysis completed'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get attribution by incident ID
 * GET /api/v1/threat-actors/attribution/:incident_id
 */
router.get('/attribution/:incident_id', async (req, res) => {
  try {
    const attribution = await services.attributionService.getAttribution(req.params.incident_id);
    res.json({
      success: true,
      data: attribution
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Get attributions for actor
 * GET /api/v1/threat-actors/:id/attributions
 */
router.get('/:id/attributions', async (req, res) => {
  try {
    const attributions = await services.attributionService.getAttributionsByActor(req.params.id);
    res.json({
      success: true,
      data: attributions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Update attribution verification status
 * PUT /api/v1/threat-actors/attribution/:id/verify
 */
router.put('/attribution/:id/verify', async (req, res) => {
  try {
    const { error, value } = validators.attributionSchemas.updateVerification.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.details[0].message 
      });
    }

    const attribution = await services.attributionService.updateVerificationStatus(
      req.params.id,
      value.status,
      value.verified_by
    );
    res.json({
      success: true,
      data: attribution,
      message: 'Verification status updated'
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Get attribution statistics
 * GET /api/v1/threat-actors/attribution/statistics
 */
router.get('/attribution/statistics/all', async (req, res) => {
  try {
    const stats = await services.attributionService.getStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== Campaign Endpoints ====================

/**
 * Create campaign
 * POST /api/v1/threat-actors/campaigns
 */
router.post('/campaigns', async (req, res) => {
  try {
    const { error, value } = validators.campaignSchemas.create.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.details[0].message 
      });
    }

    const campaign = await services.campaignService.createCampaign(value);
    res.status(201).json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully'
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * List campaigns
 * GET /api/v1/threat-actors/campaigns
 */
router.get('/campaigns', async (req, res) => {
  try {
    const { error, value } = validators.querySchemas.campaigns.validate(req.query);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.details[0].message 
      });
    }

    const result = await services.campaignService.listCampaigns(value);
    res.json({
      success: true,
      data: result.campaigns,
      pagination: {
        total: result.total,
        limit: result.limit,
        skip: result.skip
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get active campaigns
 * GET /api/v1/threat-actors/campaigns/active
 */
router.get('/campaigns/active/all', async (req, res) => {
  try {
    const campaigns = await services.campaignService.getActiveCampaigns();
    res.json({
      success: true,
      data: campaigns
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get campaign statistics
 * GET /api/v1/threat-actors/campaigns/statistics
 */
router.get('/campaigns/statistics/all', async (req, res) => {
  try {
    const stats = await services.campaignService.getStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get campaign by ID
 * GET /api/v1/threat-actors/campaigns/:id
 */
router.get('/campaigns/:id', async (req, res) => {
  try {
    const campaign = await services.campaignService.getCampaignById(req.params.id);
    res.json({
      success: true,
      data: campaign
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Update campaign
 * PATCH /api/v1/threat-actors/campaigns/:id
 */
router.patch('/campaigns/:id', async (req, res) => {
  try {
    const { error, value } = validators.campaignSchemas.update.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.details[0].message 
      });
    }

    const campaign = await services.campaignService.updateCampaign(req.params.id, value);
    res.json({
      success: true,
      data: campaign,
      message: 'Campaign updated successfully'
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Add target to campaign
 * POST /api/v1/threat-actors/campaigns/:id/targets
 */
router.post('/campaigns/:id/targets', async (req, res) => {
  try {
    const { error, value } = validators.campaignSchemas.addTarget.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.details[0].message 
      });
    }

    const campaign = await services.campaignService.addTarget(req.params.id, value);
    res.json({
      success: true,
      data: campaign,
      message: 'Target added successfully'
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Add timeline event to campaign
 * POST /api/v1/threat-actors/campaigns/:id/timeline
 */
router.post('/campaigns/:id/timeline', async (req, res) => {
  try {
    const { error, value } = validators.campaignSchemas.addTimelineEvent.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.details[0].message 
      });
    }

    const campaign = await services.campaignService.addTimelineEvent(req.params.id, value);
    res.json({
      success: true,
      data: campaign,
      message: 'Timeline event added successfully'
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Get campaign timeline
 * GET /api/v1/threat-actors/campaigns/:id/timeline
 */
router.get('/campaigns/:id/timeline', async (req, res) => {
  try {
    const timeline = await services.campaignService.getCampaignTimeline(req.params.id);
    res.json({
      success: true,
      data: timeline
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Link campaigns
 * POST /api/v1/threat-actors/campaigns/:id/link
 */
router.post('/campaigns/:id/link', async (req, res) => {
  try {
    const { error, value } = validators.campaignSchemas.linkCampaigns.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.details[0].message 
      });
    }

    const result = await services.campaignService.linkCampaigns(
      req.params.id,
      value.linked_campaign_id,
      value.relationship,
      value.confidence
    );
    res.json({
      success: true,
      data: result,
      message: 'Campaigns linked successfully'
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Get campaign impact analysis
 * GET /api/v1/threat-actors/campaigns/:id/impact
 */
router.get('/campaigns/:id/impact', async (req, res) => {
  try {
    const impact = await services.campaignService.analyzeCampaignImpact(req.params.id);
    res.json({
      success: true,
      data: impact
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Get campaign TTPs
 * GET /api/v1/threat-actors/campaigns/:id/ttps
 */
router.get('/campaigns/:id/ttps', async (req, res) => {
  try {
    const ttps = await services.campaignService.getCampaignTTPs(req.params.id);
    res.json({
      success: true,
      data: ttps
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

// ==================== Assessment Endpoints ====================

/**
 * Get capability assessment
 * GET /api/v1/threat-actors/:id/assessment
 */
router.get('/:id/assessment', async (req, res) => {
  try {
    const assessment = await services.assessmentService.getAssessment(req.params.id);
    res.json({
      success: true,
      data: assessment
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Update capability assessment
 * PUT /api/v1/threat-actors/:id/assessment
 */
router.put('/:id/assessment', async (req, res) => {
  try {
    const { error, value } = validators.assessmentSchemas.update.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.details[0].message 
      });
    }

    const actor = await services.assessmentService.updateAssessment(req.params.id, value);
    res.json({
      success: true,
      data: actor,
      message: 'Assessment updated successfully'
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Get comprehensive assessment
 * GET /api/v1/threat-actors/:id/assessment/comprehensive
 */
router.get('/:id/assessment/comprehensive', async (req, res) => {
  try {
    const assessment = await services.assessmentService.getComprehensiveAssessment(req.params.id);
    res.json({
      success: true,
      data: assessment
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Get motivation assessment
 * GET /api/v1/threat-actors/:id/motivation
 */
router.get('/:id/motivation', async (req, res) => {
  try {
    const motivation = await services.assessmentService.assessMotivation(req.params.id);
    res.json({
      success: true,
      data: motivation
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

// ==================== Targeting Analysis Endpoints ====================

/**
 * Get actor targeting profile
 * GET /api/v1/threat-actors/:id/targets
 */
router.get('/:id/targets', async (req, res) => {
  try {
    const targets = await services.targetingAnalysisService.getActorTargets(req.params.id);
    res.json({
      success: true,
      data: targets
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Get geographic targeting heat map
 * GET /api/v1/threat-actors/targeting-trends/geographic
 */
router.get('/targeting-trends/geographic', async (req, res) => {
  try {
    const heatMap = await services.targetingAnalysisService.getGeographicHeatMap();
    res.json({
      success: true,
      data: heatMap
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get industry sector analysis
 * GET /api/v1/threat-actors/targeting-trends/industry
 */
router.get('/targeting-trends/industry', async (req, res) => {
  try {
    const analysis = await services.targetingAnalysisService.getIndustrySectorAnalysis();
    res.json({
      success: true,
      data: analysis
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get targeting trends
 * GET /api/v1/threat-actors/targeting-trends
 */
router.get('/targeting-trends', async (req, res) => {
  try {
    const period = req.query.period || '90d';
    const trends = await services.targetingAnalysisService.getTargetingTrends(period);
    res.json({
      success: true,
      data: trends
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get temporal targeting patterns
 * GET /api/v1/threat-actors/:id/targeting/temporal
 */
router.get('/:id/targeting/temporal', async (req, res) => {
  try {
    const patterns = await services.targetingAnalysisService.getTemporalPatterns(req.params.id);
    res.json({
      success: true,
      data: patterns
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Get attack vector preferences
 * GET /api/v1/threat-actors/:id/targeting/vectors
 */
router.get('/:id/targeting/vectors', async (req, res) => {
  try {
    const vectors = await services.targetingAnalysisService.getAttackVectorPreferences(req.params.id);
    res.json({
      success: true,
      data: vectors
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Get defensive recommendations for industry/country
 * GET /api/v1/threat-actors/defensive-recommendations
 */
router.get('/defensive-recommendations', async (req, res) => {
  try {
    const { industry, country } = req.query;
    if (!industry) {
      return res.status(400).json({ 
        success: false, 
        error: 'Industry parameter is required' 
      });
    }

    const recommendations = await services.targetingAnalysisService.getDefensiveRecommendations(
      industry,
      country
    );
    res.json({
      success: true,
      data: recommendations
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== Relationship Endpoints ====================

/**
 * Get relationships for actor
 * GET /api/v1/threat-actors/:id/relationships
 */
router.get('/:id/relationships', async (req, res) => {
  try {
    const relationships = await services.relationshipService.getRelationships(req.params.id);
    res.json({
      success: true,
      data: relationships
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Add relationship
 * POST /api/v1/threat-actors/:id/relationships
 */
router.post('/:id/relationships', async (req, res) => {
  try {
    const { error, value } = validators.relationshipSchemas.add.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.details[0].message 
      });
    }

    const relationship = await services.relationshipService.addRelationship(req.params.id, value);
    res.status(201).json({
      success: true,
      data: relationship,
      message: 'Relationship added successfully'
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Get infrastructure sharing analysis
 * GET /api/v1/threat-actors/:id/relationships/infrastructure
 */
router.get('/:id/relationships/infrastructure', async (req, res) => {
  try {
    const sharing = await services.relationshipService.analyzeInfrastructureSharing(req.params.id);
    res.json({
      success: true,
      data: sharing
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Get tool sharing analysis
 * GET /api/v1/threat-actors/:id/relationships/tools
 */
router.get('/:id/relationships/tools', async (req, res) => {
  try {
    const sharing = await services.relationshipService.analyzeToolSharing(req.params.id);
    res.json({
      success: true,
      data: sharing
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Detect collaboration
 * GET /api/v1/threat-actors/:id/relationships/collaboration
 */
router.get('/:id/relationships/collaboration', async (req, res) => {
  try {
    const collaboration = await services.relationshipService.detectCollaboration(req.params.id);
    res.json({
      success: true,
      data: collaboration
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Get relationship network
 * GET /api/v1/threat-actors/:id/relationships/network
 */
router.get('/:id/relationships/network', async (req, res) => {
  try {
    const depth = parseInt(req.query.depth) || 1;
    const network = await services.relationshipService.getRelationshipNetwork(req.params.id, depth);
    res.json({
      success: true,
      data: network
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Track nation-state affiliation
 * GET /api/v1/threat-actors/:id/affiliation
 */
router.get('/:id/affiliation', async (req, res) => {
  try {
    const affiliation = await services.relationshipService.trackNationStateAffiliation(req.params.id);
    res.json({
      success: true,
      data: affiliation
    });
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

module.exports = router;
