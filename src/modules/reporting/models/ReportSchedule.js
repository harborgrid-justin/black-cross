/**
 * Report Schedule Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ReportScheduleSchema = new mongoose.Schema({
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
  template_id: {
    type: String,
    required: true,
    index: true,
  },
  schedule: {
    type: String,
    required: true,
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  format: {
    type: String,
    required: true,
    enum: ['pdf', 'excel', 'csv', 'json', 'xml', 'html', 'powerpoint'],
    default: 'pdf',
  },
  recipients: [{
    type: String,
    email: String,
    user_id: String,
    delivery_method: {
      type: String,
      enum: ['email', 'webhook', 'storage', 'ftp'],
      default: 'email',
    },
  }],
  conditions: {
    enabled: Boolean,
    rules: mongoose.Schema.Types.Mixed,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  last_execution: {
    date: Date,
    status: String,
    report_id: String,
  },
  next_execution: {
    type: Date,
    index: true,
  },
  execution_count: {
    type: Number,
    default: 0,
  },
  failure_count: {
    type: Number,
    default: 0,
  },
  created_by: {
    type: String,
    required: true,
    index: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes for performance
ReportScheduleSchema.index({ enabled: 1, next_execution: 1 });
ReportScheduleSchema.index({ created_at: -1 });

module.exports = mongoose.model('ReportSchedule', ReportScheduleSchema);
