/**
 * Collaboration Session Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const CollaborationSessionSchema = new mongoose.Schema({
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
  resource_type: {
    type: String,
    enum: ['document', 'task', 'incident', 'whiteboard', 'general'],
    required: true,
  },
  resource_id: {
    type: String,
    required: true,
    index: true,
  },
  participants: [{
    user_id: {
      type: String,
      required: true,
    },
    joined_at: {
      type: Date,
      default: Date.now,
    },
    left_at: {
      type: Date,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    cursor_position: mongoose.Schema.Types.Mixed,
    current_selection: mongoose.Schema.Types.Mixed,
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'ended'],
    default: 'active',
    index: true,
  },
  session_type: {
    type: String,
    enum: ['editing', 'viewing', 'meeting', 'screen-sharing'],
    default: 'editing',
  },
  changes: [{
    user_id: String,
    timestamp: Date,
    operation: String,
    data: mongoose.Schema.Types.Mixed,
  }],
  metadata: {
    screen_sharing_active: Boolean,
    video_conference_url: String,
    last_activity_at: Date,
  },
  ended_at: {
    type: Date,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes for performance
CollaborationSessionSchema.index({ workspace_id: 1, status: 1 });
CollaborationSessionSchema.index({ resource_type: 1, resource_id: 1 });
CollaborationSessionSchema.index({ 'participants.user_id': 1 });

module.exports = mongoose.model('CollaborationSession', CollaborationSessionSchema);
