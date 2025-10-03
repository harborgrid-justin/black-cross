/**
 * Knowledge Base Article Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ArticleSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true,
  },
  content_format: {
    type: String,
    enum: ['markdown', 'html', 'text'],
    default: 'markdown',
  },
  category: {
    type: String,
    required: true,
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
    index: true,
  }],
  author: {
    type: String,
    required: true,
    index: true,
  },
  workspace_id: {
    type: String,
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['draft', 'in_review', 'published', 'archived'],
    default: 'draft',
    index: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  versions: [{
    version: Number,
    content: String,
    edited_by: String,
    edited_at: Date,
    change_summary: String,
  }],
  approval: {
    required: {
      type: Boolean,
      default: false,
    },
    approvers: [{
      user_id: String,
      approved: Boolean,
      approved_at: Date,
      comments: String,
    }],
  },
  views: {
    type: Number,
    default: 0,
  },
  attachments: [{
    id: {
      type: String,
      default: uuidv4,
    },
    name: String,
    url: String,
    type: String,
  }],
  metadata: mongoose.Schema.Types.Mixed,
  published_at: {
    type: Date,
    index: true,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes
ArticleSchema.index({ title: 'text', content: 'text' });
ArticleSchema.index({ category: 1, status: 1 });
ArticleSchema.index({ created_at: -1 });

module.exports = mongoose.model('Article', ArticleSchema);
