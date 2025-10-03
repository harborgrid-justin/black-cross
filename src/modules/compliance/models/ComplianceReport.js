/**
 * Compliance Report Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ComplianceReportSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  report_id: {
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
  report_type: {
    type: String,
    required: true,
    enum: ['assessment', 'audit', 'gap_analysis', 'executive_summary',
      'control_effectiveness', 'compliance_status', 'remediation_progress'],
    index: true,
  },
  framework: {
    type: String,
    required: true,
    index: true,
  },
  generated_by: {
    type: String,
    required: true,
  },
  generated_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
  period_start: {
    type: Date,
    required: true,
  },
  period_end: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed', 'archived'],
    default: 'generating',
    index: true,
  },
  format: {
    type: String,
    enum: ['pdf', 'html', 'json', 'csv', 'excel'],
    default: 'pdf',
  },
  compliance_score: {
    type: Number,
    min: 0,
    max: 100,
  },
  controls_assessed: {
    type: Number,
    default: 0,
  },
  controls_compliant: {
    type: Number,
    default: 0,
  },
  controls_non_compliant: {
    type: Number,
    default: 0,
  },
  gaps_identified: {
    type: Number,
    default: 0,
  },
  summary: {
    type: String,
  },
  findings: [{
    control_id: String,
    status: String,
    severity: String,
    description: String,
  }],
  recommendations: [{
    type: String,
  }],
  evidence_package: {
    type: String,
  },
  report_url: {
    type: String,
  },
  recipients: [{
    type: String,
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
  collection: 'compliance_reports',
});

// Indexes for efficient queries
ComplianceReportSchema.index({ framework: 1, generated_at: -1 });
ComplianceReportSchema.index({ report_type: 1, status: 1 });
ComplianceReportSchema.index({ period_start: 1, period_end: 1 });

module.exports = mongoose.model('ComplianceReport', ComplianceReportSchema);
