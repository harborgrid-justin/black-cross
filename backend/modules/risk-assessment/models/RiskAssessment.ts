/**
 * Risk Assessment Data Model
 */

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const RiskAssessmentSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  asset_id: {
    type: String,
    required: true,
    index: true,
  },
  threat_id: {
    type: String,
    index: true,
  },
  vulnerability_ids: [{
    type: String,
  }],
  likelihood: {
    type: String,
    enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    required: true,
  },
  impact: {
    type: String,
    enum: ['negligible', 'minor', 'moderate', 'major', 'critical'],
    required: true,
  },
  risk_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  risk_level: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true,
  },
  inherent_risk: {
    type: Number,
    min: 0,
    max: 100,
  },
  residual_risk: {
    type: Number,
    min: 0,
    max: 100,
  },
  controls: [{
    control_id: String,
    name: String,
    effectiveness: {
      type: Number,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'planned'],
    },
  }],
  status: {
    type: String,
    enum: ['open', 'in_progress', 'mitigated', 'accepted', 'closed'],
    default: 'open',
    index: true,
  },
  owner: {
    type: String,
    required: true,
  },
  assessed_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
  next_review: {
    type: Date,
    index: true,
  },
  mitigation_plan: {
    description: String,
    actions: [{
      action: String,
      responsible: String,
      due_date: Date,
      status: String,
    }],
    estimated_cost: Number,
  },
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes for performance
RiskAssessmentSchema.index({ risk_level: 1, status: 1 });
RiskAssessmentSchema.index({ assessed_at: -1 });
RiskAssessmentSchema.index({ next_review: 1 });
RiskAssessmentSchema.index({ owner: 1 });

// Virtual for days until next review
RiskAssessmentSchema.virtual('days_until_review').get(function getDaysUntilReview(this: any) {
  if (!this.next_review) return null;
  return Math.floor((this.next_review.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
});

export default mongoose.model('RiskAssessment', RiskAssessmentSchema);
