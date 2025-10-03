/**
 * Knowledge Article Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const KnowledgeArticleSchema = new mongoose.Schema({
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
  summary: {
    type: String,
    trim: true,
  },
  format: {
    type: String,
    enum: ['markdown', 'html', 'plain'],
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
  author_id: {
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
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft',
    index: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  version_history: [{
    version: Number,
    content: String,
    edited_by: String,
    edited_at: Date,
    change_summary: String,
  }],
  related_articles: [{
    article_id: String,
    relationship: String,
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    uploaded_by: String,
    uploaded_at: Date,
  }],
  approval_workflow: {
    required: {
      type: Boolean,
      default: false,
    },
    approvers: [{
      user_id: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
      },
      comment: String,
      timestamp: Date,
    }],
  },
  access_control: {
    visibility: {
      type: String,
      enum: ['public', 'workspace', 'restricted'],
      default: 'workspace',
    },
    allowed_users: [String],
    allowed_roles: [String],
  },
  analytics: {
    view_count: {
      type: Number,
      default: 0,
    },
    helpful_count: {
      type: Number,
      default: 0,
    },
    last_viewed_at: Date,
  },
  external_links: [{
    title: String,
    url: String,
  }],
  template_id: {
    type: String,
  },
  published_at: {
    type: Date,
  },
  archived_at: {
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
KnowledgeArticleSchema.index({ title: 'text', content: 'text', summary: 'text' });
KnowledgeArticleSchema.index({ workspace_id: 1, status: 1 });
KnowledgeArticleSchema.index({ category: 1, status: 1 });
KnowledgeArticleSchema.index({ author_id: 1 });
KnowledgeArticleSchema.index({ created_at: -1 });

module.exports = mongoose.model('KnowledgeArticle', KnowledgeArticleSchema);
