/**
 * Playbook Execution Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ActionExecutionSchema = new mongoose.Schema({
  action_id: {
    type: String,
    required: true
  },
  action_name: String,
  action_type: String,
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'skipped'],
    default: 'pending'
  },
  start_time: Date,
  end_time: Date,
  duration: Number,
  output: mongoose.Schema.Types.Mixed,
  error: String,
  retry_count: {
    type: Number,
    default: 0
  }
}, { _id: false });

const PlaybookExecutionSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true
  },
  playbook_id: {
    type: String,
    required: true,
    index: true
  },
  playbook_name: String,
  playbook_version: String,
  triggered_by: {
    type: {
      type: String,
      enum: ['user', 'event', 'schedule', 'api'],
      required: true
    },
    user_id: String,
    event_id: String,
    source: String
  },
  execution_mode: {
    type: String,
    enum: ['live', 'test', 'simulation'],
    default: 'live',
    index: true
  },
  status: {
    type: String,
    enum: ['queued', 'running', 'completed', 'failed', 'cancelled', 'awaiting_approval'],
    default: 'queued',
    index: true
  },
  start_time: {
    type: Date,
    default: Date.now,
    index: true
  },
  end_time: Date,
  duration: Number,
  actions_executed: [ActionExecutionSchema],
  total_actions: {
    type: Number,
    default: 0
  },
  successful_actions: {
    type: Number,
    default: 0
  },
  failed_actions: {
    type: Number,
    default: 0
  },
  skipped_actions: {
    type: Number,
    default: 0
  },
  errors: [{
    action_id: String,
    error_message: String,
    timestamp: Date
  }],
  output: mongoose.Schema.Types.Mixed,
  incident_id: String,
  alert_id: String,
  decision_path: [String],
  approval_status: {
    required: Boolean,
    approved_by: String,
    approved_at: Date,
    rejected_by: String,
    rejected_at: Date,
    reason: String
  },
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Indexes for performance
PlaybookExecutionSchema.index({ created_at: -1 });
PlaybookExecutionSchema.index({ playbook_id: 1, created_at: -1 });
PlaybookExecutionSchema.index({ status: 1, created_at: -1 });
PlaybookExecutionSchema.index({ 'triggered_by.user_id': 1 });

// Calculate duration before save
PlaybookExecutionSchema.pre('save', function(next) {
  if (this.end_time && this.start_time) {
    this.duration = Math.round((this.end_time - this.start_time) / 1000);
  }
  next();
});

module.exports = mongoose.model('PlaybookExecution', PlaybookExecutionSchema);
