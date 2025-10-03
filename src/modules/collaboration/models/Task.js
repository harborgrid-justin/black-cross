/**
 * Task Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const TaskSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['todo', 'in_progress', 'in_review', 'blocked', 'completed', 'cancelled'],
    default: 'todo',
    index: true,
  },
  priority: {
    type: String,
    required: true,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium',
    index: true,
  },
  assigned_to: {
    type: String,
    index: true,
  },
  created_by: {
    type: String,
    required: true,
    index: true,
  },
  due_date: {
    type: Date,
    index: true,
  },
  workspace_id: {
    type: String,
    required: true,
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  dependencies: [{
    task_id: {
      type: String,
      required: true,
    },
    dependency_type: {
      type: String,
      enum: ['blocks', 'blocked_by', 'related_to'],
      default: 'blocks',
    },
  }],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  subtasks: [{
    id: {
      type: String,
      default: uuidv4,
    },
    title: String,
    completed: {
      type: Boolean,
      default: false,
    },
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
    uploaded_at: {
      type: Date,
      default: Date.now,
    },
  }],
  comments: [{
    id: {
      type: String,
      default: uuidv4,
    },
    user_id: String,
    content: String,
    created_at: {
      type: Date,
      default: Date.now,
    },
  }],
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes
TaskSchema.index({ title: 'text', description: 'text' });
TaskSchema.index({ created_at: -1 });
TaskSchema.index({ due_date: 1 });
TaskSchema.index({ workspace_id: 1, status: 1 });

module.exports = mongoose.model('Task', TaskSchema);
