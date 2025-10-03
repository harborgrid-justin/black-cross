/**
 * Workflow Data Model
 * Defines automated response workflows
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const WorkflowActionSchema = new mongoose.Schema({
  action_id: {
    type: String,
    default: uuidv4,
  },
  order: {
    type: Number,
    required: true,
  },
  action_type: {
    type: String,
    enum: ['isolate_asset', 'block_ip', 'block_domain', 'disable_account', 'reset_password',
      'collect_logs', 'snapshot_system', 'send_notification', 'create_ticket',
      'escalate', 'run_script', 'custom'],
    required: true,
  },
  name: String,
  description: String,
  parameters: mongoose.Schema.Types.Mixed,
  conditional_logic: {
    enabled: {
      type: Boolean,
      default: false,
    },
    condition: String, // e.g., "severity == 'critical'"
    on_true: String, // next action_id if true
    on_false: String, // next action_id if false
  },
  approval_required: {
    type: Boolean,
    default: false,
  },
  approval_role: String,
  timeout_seconds: Number,
  retry_on_failure: {
    type: Boolean,
    default: false,
  },
  max_retries: Number,
});

const WorkflowSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    index: true,
  },
  description: String,
  category: {
    type: String,
    enum: ['malware', 'phishing', 'data_breach', 'ddos', 'unauthorized_access', 'insider_threat', 'ransomware', 'generic'],
    required: true,
  },
  trigger_conditions: {
    severity: [String],
    category: [String],
    priority: [String],
    auto_trigger: {
      type: Boolean,
      default: false,
    },
  },
  actions: [WorkflowActionSchema],
  parallel_execution: {
    type: Boolean,
    default: false,
  },
  version: {
    type: Number,
    default: 1,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  created_by: String,
  updated_by: String,
  execution_count: {
    type: Number,
    default: 0,
  },
  success_count: {
    type: Number,
    default: 0,
  },
  failure_count: {
    type: Number,
    default: 0,
  },
  average_execution_time: Number, // seconds
  tags: [String],
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes
WorkflowSchema.index({ category: 1, is_active: 1 });
WorkflowSchema.index({ 'trigger_conditions.auto_trigger': 1 });

module.exports = mongoose.model('Workflow', WorkflowSchema);
