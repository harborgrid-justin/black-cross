import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ThreatFeedSchema = new mongoose.Schema({
  id: {
    type: String, default: uuidv4, unique: true, index: true,
  },
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['commercial', 'open_source', 'community', 'custom', 'government', 'industry'] },
  format: { type: String, enum: ['rss', 'json', 'xml', 'stix', 'taxii', 'csv', 'txt', 'api'] },
  url: String,
  status: { type: String, default: 'active', enum: ['active', 'paused', 'error', 'deprecated'] },
  enabled: { type: Boolean, default: true },
  reliability: {
    score: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    falsePositiveRate: { type: Number, default: 0 },
    lastAssessed: Date,
    historicalPerformance: [mongoose.Schema.Types.Mixed],
    adjustmentFactors: mongoose.Schema.Types.Mixed,
  },
  schedule: {
    enabled: { type: Boolean, default: true },
    frequency: { type: String, enum: ['realtime', 'hourly', 'daily', 'weekly', 'custom'] },
    interval: Number,
    nextRun: Date,
    timezone: { type: String, default: 'UTC' },
  },
  authentication: {
    type: { type: String, enum: ['api_key', 'basic', 'bearer', 'oauth', 'certificate', 'none'] },
    credentials: mongoose.Schema.Types.Mixed,
    headers: mongoose.Schema.Types.Mixed,
  },
  parser: {
    format: { type: String, enum: ['rss', 'json', 'xml', 'stix', 'taxii', 'csv', 'txt', 'api'] },
    mapping: mongoose.Schema.Types.Mixed,
    filters: [mongoose.Schema.Types.Mixed],
    transformation: [mongoose.Schema.Types.Mixed],
    validation: [mongoose.Schema.Types.Mixed],
  },
  last_fetched: Date,
  last_success: Date,
  last_error: String,
  total_indicators: { type: Number, default: 0 },
  indicator_types: [{ type: String, enum: ['ip', 'domain', 'url', 'hash', 'email', 'file', 'registry', 'mutex', 'asn'] }],
  threat_types: [{ type: String, enum: ['malware', 'phishing', 'ransomware', 'botnet', 'apt', 'vulnerability', 'exploit'] }],
  tags: [String],
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('ThreatFeed', ThreatFeedSchema);

