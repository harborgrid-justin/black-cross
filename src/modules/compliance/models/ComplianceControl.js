/**
 * Compliance Control Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ComplianceControlSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  control_id: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  framework: {
    type: String,
    required: true,
    enum: ['NIST-CSF', 'NIST-800-53', 'NIST-800-171', 'ISO-27001', 'ISO-27002',
      'ISO-27017', 'ISO-27018', 'PCI-DSS', 'HIPAA', 'GDPR', 'SOX',
      'SOC2', 'CMMC', 'FedRAMP', 'CIS'],
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
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'archived'],
    default: 'active',
    index: true,
  },
  owner: {
    type: String,
    required: true,
    index: true,
  },
  implementation_status: {
    type: String,
    enum: ['not_implemented', 'partially_implemented', 'implemented', 'not_applicable'],
    default: 'not_implemented',
    index: true,
  },
  effectiveness: {
    type: String,
    enum: ['not_assessed', 'ineffective', 'partially_effective', 'effective'],
    default: 'not_assessed',
  },
  evidence: [{
    type: String,
    ref: 'Evidence',
  }],
  last_assessed: {
    type: Date,
    index: true,
  },
  next_review: {
    type: Date,
    index: true,
  },
  risk_level: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium',
    index: true,
  },
  control_family: {
    type: String,
    trim: true,
  },
  requirements: [{
    type: String,
  }],
  test_procedures: [{
    type: String,
  }],
  remediation_notes: {
    type: String,
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
  collection: 'compliance_controls',
});

// Indexes for efficient queries
ComplianceControlSchema.index({ framework: 1, control_id: 1 });
ComplianceControlSchema.index({ owner: 1, status: 1 });
ComplianceControlSchema.index({ implementation_status: 1, risk_level: 1 });
ComplianceControlSchema.index({ next_review: 1 });

module.exports = mongoose.model('ComplianceControl', ComplianceControlSchema);
