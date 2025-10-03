/**
 * Workspace Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const WorkspaceSchema = new mongoose.Schema({
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
    enum: ['security_operations', 'incident_response', 'threat_hunting', 'vulnerability_management', 'general'],
    default: 'general',
    index: true,
  },
  owner: {
    type: String,
    required: true,
    index: true,
  },
  members: [{
    user_id: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member',
    },
    joined_at: {
      type: Date,
      default: Date.now,
    },
  }],
  settings: {
    privacy: {
      type: String,
      enum: ['private', 'team', 'public'],
      default: 'team',
    },
    allow_guest_access: {
      type: Boolean,
      default: false,
    },
    enable_notifications: {
      type: Boolean,
      default: true,
    },
    retention_policy: {
      type: String,
      enum: ['30_days', '90_days', '1_year', 'unlimited'],
      default: 'unlimited',
    },
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'suspended'],
    default: 'active',
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  metadata: mongoose.Schema.Types.Mixed,
  archived_at: {
    type: Date,
    index: true,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes
WorkspaceSchema.index({ name: 'text', description: 'text' });
WorkspaceSchema.index({ created_at: -1 });
WorkspaceSchema.index({ 'members.user_id': 1 });

module.exports = mongoose.model('Workspace', WorkspaceSchema);
