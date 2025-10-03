/**
 * Playbook Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ActionSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
  },
  type: {
    type: String,
    required: true,
    enum: ['block_ip', 'isolate_endpoint', 'reset_credentials', 'send_notification',
      'create_ticket', 'collect_evidence', 'run_scan', 'update_firewall',
      'query_siem', 'enrich_ioc', 'custom_api', 'wait', 'approval'],
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  parameters: mongoose.Schema.Types.Mixed,
  timeout: {
    type: Number,
    default: 300,
  },
  retry: {
    enabled: {
      type: Boolean,
      default: false,
    },
    max_attempts: {
      type: Number,
      default: 3,
    },
    delay: {
      type: Number,
      default: 5,
    },
  },
  on_error: {
    type: String,
    enum: ['fail', 'continue', 'skip'],
    default: 'fail',
  },
  condition: mongoose.Schema.Types.Mixed,
  order: {
    type: Number,
    required: true,
  },
}, { _id: false });

const TriggerConditionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['manual', 'event', 'schedule', 'api', 'webhook'],
    default: 'manual',
  },
  event_type: String,
  conditions: mongoose.Schema.Types.Mixed,
  schedule: String,
}, { _id: false });

const PlaybookSchema = new mongoose.Schema({
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
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['phishing_response', 'malware_containment', 'ransomware_response',
      'data_breach', 'ddos_mitigation', 'account_compromise',
      'vulnerability_remediation', 'threat_hunting', 'custom'],
    index: true,
  },
  version: {
    type: String,
    default: '1.0.0',
  },
  author: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft',
    index: true,
  },
  is_prebuilt: {
    type: Boolean,
    default: false,
    index: true,
  },
  trigger_conditions: TriggerConditionSchema,
  actions: [ActionSchema],
  variables: mongoose.Schema.Types.Mixed,
  approvals_required: {
    type: Boolean,
    default: false,
  },
  approval_roles: [String],
  tags: [{
    type: String,
    trim: true,
    index: true,
  }],
  mitre_attack: {
    tactics: [String],
    techniques: [String],
  },
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
  success_rate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  average_execution_time: {
    type: Number,
    default: 0,
  },
  last_executed_at: Date,
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes for performance
PlaybookSchema.index({ name: 'text', description: 'text' });
PlaybookSchema.index({ created_at: -1 });
PlaybookSchema.index({ updated_at: -1 });
PlaybookSchema.index({ category: 1, status: 1 });

// Virtual for action count
PlaybookSchema.virtual('action_count').get(function () {
  return this.actions ? this.actions.length : 0;
});

// Update success rate before save
PlaybookSchema.pre('save', function (next) {
  if (this.execution_count > 0) {
    this.success_rate = Math.round((this.success_count / this.execution_count) * 100);
  }
  next();
});

module.exports = mongoose.model('Playbook', PlaybookSchema);
