import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const IoCSchema = new mongoose.Schema({
  id: {
    type: String, default: uuidv4, unique: true, index: true,
  },
  value: { type: String, required: true, index: true },
  type: {
    type: String,
    enum: [
      'ip', 'domain', 'url', 'hash_md5', 'hash_sha1', 'hash_sha256',
      'email', 'file_name', 'registry_key', 'mutex',
    ],
    required: true,
    index: true,
  },
  confidence: {
    type: Number, min: 0, max: 100, default: 50,
  },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: {
    type: String, enum: ['active', 'expired', 'whitelisted', 'false_positive'], default: 'active', index: true,
  },
  source: { type: String, required: true },
  first_seen: { type: Date, default: Date.now },
  last_seen: Date,
  expiration_date: Date,
  threat_types: [String],
  related_threats: [String],
  related_campaigns: [String],
  mitre_techniques: [String],
  enrichment: {
    geolocation: {
      country: String,
      city: String,
      asn: String,
    },
    reputation_score: Number,
    whois: mongoose.Schema.Types.Mixed,
    dns_records: [mongoose.Schema.Types.Mixed],
  },
  context: String,
  tags: [String],
  validation: {
    validated: Boolean,
    validation_date: Date,
    validator: String,
  },
  hits: { type: Number, default: 0 },
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

IoCSchema.index({ type: 1, status: 1 });
IoCSchema.index({ value: 1, type: 1 }, { unique: true });
IoCSchema.index({ first_seen: -1 });

export default mongoose.model('IoC', IoCSchema);
