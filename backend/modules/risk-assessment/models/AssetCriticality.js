/**
 * Asset Criticality Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const AssetCriticalitySchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  asset_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  asset_name: {
    type: String,
    required: true,
  },
  asset_type: {
    type: String,
    required: true,
    enum: [
      'server', 'workstation', 'network_device', 'application',
      'database', 'service', 'cloud_resource', 'other',
    ],
  },
  business_unit: {
    type: String,
    required: true,
  },
  criticality_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  criticality_tier: {
    type: String,
    enum: ['tier_1_critical', 'tier_2_high', 'tier_3_medium', 'tier_4_low'],
    required: true,
    index: true,
  },
  business_impact: {
    financial: {
      type: Number,
      min: 0,
      max: 100,
    },
    operational: {
      type: Number,
      min: 0,
      max: 100,
    },
    reputational: {
      type: Number,
      min: 0,
      max: 100,
    },
    compliance: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  asset_value: {
    type: Number,
    min: 0,
  },
  dependencies: [{
    asset_id: String,
    dependency_type: {
      type: String,
      enum: ['depends_on', 'supports', 'connected_to'],
    },
    criticality_impact: Number,
  }],
  owner: {
    type: String,
    required: true,
  },
  data_classification: {
    type: String,
    enum: ['public', 'internal', 'confidential', 'restricted'],
    default: 'internal',
  },
  last_assessed: {
    type: Date,
    default: Date.now,
    index: true,
  },
  next_assessment: {
    type: Date,
    index: true,
  },
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes for performance
AssetCriticalitySchema.index({ criticality_tier: 1 });
AssetCriticalitySchema.index({ business_unit: 1 });
AssetCriticalitySchema.index({ owner: 1 });
AssetCriticalitySchema.index({ last_assessed: -1 });

// Virtual for overall business impact
AssetCriticalitySchema.virtual('overall_business_impact').get(function getOverallBusinessImpact() {
  if (!this.business_impact) return 0;
  const impacts = this.business_impact;
  const avg = (
    (impacts.financial || 0)
    + (impacts.operational || 0)
    + (impacts.reputational || 0)
    + (impacts.compliance || 0)
  ) / 4;
  return Math.round(avg);
});

module.exports = mongoose.model('AssetCriticality', AssetCriticalitySchema);
