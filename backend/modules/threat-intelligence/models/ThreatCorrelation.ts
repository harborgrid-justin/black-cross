/**
 * Threat Correlation Data Model
 */

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ThreatCorrelationSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    index: true,
  },
  threat_id_1: {
    type: String,
    required: true,
    index: true,
  },
  threat_id_2: {
    type: String,
    required: true,
    index: true,
  },
  correlation_type: {
    type: String,
    required: true,
    enum: ['ioc_overlap', 'temporal', 'infrastructure', 'campaign', 'behavioral', 'victim_profile'],
    index: true,
  },
  similarity_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 50,
  },
  evidence: [{
    type: {
      type: String,
      enum: ['shared_ioc', 'timing_pattern', 'infrastructure_overlap', 'tactic_similarity', 'target_overlap'],
    },
    description: String,
    weight: Number,
    data: mongoose.Schema.Types.Mixed,
  }],
  algorithm: {
    name: String,
    version: String,
    parameters: mongoose.Schema.Types.Mixed,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'investigating'],
    default: 'pending',
    index: true,
  },
  reviewed_by: String,
  reviewed_at: Date,
  notes: String,
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Compound indexes
ThreatCorrelationSchema.index({ threat_id_1: 1, threat_id_2: 1 }, { unique: true });
ThreatCorrelationSchema.index({ similarity_score: -1 });
ThreatCorrelationSchema.index({ created_at: -1 });

export default mongoose.model('ThreatCorrelation', ThreatCorrelationSchema);
