/**
 * Policy Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const PolicySchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  policy_id: {
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
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  version: {
    type: String,
    required: true,
    default: '1.0',
  },
  category: {
    type: String,
    required: true,
    enum: ['security', 'privacy', 'operational', 'compliance', 'access_control',
      'data_protection', 'incident_response', 'business_continuity', 'other'],
    index: true,
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'published', 'archived', 'retired'],
    default: 'draft',
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
    index: true,
  },
  approver: {
    type: String,
  },
  approval_date: {
    type: Date,
    index: true,
  },
  effective_date: {
    type: Date,
    index: true,
  },
  review_date: {
    type: Date,
    index: true,
  },
  next_review_date: {
    type: Date,
    index: true,
  },
  frameworks: [{
    type: String,
    enum: ['NIST-CSF', 'NIST-800-53', 'NIST-800-171', 'ISO-27001', 'ISO-27002',
      'PCI-DSS', 'HIPAA', 'GDPR', 'SOX', 'SOC2', 'CMMC', 'FedRAMP', 'CIS'],
  }],
  controls: [{
    type: String,
    ref: 'ComplianceControl',
  }],
  enforcement_level: {
    type: String,
    enum: ['mandatory', 'recommended', 'optional'],
    default: 'mandatory',
  },
  exceptions: [{
    user_id: String,
    reason: String,
    approved_by: String,
    approval_date: Date,
    expiry_date: Date,
  }],
  acknowledgments: [{
    user_id: String,
    username: String,
    acknowledged_at: Date,
    version: String,
  }],
  attachments: [{
    filename: String,
    url: String,
    uploaded_at: Date,
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
  collection: 'policies',
});

// Indexes for efficient queries
PolicySchema.index({ status: 1, category: 1 });
PolicySchema.index({ owner: 1, status: 1 });
PolicySchema.index({ next_review_date: 1 });
PolicySchema.index({ frameworks: 1 });

module.exports = mongoose.model('Policy', PolicySchema);
