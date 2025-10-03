/**
 * Custom Risk Scoring Model Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const RiskModelSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  model_type: {
    type: String,
    enum: ['qualitative', 'quantitative', 'hybrid'],
    required: true,
  },
  formula: {
    type: String,
    required: true,
  },
  factors: [{
    name: String,
    weight: {
      type: Number,
      min: 0,
      max: 1,
    },
    data_type: {
      type: String,
      enum: ['number', 'enum', 'boolean'],
    },
    possible_values: [String],
    description: String,
  }],
  likelihood_matrix: {
    very_low: { min: Number, max: Number },
    low: { min: Number, max: Number },
    medium: { min: Number, max: Number },
    high: { min: Number, max: Number },
    very_high: { min: Number, max: Number },
  },
  impact_matrix: {
    negligible: { min: Number, max: Number },
    minor: { min: Number, max: Number },
    moderate: { min: Number, max: Number },
    major: { min: Number, max: Number },
    critical: { min: Number, max: Number },
  },
  risk_levels: {
    low: { min: Number, max: Number },
    medium: { min: Number, max: Number },
    high: { min: Number, max: Number },
    critical: { min: Number, max: Number },
  },
  version: {
    type: Number,
    default: 1,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  is_default: {
    type: Boolean,
    default: false,
  },
  industry_template: {
    type: String,
    enum: ['financial', 'healthcare', 'government', 'technology', 'retail', 'custom'],
  },
  created_by: {
    type: String,
    required: true,
  },
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes for performance
RiskModelSchema.index({ is_active: 1, is_default: 1 });
RiskModelSchema.index({ industry_template: 1 });
RiskModelSchema.index({ created_by: 1 });

module.exports = mongoose.model('RiskModel', RiskModelSchema);
