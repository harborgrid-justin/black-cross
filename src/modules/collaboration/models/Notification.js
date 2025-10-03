/**
 * Notification Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const NotificationSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  user_id: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'task_assigned',
      'task_updated',
      'task_completed',
      'mention',
      'comment',
      'workspace_invite',
      'message',
      'activity',
    ],
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  entity_type: {
    type: String,
    enum: ['workspace', 'task', 'article', 'message', 'role', 'user'],
  },
  entity_id: {
    type: String,
    index: true,
  },
  actor_id: {
    type: String,
    index: true,
  },
  read: {
    type: Boolean,
    default: false,
    index: true,
  },
  read_at: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
    index: true,
  },
  channels: [{
    type: String,
    enum: ['in_app', 'email', 'sms', 'push'],
  }],
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes
NotificationSchema.index({ user_id: 1, created_at: -1 });
NotificationSchema.index({ user_id: 1, read: 1 });

const NotificationPreferenceSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  preferences: {
    task_assigned: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['in_app', 'email', 'sms', 'push'] }],
    },
    task_updated: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['in_app', 'email', 'sms', 'push'] }],
    },
    task_completed: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['in_app', 'email', 'sms', 'push'] }],
    },
    mention: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['in_app', 'email', 'sms', 'push'] }],
    },
    comment: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['in_app', 'email', 'sms', 'push'] }],
    },
    workspace_invite: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['in_app', 'email', 'sms', 'push'] }],
    },
    message: {
      enabled: { type: Boolean, default: true },
      channels: [{ type: String, enum: ['in_app', 'email', 'sms', 'push'] }],
    },
    activity: {
      enabled: { type: Boolean, default: false },
      channels: [{ type: String, enum: ['in_app', 'email', 'sms', 'push'] }],
    },
  },
  do_not_disturb: {
    enabled: { type: Boolean, default: false },
    start_time: String,
    end_time: String,
  },
  digest: {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

const Notification = mongoose.model('Notification', NotificationSchema);
const NotificationPreference = mongoose.model('NotificationPreference', NotificationPreferenceSchema);

module.exports = { Notification, NotificationPreference };
