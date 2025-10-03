/**
 * Campaign Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const CampaignSchema = new mongoose.Schema({
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
  description: {
    type: String,
    trim: true
  },
  threat_actor_id: {
    type: String,
    ref: 'ThreatActor',
    required: true,
    index: true
  },
  start_date: {
    type: Date,
    required: true,
    index: true
  },
  end_date: {
    type: Date,
    index: true
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'paused', 'concluded', 'ongoing'],
    default: 'active',
    index: true
  },
  objectives: [String],
  ttps: [{
    tactic: String,
    technique: String,
    technique_id: String,
    procedure: String,
    first_used: Date,
    last_used: Date
  }],
  targets: {
    industries: [String],
    countries: [String],
    organizations: [{
      name: String,
      type: String,
      country: String,
      compromised: Boolean,
      compromise_date: Date
    }]
  },
  indicators: {
    domains: [String],
    ips: [String],
    hashes: [String],
    email_addresses: [String],
    urls: [String]
  },
  malware_used: [{
    name: String,
    family: String,
    variant: String,
    purpose: String
  }],
  tools_used: [{
    name: String,
    type: String,
    purpose: String
  }],
  attack_vectors: [String],
  impact: {
    estimated_victims: Number,
    estimated_financial_loss: Number,
    data_stolen: String,
    systems_compromised: Number,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    }
  },
  attribution_confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  linked_campaigns: [{
    campaign_id: String,
    relationship: String,
    confidence: Number
  }],
  intelligence_sources: [{
    source: String,
    date: Date,
    reliability: String,
    url: String
  }],
  timeline_events: [{
    date: Date,
    event_type: String,
    description: String,
    indicators: [String]
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
CampaignSchema.index({ name: 'text', description: 'text' });
CampaignSchema.index({ threat_actor_id: 1, start_date: -1 });
CampaignSchema.index({ 'targets.industries': 1 });
CampaignSchema.index({ 'targets.countries': 1 });
CampaignSchema.index({ created_at: -1 });

// Virtual for campaign duration
CampaignSchema.virtual('duration_days').get(function() {
  const endDate = this.end_date || new Date();
  return Math.floor((endDate - this.start_date) / (1000 * 60 * 60 * 24));
});

// Virtual for is_active status
CampaignSchema.virtual('is_active').get(function() {
  return this.status === 'active' || this.status === 'ongoing';
});

module.exports = mongoose.model('Campaign', CampaignSchema);
