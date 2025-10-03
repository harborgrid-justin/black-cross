/**
 * Regulatory Requirement Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const RegulatoryRequirementSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  requirement_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  jurisdiction: {
    type: String,
    required: true,
    index: true,
  },
  regulation: {
    type: String,
    required: true,
    index: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['data_protection', 'privacy', 'security', 'financial', 'healthcare',
      'consumer_protection', 'environmental', 'industry_specific', 'other'],
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'proposed', 'superseded', 'repealed'],
    default: 'active',
    index: true,
  },
  effective_date: {
    type: Date,
    required: true,
    index: true,
  },
  compliance_deadline: {
    type: Date,
    index: true,
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium',
    index: true,
  },
  applicability: {
    type: String,
    required: true,
  },
  controls: [{
    type: String,
    ref: 'ComplianceControl',
  }],
  frameworks: [{
    type: String,
  }],
  penalties: {
    type: String,
  },
  compliance_status: {
    type: String,
    enum: ['compliant', 'non_compliant', 'partially_compliant', 'not_assessed', 'not_applicable'],
    default: 'not_assessed',
    index: true,
  },
  assessment_date: {
    type: Date,
  },
  next_assessment_date: {
    type: Date,
    index: true,
  },
  owner: {
    type: String,
    required: true,
    index: true,
  },
  implementation_notes: {
    type: String,
  },
  evidence: [{
    type: String,
    ref: 'Evidence',
  }],
  updates: [{
    date: Date,
    description: String,
    impact: String,
    updated_by: String,
  }],
  references: [{
    type: String,
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
  collection: 'regulatory_requirements',
});

// Indexes for efficient queries
RegulatoryRequirementSchema.index({ jurisdiction: 1, category: 1 });
RegulatoryRequirementSchema.index({ status: 1, effective_date: -1 });
RegulatoryRequirementSchema.index({ compliance_deadline: 1 });
RegulatoryRequirementSchema.index({ owner: 1, compliance_status: 1 });

module.exports = mongoose.model('RegulatoryRequirement', RegulatoryRequirementSchema);
