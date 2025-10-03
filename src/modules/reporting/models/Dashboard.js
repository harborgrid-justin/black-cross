/**
 * Dashboard Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const DashboardSchema = new mongoose.Schema({
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
      'executive',
      'operational',
      'analytical',
      'compliance',
      'custom',
    ],
    index: true,
  },
  widgets: [{
    id: String,
    type: String,
    title: String,
    position: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
    },
    config: mongoose.Schema.Types.Mixed,
    data_source: {
      type: String,
      query: mongoose.Schema.Types.Mixed,
      refresh_interval: Number,
    },
  }],
  layout: {
    columns: Number,
    rows: Number,
    responsive: Boolean,
    breakpoints: mongoose.Schema.Types.Mixed,
  },
  refresh_interval: {
    type: Number,
    default: 300000,
  },
  filters: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  owner: {
    type: String,
    required: true,
    index: true,
  },
  shared_with: [{
    user_id: String,
    permissions: [String],
  }],
  is_public: {
    type: Boolean,
    default: false,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'active',
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
DashboardSchema.index({ owner: 1, status: 1 });
DashboardSchema.index({ type: 1, status: 1 });
DashboardSchema.index({ created_at: -1 });

module.exports = mongoose.model('Dashboard', DashboardSchema);
