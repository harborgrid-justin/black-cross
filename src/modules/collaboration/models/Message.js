/**
 * Message Data Model
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
  workspace_id: {
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
  type: {
    type: String,
    enum: ['text', 'file', 'code', 'system', 'thread'],
    default: 'text',
  },
  thread_id: {
    type: String,
    index: true,
  },
  parent_message_id: {
    type: String,
    index: true,
  },
  mentions: [{
    user_id: String,
    mention_type: {
      type: String,
      enum: ['user', 'channel', 'all'],
    },
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mime_type: String,
    is_encrypted: {
      type: Boolean,
      default: true,
    },
  }],
  reactions: [{
    user_id: String,
    emoji: String,
    created_at: {
      type: Date,
      default: Date.now,
    },
  }],
  is_encrypted: {
    type: Boolean,
    default: true,
  },
  encryption_key_id: {
    type: String,
  },
  is_edited: {
    type: Boolean,
    default: false,
  },
  edited_at: {
    type: Date,
  },
  is_deleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deleted_at: {
    type: Date,
  },
  read_by: [{
    user_id: String,
    read_at: {
      type: Date,
      default: Date.now,
    },
  }],
  pinned: {
    type: Boolean,
    default: false,
  },
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes for performance
MessageSchema.index({ channel_id: 1, created_at: -1 });
MessageSchema.index({ workspace_id: 1, created_at: -1 });
MessageSchema.index({ sender_id: 1, created_at: -1 });
MessageSchema.index({ thread_id: 1, created_at: -1 });
MessageSchema.index({ content: 'text' });
MessageSchema.index({ is_deleted: 1 });

module.exports = mongoose.model('Message', MessageSchema);
