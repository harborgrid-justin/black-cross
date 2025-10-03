/**
 * Real-Time Collaboration Session Data Model
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
  entity_type: {
    type: String,
    required: true,
    enum: ['article', 'task', 'document', 'whiteboard'],
    index: true,
  },
  entity_id: {
    type: String,
    required: true,
    index: true,
  },
  workspace_id: {
    type: String,
    required: true,
    index: true,
  },
  participants: [{
    user_id: {
      type: String,
      required: true,
    },
    socket_id: String,
    cursor_position: mongoose.Schema.Types.Mixed,
    selection: mongoose.Schema.Types.Mixed,
    joined_at: {
      type: Date,
      default: Date.now,
    },
    last_active: {
      type: Date,
      default: Date.now,
    },
  }],
  status: {
    type: String,
    enum: ['active', 'paused', 'ended'],
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
CollaborationSessionSchema.index({ entity_type: 1, entity_id: 1 });
CollaborationSessionSchema.index({ workspace_id: 1, status: 1 });
CollaborationSessionSchema.index({ 'participants.user_id': 1 });

module.exports = mongoose.model('CollaborationSession', CollaborationSessionSchema);
