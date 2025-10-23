/**
 * Taxonomy Data Model
 */

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const TaxonomySchema = new mongoose.Schema({
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
    unique: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0',
  },
  type: {
    type: String,
    required: true,
    enum: ['category', 'framework', 'custom'],
    default: 'custom',
  },
  parent_id: {
    type: String,
    default: null,
    index: true,
  },
  hierarchy: [{
    level: Number,
    name: String,
    id: String,
  }],
  categories: [{
    id: {
      type: String,
      default: uuidv4,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    level: {
      type: Number,
      default: 1,
    },
    parent_category_id: String,
    children: [String],
    attributes: mongoose.Schema.Types.Mixed,
  }],
  mappings: [{
    framework: {
      type: String,
      enum: ['mitre_attack', 'kill_chain', 'diamond_model', 'stix', 'veris'],
    },
    external_id: String,
    mapping_type: {
      type: String,
      enum: ['exact', 'similar', 'related', 'broader', 'narrower'],
    },
  }],
  tags: [String],
  is_active: {
    type: Boolean,
    default: true,
  },
  is_default: {
    type: Boolean,
    default: false,
  },
  created_by: {
    type: String,
    required: true,
  },
  updated_by: String,
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

// Indexes
TaxonomySchema.index({ name: 'text', description: 'text' });
TaxonomySchema.index({ is_active: 1, is_default: 1 });

export default mongoose.model('Taxonomy', TaxonomySchema);
