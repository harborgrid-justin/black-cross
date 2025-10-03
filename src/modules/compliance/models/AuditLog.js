/**
 * Audit Log Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const AuditLogSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true,
  },
  user_id: {
    type: String,
    required: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'execute', 'approve', 'reject',
      'login', 'logout', 'access', 'export', 'import', 'configure'],
    index: true,
  },
  resource_type: {
    type: String,
    required: true,
    index: true,
  },
  resource_id: {
    type: String,
    required: true,
    index: true,
  },
  details: {
    type: String,
    required: true,
  },
  ip_address: {
    type: String,
  },
  user_agent: {
    type: String,
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'pending'],
    default: 'success',
    index: true,
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    default: 'info',
    index: true,
  },
  changes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: false,
  collection: 'audit_logs',
});

// Indexes for efficient queries
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ user_id: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ resource_type: 1, resource_id: 1 });
AuditLogSchema.index({ status: 1, severity: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
