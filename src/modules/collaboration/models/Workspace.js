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
    enum: ['security-operations', 'incident-response', 'threat-hunting', 'vulnerability-management', 'general'],
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
    is_private: {
      type: Boolean,
      default: false,
    },
    allow_external_sharing: {
      type: Boolean,
      default: false,
    },
    notification_level: {
      type: String,
      enum: ['all', 'important', 'none'],
      default: 'important',
    },
    default_permissions: {
      type: Map,
      of: Boolean,
    },
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'suspended'],
    default: 'active',
    index: true,
  },
  template_id: {
    type: String,
  },
  analytics: {
    member_count: {
      type: Number,
      default: 0,
    },
    task_count: {
      type: Number,
      default: 0,
    },
    message_count: {
      type: Number,
      default: 0,
    },
    last_activity_at: {
      type: Date,
    },
  },
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes for performance
WorkspaceSchema.index({ name: 'text', description: 'text' });
WorkspaceSchema.index({ 'members.user_id': 1 });
WorkspaceSchema.index({ created_at: -1 });

module.exports = mongoose.model('Workspace', WorkspaceSchema);
