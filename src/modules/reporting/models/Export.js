/**
 * Export Data Model
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ExportSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  report_id: {
    type: String,
    required: true,
    index: true,
  },
  format: {
    type: String,
    required: true,
    enum: ['pdf', 'excel', 'csv', 'json', 'xml', 'html', 'powerpoint'],
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true,
  },
  file_url: {
    type: String,
  },
  file_size: {
    type: Number,
  },
  download_count: {
    type: Number,
    default: 0,
  },
  expires_at: {
    type: Date,
    index: true,
  },
  error_message: {
    type: String,
  },
  created_by: {
    type: String,
    required: true,
    index: true,
  },
  processing_time: {
    type: Number,
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
ExportSchema.index({ status: 1, created_at: -1 });
ExportSchema.index({ report_id: 1, format: 1 });
ExportSchema.index({ expires_at: 1 });

module.exports = mongoose.model('Export', ExportSchema);
