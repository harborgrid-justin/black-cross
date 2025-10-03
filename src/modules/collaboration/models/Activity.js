/**
 * Activity Feed Data Model
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
  actor_id: {
    type: String,
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'created',
      'updated',
      'deleted',
      'assigned',
      'completed',
      'commented',
      'mentioned',
      'joined',
      'left',
      'shared',
    ],
    index: true,
  },
  entity_type: {
    type: String,
    required: true,
    enum: ['workspace', 'task', 'article', 'message', 'role', 'user'],
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
  details: mongoose.Schema.Types.Mixed,
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes
ActivitySchema.index({ workspace_id: 1, created_at: -1 });
ActivitySchema.index({ actor_id: 1, created_at: -1 });
ActivitySchema.index({ entity_type: 1, entity_id: 1 });

module.exports = mongoose.model('Activity', ActivitySchema);
