/**
 * Message Data Model for Secure Chat
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const MessageSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  channel_id: {
    type: String,
    required: true,
    index: true,
  },
  sender_id: {
    type: String,
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  content_type: {
    type: String,
    enum: ['text', 'code', 'file', 'system'],
    default: 'text',
  },
  encrypted: {
    type: Boolean,
    default: true,
  },
  thread_id: {
    type: String,
    index: true,
  },
  mentions: [{
    type: String,
  }],
  attachments: [{
    id: {
      type: String,
      default: uuidv4,
    },
    name: String,
    url: String,
    type: String,
    size: Number,
  }],
  reactions: [{
    emoji: String,
    user_id: String,
    created_at: {
      type: Date,
      default: Date.now,
    },
  }],
  edited: {
    type: Boolean,
    default: false,
  },
  edited_at: {
    type: Date,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  deleted_at: {
    type: Date,
  },
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes
MessageSchema.index({ channel_id: 1, created_at: -1 });
MessageSchema.index({ sender_id: 1 });
MessageSchema.index({ thread_id: 1 });
MessageSchema.index({ content: 'text' });

const ChannelSchema = new mongoose.Schema({
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
    enum: ['direct', 'group', 'public', 'private'],
    default: 'group',
    index: true,
  },
  workspace_id: {
    type: String,
    required: true,
    index: true,
  },
  members: [{
    user_id: String,
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
    joined_at: {
      type: Date,
      default: Date.now,
    },
  }],
  settings: {
    encryption_enabled: {
      type: Boolean,
      default: true,
    },
    retention_days: {
      type: Number,
      default: 0,
    },
  },
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

ChannelSchema.index({ workspace_id: 1 });
ChannelSchema.index({ 'members.user_id': 1 });

const Message = mongoose.model('Message', MessageSchema);
const Channel = mongoose.model('Channel', ChannelSchema);

module.exports = { Message, Channel };
