/**
 * Attribution Analysis Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const AttributionSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true
  },
  incident_id: {
    type: String,
    required: true,
    index: true
  },
  incident_name: {
    type: String,
    required: true
  },
  incident_date: {
    type: Date,
    required: true,
    index: true
  },
  attributed_actors: [{
    actor_id: String,
    actor_name: String,
    confidence_score: {
      type: Number,
      min: 0,
      max: 100
    },
    reasoning: String,
    supporting_evidence: [{
      type: String,
      indicator: String,
      match_type: String,
      weight: Number
    }]
  }],
  technical_indicators: {
    malware_hashes: [String],
    domains: [String],
    ips: [String],
    email_addresses: [String],
    code_similarities: [{
      hash: String,
      similarity_score: Number,
      matched_actor: String
    }]
  },
  behavioral_indicators: {
    ttps_observed: [{
      tactic: String,
      technique: String,
      technique_id: String,
      procedure: String
    }],
    operational_patterns: [String],
    targeting_patterns: {
      industries: [String],
      countries: [String],
      organization_types: [String]
    }
  },
  linguistic_indicators: {
    languages_detected: [String],
    timezone_hints: [String],
    cultural_references: [String]
  },
  infrastructure_analysis: {
    hosting_providers: [String],
    registration_patterns: [String],
    shared_infrastructure: [{
      resource: String,
      shared_with_actors: [String]
    }]
  },
  timeline_correlation: [{
    actor_id: String,
    actor_name: String,
    overlapping_activities: [{
      date: Date,
      activity: String,
      correlation_strength: Number
    }]
  }],
  analysis_method: {
    type: String,
    enum: ['automated', 'manual', 'hybrid'],
    default: 'automated'
  },
  analyst_notes: String,
  overall_confidence: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  confidence_factors: {
    technical_indicators: Number,
    behavioral_patterns: Number,
    infrastructure_overlap: Number,
    timing_correlation: Number,
    linguistic_analysis: Number
  },
  alternative_hypotheses: [{
    actor_id: String,
    actor_name: String,
    confidence_score: Number,
    reasoning: String
  }],
  verification_status: {
    type: String,
    enum: ['unverified', 'partially-verified', 'verified', 'disputed'],
    default: 'unverified'
  },
  verified_by: String,
  verification_date: Date,
  intelligence_sources: [{
    source: String,
    date: Date,
    reliability: String,
    url: String
  }],
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Indexes for performance
AttributionSchema.index({ incident_id: 1 });
AttributionSchema.index({ 'attributed_actors.actor_id': 1 });
AttributionSchema.index({ overall_confidence: -1 });
AttributionSchema.index({ incident_date: -1 });
AttributionSchema.index({ created_at: -1 });

module.exports = mongoose.model('Attribution', AttributionSchema);
