/**
 * Compliance Gap Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ComplianceGapSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  control_id: {
    type: String,
    required: true,
    ref: 'ComplianceControl',
    index: true,
  },
  framework: {
    type: String,
    required: true,
    index: true,
  },
  gap_type: {
    type: String,
    enum: ['implementation', 'documentation', 'effectiveness', 'coverage'],
    required: true,
    index: true,
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium',
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  current_state: {
    type: String,
    required: true,
  },
  target_state: {
    type: String,
    required: true,
  },
  remediation_plan: {
    type: String,
  },
  owner: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['identified', 'in_progress', 'remediated', 'accepted', 'mitigated'],
    default: 'identified',
    index: true,
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5,
  },
  identified_date: {
    type: Date,
    default: Date.now,
    index: true,
  },
  target_remediation_date: {
    type: Date,
    index: true,
  },
  actual_remediation_date: {
    type: Date,
  },
  risk_score: {
    type: Number,
    min: 0,
    max: 100,
  },
  impact: {
    type: String,
  },
  recommendations: [{
    type: String,
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
  collection: 'compliance_gaps',
});

// Indexes for efficient queries
ComplianceGapSchema.index({ framework: 1, status: 1 });
ComplianceGapSchema.index({ severity: 1, priority: -1 });
ComplianceGapSchema.index({ owner: 1, status: 1 });
ComplianceGapSchema.index({ target_remediation_date: 1 });

module.exports = mongoose.model('ComplianceGap', ComplianceGapSchema);
