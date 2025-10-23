/**
 * Incident Data Model
 * Tracks security incidents from detection to resolution
 */

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const TimelineEventSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  event_type: {
    type: String,
    enum: [
      'created', 'updated', 'assigned', 'escalated', 'resolved', 'closed',
      'reopened', 'comment', 'evidence_added', 'workflow_executed',
    ],
    required: true,
  },
  description: String,
  user_id: String,
  metadata: mongoose.Schema.Types.Mixed,
});

const EvidenceSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
  },
  type: {
    type: String,
    enum: ['file', 'log', 'screenshot', 'pcap', 'memory_dump', 'disk_image', 'network_traffic', 'other'],
    required: true,
  },
  file_path: String,
  file_size: Number,
  hash: {
    md5: String,
    sha1: String,
    sha256: String,
  },
  description: String,
  collected_by: String,
  collected_at: {
    type: Date,
    default: Date.now,
  },
  chain_of_custody: [{
    action: String,
    user_id: String,
    timestamp: Date,
  }],
  metadata: mongoose.Schema.Types.Mixed,
});

const IncidentSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  ticket_number: {
    type: String,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['new', 'investigating', 'contained', 'eradicated', 'recovering', 'resolved', 'closed'],
    default: 'new',
    index: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true,
  },
  priority_score: {
    type: Number,
    min: 0,
    max: 100,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true,
  },
  category: {
    type: String,
    enum: [
      'malware', 'phishing', 'data_breach', 'ddos',
      'unauthorized_access', 'insider_threat', 'ransomware', 'other',
    ],
    required: true,
    index: true,
  },
  assigned_to: {
    type: String,
    index: true,
  },
  reported_by: {
    type: String,
    required: true,
  },
  affected_assets: [{
    asset_id: String,
    asset_name: String,
    asset_type: String,
    criticality: String,
  }],
  related_threats: [{
    threat_id: String,
    threat_name: String,
    relevance: Number,
  }],
  related_iocs: [{
    ioc_id: String,
    ioc_value: String,
    ioc_type: String,
  }],
  timeline: [TimelineEventSchema],
  evidence: [EvidenceSchema],
  sla: {
    response_time: Number, // minutes
    resolution_time: Number, // minutes
    response_deadline: Date,
    resolution_deadline: Date,
    breached: {
      type: Boolean,
      default: false,
    },
  },
  response_actions: [{
    action_id: String,
    action_type: String,
    description: String,
    status: String,
    executed_at: Date,
    executed_by: String,
  }],
  post_mortem: {
    created: {
      type: Boolean,
      default: false,
    },
    root_cause: String,
    lessons_learned: [String],
    recommendations: [String],
    created_by: String,
    created_at: Date,
  },
  communications: [{
    channel: String,
    recipient: String,
    message: String,
    sent_at: Date,
    sent_by: String,
  }],
  tags: [String],
  resolved_at: Date,
  closed_at: Date,
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Auto-generate ticket number
IncidentSchema.pre('save', async function saveMiddleware(next) {
  if (!this.ticket_number) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const Model = this.constructor as any;
    const count = await Model.countDocuments({
      created_at: {
        $gte: new Date(year, date.getMonth(), 1),
        $lt: new Date(year, date.getMonth() + 1, 1),
      },
    });
    this.ticket_number = `INC-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Indexes for performance
IncidentSchema.index({ status: 1, priority: 1 });
IncidentSchema.index({ created_at: -1 });
IncidentSchema.index({ assigned_to: 1, status: 1 });
IncidentSchema.index({ category: 1, severity: 1 });
IncidentSchema.index({ 'sla.response_deadline': 1 });
IncidentSchema.index({ 'sla.resolution_deadline': 1 });

export default mongoose.model('Incident', IncidentSchema);
