import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ComplianceFrameworkSchema = new mongoose.Schema({
  id: {
    type: String, default: uuidv4, unique: true, index: true,
  },
  name: { type: String, required: true },
  description: String,
  status: { type: String, default: 'active' },
  tags: [String],
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('ComplianceFramework', ComplianceFrameworkSchema);
