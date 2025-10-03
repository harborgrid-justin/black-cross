/**
 * Threat Actor Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ThreatActorSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  aliases: [{
    type: String,
    trim: true
  }],
  type: {
    type: String,
    required: true,
    enum: ['nation-state', 'cybercriminal', 'hacktivist', 'insider-threat', 'terrorist', 'apt', 'script-kiddie', 'unknown'],
    index: true
  },
  sophistication: {
    type: String,
    required: true,
    enum: ['none', 'minimal', 'intermediate', 'advanced', 'expert', 'innovator', 'strategic'],
    default: 'intermediate',
    index: true
  },
  motivation: [{
    type: String,
    enum: ['financial', 'espionage', 'ideology', 'revenge', 'notoriety', 'dominance', 'unknown']
  }],
  origin_country: {
    type: String,
    trim: true,
    index: true
  },
  first_seen: {
    type: Date,
    default: Date.now,
    index: true
  },
  last_seen: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'dormant', 'defunct', 'unknown'],
    default: 'active',
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  ttps: [{
    tactic: String,
    technique: String,
    technique_id: String,
    procedure: String,
    frequency: Number,
    confidence: Number
  }],
  campaigns: [{
    type: String,
    ref: 'Campaign'
  }],
  associated_malware: [{
    name: String,
    family: String,
    hash: String
  }],
  associated_tools: [{
    name: String,
    type: String,
    purpose: String
  }],
  targets: {
    industries: [String],
    countries: [String],
    organization_types: [String],
    organization_sizes: [String]
  },
  infrastructure: {
    domains: [String],
    ips: [String],
    email_addresses: [String],
    bitcoin_addresses: [String]
  },
  confidence_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  threat_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  capability_assessment: {
    technical_capability: {
      type: Number,
      min: 0,
      max: 100
    },
    operational_capability: {
      type: Number,
      min: 0,
      max: 100
    },
    resource_level: {
      type: String,
      enum: ['low', 'medium', 'high', 'very-high']
    },
    funding_source: String,
    team_size_estimate: String
  },
  attribution_indicators: {
    language: [String],
    timezone: String,
    coding_style: [String],
    operational_hours: String
  },
  relationships: [{
    actor_id: String,
    relationship_type: {
      type: String,
      enum: ['affiliated', 'competitor', 'collaboration', 'subsidiary', 'supply-chain', 'shared-infrastructure', 'unknown']
    },
    strength: {
      type: Number,
      min: 0,
      max: 100
    },
    evidence: [String]
  }],
  intelligence_sources: [{
    source: String,
    date: Date,
    reliability: String,
    url: String
  }],
  notes: String,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Indexes for performance
ThreatActorSchema.index({ name: 'text', description: 'text', aliases: 'text' });
ThreatActorSchema.index({ created_at: -1 });
ThreatActorSchema.index({ updated_at: -1 });
ThreatActorSchema.index({ 'targets.industries': 1 });
ThreatActorSchema.index({ 'targets.countries': 1 });

// Virtual for activity duration
ThreatActorSchema.virtual('activity_duration_days').get(function() {
  return Math.floor((this.last_seen - this.first_seen) / (1000 * 60 * 60 * 24));
});

// Virtual for activity status
ThreatActorSchema.virtual('is_recently_active').get(function() {
  const daysSinceLastSeen = Math.floor((Date.now() - this.last_seen) / (1000 * 60 * 60 * 24));
  return daysSinceLastSeen <= 90;
});

module.exports = mongoose.model('ThreatActor', ThreatActorSchema);
