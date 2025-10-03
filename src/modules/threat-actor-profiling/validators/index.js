/**
 * Validation Schemas
 * 
 * Joi validation schemas for threat actor profiling
 */

const Joi = require('joi');

// Threat Actor validation schemas
const threatActorSchemas = {
  create: Joi.object({
    name: Joi.string().required(),
    aliases: Joi.array().items(Joi.string()).optional(),
    type: Joi.string().valid(
      'nation-state', 'cybercriminal', 'hacktivist', 'insider-threat', 
      'terrorist', 'apt', 'script-kiddie', 'unknown'
    ).required(),
    sophistication: Joi.string().valid(
      'none', 'minimal', 'intermediate', 'advanced', 
      'expert', 'innovator', 'strategic'
    ).default('intermediate'),
    motivation: Joi.array().items(
      Joi.string().valid(
        'financial', 'espionage', 'ideology', 'revenge', 'notoriety', 'dominance', 'unknown'
      )
    ).optional(),
    origin_country: Joi.string().optional(),
    description: Joi.string().optional(),
    first_seen: Joi.date().optional(),
    last_seen: Joi.date().optional(),
    status: Joi.string().valid('active', 'dormant', 'defunct', 'unknown').default('active'),
    targets: Joi.object({
      industries: Joi.array().items(Joi.string()).optional(),
      countries: Joi.array().items(Joi.string()).optional(),
      organization_types: Joi.array().items(Joi.string()).optional(),
      organization_sizes: Joi.array().items(Joi.string()).optional()
    }).optional(),
    infrastructure: Joi.object({
      domains: Joi.array().items(Joi.string()).optional(),
      ips: Joi.array().items(Joi.string()).optional(),
      email_addresses: Joi.array().items(Joi.string()).optional(),
      bitcoin_addresses: Joi.array().items(Joi.string()).optional()
    }).optional(),
    confidence_score: Joi.number().min(0).max(100).default(50),
    notes: Joi.string().optional()
  }),
  
  update: Joi.object({
    name: Joi.string().optional(),
    aliases: Joi.array().items(Joi.string()).optional(),
    type: Joi.string().valid(
      'nation-state', 'cybercriminal', 'hacktivist', 'insider-threat', 
      'terrorist', 'apt', 'script-kiddie', 'unknown'
    ).optional(),
    sophistication: Joi.string().valid(
      'none', 'minimal', 'intermediate', 'advanced', 
      'expert', 'innovator', 'strategic'
    ).optional(),
    motivation: Joi.array().items(Joi.string()).optional(),
    origin_country: Joi.string().optional(),
    description: Joi.string().optional(),
    last_seen: Joi.date().optional(),
    status: Joi.string().valid('active', 'dormant', 'defunct', 'unknown').optional(),
    confidence_score: Joi.number().min(0).max(100).optional(),
    notes: Joi.string().optional()
  }),

  addAlias: Joi.object({
    alias: Joi.string().required()
  })
};

// TTP validation schemas
const ttpSchemas = {
  add: Joi.object({
    tactic: Joi.string().required(),
    technique: Joi.string().required(),
    technique_id: Joi.string().optional(),
    procedure: Joi.string().optional(),
    frequency: Joi.number().min(0).default(1),
    confidence: Joi.number().min(0).max(100).default(50),
    first_observed: Joi.date().optional(),
    last_observed: Joi.date().optional()
  })
};

// Campaign validation schemas
const campaignSchemas = {
  create: Joi.object({
    name: Joi.string().required(),
    aliases: Joi.array().items(Joi.string()).optional(),
    description: Joi.string().optional(),
    threat_actor_id: Joi.string().required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().optional(),
    status: Joi.string().valid(
      'planning', 'active', 'paused', 'concluded', 'ongoing'
    ).default('active'),
    objectives: Joi.array().items(Joi.string()).optional(),
    targets: Joi.object({
      industries: Joi.array().items(Joi.string()).optional(),
      countries: Joi.array().items(Joi.string()).optional()
    }).optional(),
    indicators: Joi.object({
      domains: Joi.array().items(Joi.string()).optional(),
      ips: Joi.array().items(Joi.string()).optional(),
      hashes: Joi.array().items(Joi.string()).optional(),
      email_addresses: Joi.array().items(Joi.string()).optional(),
      urls: Joi.array().items(Joi.string()).optional()
    }).optional(),
    notes: Joi.string().optional()
  }),

  update: Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    end_date: Joi.date().optional(),
    status: Joi.string().valid(
      'planning', 'active', 'paused', 'concluded', 'ongoing'
    ).optional(),
    objectives: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().optional()
  }),

  addTarget: Joi.object({
    name: Joi.string().required(),
    type: Joi.string().optional(),
    country: Joi.string().optional(),
    compromised: Joi.boolean().default(false),
    compromise_date: Joi.date().optional()
  }),

  addTimelineEvent: Joi.object({
    date: Joi.date().default(Date.now),
    event_type: Joi.string().required(),
    description: Joi.string().required(),
    indicators: Joi.array().items(Joi.string()).optional()
  }),

  linkCampaigns: Joi.object({
    linked_campaign_id: Joi.string().required(),
    relationship: Joi.string().required(),
    confidence: Joi.number().min(0).max(100).default(50)
  })
};

// Attribution validation schemas
const attributionSchemas = {
  create: Joi.object({
    incident_id: Joi.string().required(),
    incident_name: Joi.string().required(),
    incident_date: Joi.date().default(Date.now),
    technical_indicators: Joi.object({
      malware_hashes: Joi.array().items(Joi.string()).optional(),
      domains: Joi.array().items(Joi.string()).optional(),
      ips: Joi.array().items(Joi.string()).optional(),
      email_addresses: Joi.array().items(Joi.string()).optional()
    }).optional(),
    behavioral_indicators: Joi.object({
      ttps_observed: Joi.array().items(Joi.object({
        tactic: Joi.string().optional(),
        technique: Joi.string().optional(),
        technique_id: Joi.string().optional(),
        procedure: Joi.string().optional()
      })).optional(),
      operational_patterns: Joi.array().items(Joi.string()).optional(),
      targeting_patterns: Joi.object({
        industries: Joi.array().items(Joi.string()).optional(),
        countries: Joi.array().items(Joi.string()).optional(),
        organization_types: Joi.array().items(Joi.string()).optional()
      }).optional()
    }).optional(),
    linguistic_indicators: Joi.object({
      languages_detected: Joi.array().items(Joi.string()).optional(),
      timezone_hints: Joi.array().items(Joi.string()).optional(),
      cultural_references: Joi.array().items(Joi.string()).optional()
    }).optional(),
    infrastructure_analysis: Joi.object({
      hosting_providers: Joi.array().items(Joi.string()).optional(),
      registration_patterns: Joi.array().items(Joi.string()).optional(),
      shared_infrastructure: Joi.array().items(Joi.object({
        resource: Joi.string().required(),
        shared_with_actors: Joi.array().items(Joi.string()).optional()
      })).optional()
    }).optional(),
    analysis_method: Joi.string().valid('automated', 'manual', 'hybrid').default('automated'),
    analyst_notes: Joi.string().optional()
  }),

  updateVerification: Joi.object({
    status: Joi.string().valid(
      'unverified', 'partially-verified', 'verified', 'disputed'
    ).required(),
    verified_by: Joi.string().required()
  })
};

// Assessment validation schemas
const assessmentSchemas = {
  update: Joi.object({
    technical_capability: Joi.number().min(0).max(100).optional(),
    operational_capability: Joi.number().min(0).max(100).optional(),
    resource_level: Joi.string().valid('low', 'medium', 'high', 'very-high').optional(),
    funding_source: Joi.string().optional(),
    team_size_estimate: Joi.string().optional()
  })
};

// Relationship validation schemas
const relationshipSchemas = {
  add: Joi.object({
    actor_id: Joi.string().required(),
    relationship_type: Joi.string().valid(
      'affiliated', 'competitor', 'collaboration', 'subsidiary', 
      'supply-chain', 'shared-infrastructure', 'unknown'
    ).required(),
    strength: Joi.number().min(0).max(100).default(50),
    evidence: Joi.array().items(Joi.string()).optional(),
    notes: Joi.string().optional()
  })
};

// Query validation schemas
const querySchemas = {
  list: Joi.object({
    type: Joi.string().optional(),
    status: Joi.string().optional(),
    sophistication: Joi.string().optional(),
    motivation: Joi.string().optional(),
    country: Joi.string().optional(),
    search: Joi.string().optional(),
    limit: Joi.number().min(1).max(1000).default(50),
    skip: Joi.number().min(0).default(0),
    sort: Joi.string().optional()
  }),

  campaigns: Joi.object({
    threat_actor_id: Joi.string().optional(),
    status: Joi.string().optional(),
    industry: Joi.string().optional(),
    country: Joi.string().optional(),
    search: Joi.string().optional(),
    limit: Joi.number().min(1).max(1000).default(50),
    skip: Joi.number().min(0).default(0)
  }),

  attributions: Joi.object({
    actor_id: Joi.string().optional(),
    verification_status: Joi.string().optional(),
    min_confidence: Joi.number().min(0).max(100).optional(),
    limit: Joi.number().min(1).max(1000).default(50),
    skip: Joi.number().min(0).default(0)
  })
};

module.exports = {
  threatActorSchemas,
  ttpSchemas,
  campaignSchemas,
  attributionSchemas,
  assessmentSchemas,
  relationshipSchemas,
  querySchemas
};
