/**
 * Activity Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ActivitySchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  workspace_id: {
    type: String,
    required: true,
    index: true,
  },
  actor_id: {
    type: String,
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'workspace.created', 'workspace.updated', 'workspace.deleted',
      'task.created', 'task.updated', 'task.completed', 'task.assigned',
      'message.sent', 'message.deleted',
      'kb.article.created', 'kb.article.updated', 'kb.article.published',
      'user.joined', 'user.left', 'user.role.changed',
      'session.started', 'session.ended',
      'file.uploaded', 'file.shared',
    ],
    index: true,
  },
  resource_type: {
    type: String,
    required: true,
    enum: ['workspace', 'task', 'message', 'kb_article', 'user', 'session', 'file', 'role'],
    index: true,
  },
  resource_id: {
    type: String,
    required: true,
    index: true,
  },
  details: {
    old_value: mongoose.Schema.Types.Mixed,
    new_value: mongoose.Schema.Types.Mixed,
    changes: mongoose.Schema.Types.Mixed,
  },
  notification_sent: {
    type: Boolean,
    default: false,
  },
  notification_channels: [{
    type: String,
    enum: ['in-app', 'email', 'sms', 'push', 'webhook'],
  }],
  recipients: [{
    user_id: String,
    read: {
      type: Boolean,
      default: false,
    },
    read_at: Date,
  }],
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes for performance
ActivitySchema.index({ workspace_id: 1, created_at: -1 });
ActivitySchema.index({ actor_id: 1, created_at: -1 });
ActivitySchema.index({ action: 1, created_at: -1 });
ActivitySchema.index({ resource_type: 1, resource_id: 1 });
ActivitySchema.index({ 'recipients.user_id': 1, 'recipients.read': 1 });
ActivitySchema.index({ created_at: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
