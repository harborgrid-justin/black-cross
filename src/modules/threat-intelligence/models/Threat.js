/**
 * Threat Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ThreatSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: ['malware', 'phishing', 'ransomware', 'apt', 'botnet', 'ddos', 
           'vulnerability', 'exploit', 'backdoor', 'trojan', 'worm', 'other'],
    index: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    default: 'medium',
    index: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 50
  },
  categories: [{
    type: String,
    trim: true,
    index: true
  }],
  tags: [{
    type: String,
    trim: true,
    index: true
  }],
  description: {
    type: String,
    required: true
  },
  indicators: [{
    type: {
      type: String,
      enum: ['ip', 'domain', 'url', 'hash', 'email', 'filename', 'registry', 'mutex']
    },
    value: String,
    context: String
  }],
  relationships: [{
    threat_id: String,
    relationship_type: {
      type: String,
      enum: ['related', 'part_of', 'derived_from', 'targets', 'uses']
    },
    confidence: Number
  }],
  source: {
    name: String,
    url: String,
    reliability: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived', 'investigating'],
    default: 'active',
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
  archived_at: {
    type: Date,
    index: true
  },
  enrichment_data: {
    geolocation: {
      country: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    reputation: {
      score: Number,
      vendors: [{
        name: String,
        score: Number,
        category: String
      }]
    },
    osint: mongoose.Schema.Types.Mixed,
    dns: {
      records: mongoose.Schema.Types.Mixed,
      history: mongoose.Schema.Types.Mixed
    },
    related_threats: [{
      id: String,
      name: String,
      similarity_score: Number
    }]
  },
  mitre_attack: {
    tactics: [String],
    techniques: [String],
    groups: [String]
  },
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Indexes for performance
ThreatSchema.index({ name: 'text', description: 'text' });
ThreatSchema.index({ created_at: -1 });
ThreatSchema.index({ updated_at: -1 });
ThreatSchema.index({ 'source.name': 1 });

// Virtual for age calculation
ThreatSchema.virtual('age_days').get(function() {
  return Math.floor((Date.now() - this.first_seen) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Threat', ThreatSchema);
