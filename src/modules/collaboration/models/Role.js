/**
 * Role Data Model for RBAC
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const RoleSchema = new mongoose.Schema({
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
    enum: ['system', 'custom'],
    default: 'custom',
    index: true,
  },
  permissions: [{
    resource: {
      type: String,
      required: true,
      enum: ['workspace', 'task', 'message', 'kb_article', 'user', 'role', 'activity', 'all'],
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'execute', 'share', 'admin'],
    }],
    conditions: mongoose.Schema.Types.Mixed,
  }],
  hierarchy_level: {
    type: Number,
    default: 0,
  },
  parent_role_id: {
    type: String,
  },
  inherits_from: [{
    type: String,
  }],
  workspace_id: {
    type: String,
    index: true,
  },
  is_active: {
    type: Boolean,
    default: true,
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
RoleSchema.index({ name: 1, workspace_id: 1 });
RoleSchema.index({ type: 1, is_active: 1 });

module.exports = mongoose.model('Role', RoleSchema);
