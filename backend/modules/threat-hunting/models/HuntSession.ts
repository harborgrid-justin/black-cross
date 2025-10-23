/**
 * Hunt Session Data Model
 */
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const FindingSchema = new mongoose.Schema({
  finding_id: { type: String, default: uuidv4 },
  title: String,
  description: String,
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  confidence: Number,
  evidence: [String],
  iocs: [mongoose.Schema.Types.Mixed],
  mitre_techniques: [String],
  discovered_at: { type: Date, default: Date.now },
});

const HuntSessionSchema = new mongoose.Schema({
  id: {
    type: String, default: uuidv4, unique: true, index: true,
  },
  name: { type: String, required: true },
  hypothesis: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['planning', 'active', 'completed', 'archived'], default: 'planning' },
  query: mongoose.Schema.Types.Mixed,
  findings: [FindingSchema],
  participants: [String],
  lead_hunter: String,
  tags: [String],
  data_sources: [String],
  time_range: {
    start: Date,
    end: Date,
  },
  started_at: Date,
  completed_at: Date,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('HuntSession', HuntSessionSchema);
