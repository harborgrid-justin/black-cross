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
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'execute', 'manage'],
    }],
    scope: {
      type: String,
      enum: ['global', 'workspace', 'own'],
      default: 'workspace',
    },
  }],
  parent_role_id: {
    type: String,
    index: true,
  },
  workspace_id: {
    type: String,
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true,
  },
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes
RoleSchema.index({ name: 1, workspace_id: 1 }, { unique: true });

module.exports = mongoose.model('Role', RoleSchema);
