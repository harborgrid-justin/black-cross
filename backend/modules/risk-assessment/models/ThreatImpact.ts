/**
 * Threat Impact Analysis Data Model
 */

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ThreatImpactSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  threat_id: {
    type: String,
    required: true,
    index: true,
  },
  threat_name: {
    type: String,
    required: true,
  },
  impact_dimensions: {
    financial: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      estimated_loss: Number,
      currency: {
        type: String,
        default: 'USD',
      },
      confidence: Number,
    },
    operational: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      affected_processes: [String],
      downtime_hours: Number,
      recovery_time: Number,
    },
    reputational: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      public_exposure: Boolean,
      customer_impact: String,
      media_attention_level: {
        type: String,
        enum: ['none', 'low', 'medium', 'high', 'critical'],
      },
    },
    regulatory: {
      score: {
        type: Number,
        min: 0,
        max: 100,
      },
      violations: [String],
      potential_fines: Number,
      compliance_frameworks: [String],
    },
    data_breach: {
      records_at_risk: Number,
      data_types: [String],
      notification_required: Boolean,
      affected_parties: Number,
    },
  },
  overall_impact_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  impact_level: {
    type: String,
    enum: ['negligible', 'minor', 'moderate', 'major', 'critical'],
    required: true,
  },
  scenarios: [{
    name: String,
    description: String,
    probability: Number,
    impact_score: Number,
  }],
  analyzed_by: {
    type: String,
    required: true,
  },
  analyzed_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes for performance
ThreatImpactSchema.index({ threat_id: 1, analyzed_at: -1 });
ThreatImpactSchema.index({ impact_level: 1 });
ThreatImpactSchema.index({ analyzed_by: 1 });

export default mongoose.model('ThreatImpact', ThreatImpactSchema);

