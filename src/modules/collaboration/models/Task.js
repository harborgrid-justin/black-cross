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
    trim: true,
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'blocked', 'completed', 'cancelled'],
    default: 'todo',
    index: true,
  },
  priority: {
    type: String,
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
  parent_task_id: {
    type: String,
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
    index: true,
  }],
  dependencies: [{
    task_id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked_by', 'relates_to'],
      default: 'relates_to',
    },
  }],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  estimated_hours: {
    type: Number,
    min: 0,
  },
  actual_hours: {
    type: Number,
    min: 0,
    default: 0,
  },
  checklist: [{
    item: String,
    completed: {
      type: Boolean,
      default: false,
    },
    completed_at: Date,
    completed_by: String,
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    uploaded_by: String,
    uploaded_at: Date,
  }],
  comments: [{
    user_id: String,
    content: String,
    created_at: {
      type: Date,
      default: Date.now,
    },
  }],
  watchers: [{
    type: String,
  }],
  template_id: {
    type: String,
  },
  completed_at: {
    type: Date,
  },
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes for performance
TaskSchema.index({ title: 'text', description: 'text' });
TaskSchema.index({ workspace_id: 1, status: 1 });
TaskSchema.index({ assigned_to: 1, status: 1 });
TaskSchema.index({ created_at: -1 });
TaskSchema.index({ due_date: 1 });

// Virtual for overdue status
TaskSchema.virtual('is_overdue').get(function isOverdue() {
  return this.due_date && this.due_date < new Date()
    && this.status !== 'completed' && this.status !== 'cancelled';
});

module.exports = mongoose.model('Task', TaskSchema);
