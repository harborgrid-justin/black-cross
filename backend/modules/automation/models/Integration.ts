/**
 * Integration Data Model
 */

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const IntegrationSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: ['edr', 'xdr', 'firewall', 'siem', 'email_gateway', 'identity',
      'cloud', 'network', 'ticketing', 'communication', 'custom'],
    index: true,
  },
  vendor: {
    type: String,
    required: true,
  },
  description: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'error', 'testing'],
    default: 'inactive',
    index: true,
  },
  configuration: {
    endpoint: String,
    api_version: String,
    authentication: {
      type: {
        type: String,
        enum: ['api_key', 'oauth2', 'basic', 'token', 'certificate'],
      },
      credentials_ref: String,
    },
    timeout: {
      type: Number,
      default: 30,
    },
    retry: {
      enabled: Boolean,
      max_attempts: Number,
    },
  },
  capabilities: [{
    action: String,
    endpoint: String,
    method: String,
    parameters: mongoose.Schema.Types.Mixed,
  }],
  health_check: {
    endpoint: String,
    interval: Number,
    last_check: Date,
    status: String,
    message: String,
  },
  usage_stats: {
    total_calls: {
      type: Number,
      default: 0,
    },
    successful_calls: {
      type: Number,
      default: 0,
    },
    failed_calls: {
      type: Number,
      default: 0,
    },
    average_response_time: {
      type: Number,
      default: 0,
    },
    last_used: Date,
  },
  rate_limits: {
    calls_per_minute: Number,
    calls_per_hour: Number,
    calls_per_day: Number,
  },
  tags: [String],
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes for performance
IntegrationSchema.index({ type: 1, status: 1 });
IntegrationSchema.index({ vendor: 1 });
IntegrationSchema.index({ created_at: -1 });

export default mongoose.model('Integration', IntegrationSchema);
