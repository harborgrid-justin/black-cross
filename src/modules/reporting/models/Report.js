/**
 * Report Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ReportSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
  },
  template_id: {
    type: String,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'executive_summary',
      'threat_intelligence',
      'incident_response',
      'vulnerability_assessment',
      'compliance',
      'trend_analysis',
      'operational_metrics',
      'risk_assessment',
    ],
    index: true,
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  format: {
    type: String,
    required: true,
    enum: ['pdf', 'excel', 'csv', 'json', 'xml', 'html', 'powerpoint'],
    default: 'pdf',
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'generating', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  file_url: {
    type: String,
  },
  file_size: {
    type: Number,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
  },
  created_by: {
    type: String,
    required: true,
    index: true,
  },
  generated_at: {
    type: Date,
  },
  error_message: {
    type: String,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes for performance
ReportSchema.index({ created_at: -1 });
ReportSchema.index({ updated_at: -1 });
ReportSchema.index({ status: 1, created_at: -1 });

module.exports = mongoose.model('Report', ReportSchema);
