const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const SiemEventSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true, index: true },
  name: { type: String, required: true },
  description: String,
  status: { type: String, default: 'active' },
  tags: [String],
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('SiemEvent', SiemEventSchema);
