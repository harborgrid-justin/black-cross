const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ThreatActorSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true, index: true },
  name: { type: String, required: true, index: true },
  aliases: [String],
  description: String,
  type: { type: String, enum: ['nation_state', 'cybercrime', 'hacktivist', 'insider', 'unknown'], required: true },
  sophistication: { type: String, enum: ['novice', 'intermediate', 'advanced', 'expert'] },
  motivation: [{ type: String, enum: ['financial', 'espionage', 'sabotage', 'ideology', 'reputation'] }],
  ttps: [{
    tactic: String,
    technique: String,
    mitre_id: String,
    description: String,
  }],
  campaigns: [{
    campaign_id: String,
    name: String,
    start_date: Date,
    end_date: Date,
    targets: [String],
  }],
  target_sectors: [String],
  target_countries: [String],
  capabilities: {
    technical: { type: String, enum: ['low', 'medium', 'high'] },
    operational: { type: String, enum: ['low', 'medium', 'high'] },
    resources: { type: String, enum: ['low', 'medium', 'high'] },
  },
  relationships: [{
    actor_id: String,
    relationship_type: { type: String, enum: ['affiliated', 'collaborates', 'competitor', 'unknown'] },
  }],
  known_tools: [String],
  known_malware: [String],
  iocs: [String],
  status: { type: String, enum: ['active', 'dormant', 'retired'], default: 'active' },
  first_seen: Date,
  last_seen: Date,
  attribution_confidence: { type: Number, min: 0, max: 100 },
  tags: [String],
  references: [String],
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

ThreatActorSchema.index({ type: 1, status: 1 });
ThreatActorSchema.index({ target_sectors: 1 });

module.exports = mongoose.model('ThreatActor', ThreatActorSchema);
