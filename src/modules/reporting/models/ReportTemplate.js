/**
 * Report Template Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ReportTemplateSchema = new mongoose.Schema({
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
  version: {
    type: String,
    default: '1.0.0',
  },
  template_data: {
    sections: [{
      id: String,
      title: String,
      type: String,
      content: mongoose.Schema.Types.Mixed,
      order: Number,
      conditional: {
        enabled: Boolean,
        expression: String,
      },
    }],
    layout: mongoose.Schema.Types.Mixed,
    styles: mongoose.Schema.Types.Mixed,
  },
  data_bindings: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  parameters: [{
    name: String,
    type: String,
    required: Boolean,
    default_value: mongoose.Schema.Types.Mixed,
    description: String,
  }],
  is_public: {
    type: Boolean,
    default: false,
  },
  created_by: {
    type: String,
    required: true,
    index: true,
  },
  shared_with: [{
    user_id: String,
    permissions: [String],
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft',
    index: true,
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
ReportTemplateSchema.index({ created_at: -1 });
ReportTemplateSchema.index({ status: 1, type: 1 });

module.exports = mongoose.model('ReportTemplate', ReportTemplateSchema);
