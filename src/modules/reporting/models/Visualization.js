/**
 * Visualization Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const VisualizationSchema = new mongoose.Schema({
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
      'bar_chart',
      'line_chart',
      'pie_chart',
      'scatter_plot',
      'heat_map',
      'geographic_map',
      'network_graph',
      'sankey_diagram',
      'funnel_chart',
      'time_series',
      'risk_matrix',
      'attack_chain',
      'comparison_chart',
      'relationship_graph',
    ],
    index: true,
  },
  data_source: {
    type: String,
    query: mongoose.Schema.Types.Mixed,
    parameters: mongoose.Schema.Types.Mixed,
  },
  configuration: {
    chart_options: mongoose.Schema.Types.Mixed,
    colors: [String],
    dimensions: {
      width: Number,
      height: Number,
    },
    interactive: Boolean,
    real_time: Boolean,
    refresh_interval: Number,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
  },
  last_rendered: {
    type: Date,
  },
  created_by: {
    type: String,
    required: true,
    index: true,
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
VisualizationSchema.index({ type: 1, status: 1 });
VisualizationSchema.index({ created_by: 1, status: 1 });
VisualizationSchema.index({ created_at: -1 });

module.exports = mongoose.model('Visualization', VisualizationSchema);
