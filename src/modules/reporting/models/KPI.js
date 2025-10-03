/**
 * KPI (Key Performance Indicator) Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const KPISchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true,
    enum: [
      'threat_detection',
      'incident_response',
      'vulnerability_management',
      'security_posture',
      'compliance',
      'operational',
      'custom',
    ],
    index: true,
  },
  metric_type: {
    type: String,
    required: true,
    enum: [
      'count',
      'percentage',
      'ratio',
      'duration',
      'score',
      'rate',
    ],
  },
  calculation: {
    formula: String,
    aggregation: String,
    data_sources: [String],
    query: mongoose.Schema.Types.Mixed,
  },
  current_value: {
    type: Number,
  },
  target_value: {
    type: Number,
  },
  thresholds: {
    critical: Number,
    warning: Number,
    good: Number,
    excellent: Number,
  },
  unit: {
    type: String,
    default: '',
  },
  history: [{
    date: Date,
    value: Number,
    metadata: mongoose.Schema.Types.Mixed,
  }],
  collection_frequency: {
    type: String,
    default: 'daily',
  },
  last_collected: {
    type: Date,
  },
  trend: {
    direction: {
      type: String,
      enum: ['up', 'down', 'stable'],
    },
    percentage: Number,
    period: String,
  },
  owner: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active',
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
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
KPISchema.index({ category: 1, status: 1 });
KPISchema.index({ owner: 1, status: 1 });
KPISchema.index({ created_at: -1 });

module.exports = mongoose.model('KPI', KPISchema);
