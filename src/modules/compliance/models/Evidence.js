/**
 * Evidence Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const EvidenceSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  evidence_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
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
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  evidence_type: {
    type: String,
    required: true,
    enum: ['document', 'screenshot', 'log', 'report', 'certificate',
      'configuration', 'scan_result', 'policy', 'procedure', 'other'],
    index: true,
  },
  collection_method: {
    type: String,
    enum: ['manual', 'automated', 'system_generated'],
    default: 'manual',
  },
  collected_by: {
    type: String,
    required: true,
    index: true,
  },
  collected_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
  file_path: {
    type: String,
  },
  file_size: {
    type: Number,
  },
  file_hash: {
    type: String,
  },
  file_type: {
    type: String,
  },
  url: {
    type: String,
  },
  content: {
    type: String,
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed', 'approved', 'rejected', 'archived'],
    default: 'draft',
    index: true,
  },
  validity_period: {
    start_date: Date,
    end_date: Date,
  },
  reviewed_by: {
    type: String,
  },
  review_date: {
    type: Date,
  },
  review_notes: {
    type: String,
  },
  chain_of_custody: [{
    user_id: String,
    action: String,
    timestamp: Date,
    notes: String,
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
  collection: 'evidence',
});

// Indexes for efficient queries
EvidenceSchema.index({ control_id: 1, status: 1 });
EvidenceSchema.index({ framework: 1, evidence_type: 1 });
EvidenceSchema.index({ collected_by: 1, collected_at: -1 });
EvidenceSchema.index({ status: 1, collected_at: -1 });

module.exports = mongoose.model('Evidence', EvidenceSchema);
