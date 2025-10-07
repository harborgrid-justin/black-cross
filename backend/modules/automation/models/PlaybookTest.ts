/**
 * Playbook Test Data Model
 */

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const TestResultSchema = new mongoose.Schema({
  test_name: String,
  status: {
    type: String,
    enum: ['passed', 'failed', 'skipped'],
  },
  message: String,
  expected: mongoose.Schema.Types.Mixed,
  actual: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const PlaybookTestSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  playbook_id: {
    type: String,
    required: true,
    index: true,
  },
  playbook_name: String,
  test_type: {
    type: String,
    enum: ['dry_run', 'simulation', 'validation', 'performance'],
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending',
    index: true,
  },
  start_time: {
    type: Date,
    default: Date.now,
  },
  end_time: Date,
  duration: Number,
  test_environment: {
    type: String,
    default: 'sandbox',
  },
  test_data: mongoose.Schema.Types.Mixed,
  results: [TestResultSchema],
  summary: {
    total_tests: {
      type: Number,
      default: 0,
    },
    passed: {
      type: Number,
      default: 0,
    },
    failed: {
      type: Number,
      default: 0,
    },
    skipped: {
      type: Number,
      default: 0,
    },
    success_rate: {
      type: Number,
      default: 0,
    },
  },
  validation_checks: [{
    check_name: String,
    passed: Boolean,
    message: String,
  }],
  performance_metrics: {
    estimated_execution_time: Number,
    resource_usage: mongoose.Schema.Types.Mixed,
    bottlenecks: [String],
  },
  recommendations: [String],
  errors: [String],
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  suppressReservedKeysWarning: true,
});

// Indexes for performance
PlaybookTestSchema.index({ playbook_id: 1, created_at: -1 });

// Calculate duration and success rate before save
PlaybookTestSchema.pre('save', function (next) {
  if (this.end_time && this.start_time) {
    this.duration = Math.round((Number(this.end_time) - Number(this.start_time)) / 1000);
  }

  if (this.summary && this.summary.total_tests > 0) {
    this.summary.success_rate = Math.round(
      (this.summary.passed / this.summary.total_tests) * 100,
    );
  }

  next();
});

export default mongoose.model('PlaybookTest', PlaybookTestSchema);

