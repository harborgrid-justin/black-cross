/**
 * Evidence Model
 * Model for evidence collection and chain of custody
 */

const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// Evidence type enum
const EvidenceType = {
  LOG_FILE: 'log_file',
  SCREENSHOT: 'screenshot',
  NETWORK_CAPTURE: 'network_capture',
  MEMORY_DUMP: 'memory_dump',
  DISK_IMAGE: 'disk_image',
  DOCUMENT: 'document',
  EMAIL: 'email',
  DATABASE_RECORD: 'database_record',
  OTHER: 'other'
};

/**
 * Evidence class for managing incident evidence
 */
class Evidence {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.incident_id = data.incident_id;
    this.type = data.type || EvidenceType.OTHER;
    this.name = data.name || '';
    this.description = data.description || '';
    this.file_path = data.file_path || null;
    this.file_size = data.file_size || 0;
    this.file_hash_md5 = data.file_hash_md5 || null;
    this.file_hash_sha256 = data.file_hash_sha256 || null;
    this.collected_at = data.collected_at || new Date();
    this.collected_by = data.collected_by;
    this.source = data.source || '';
    this.tags = data.tags || [];
    this.metadata = data.metadata || {};
    this.chain_of_custody = data.chain_of_custody || [];
    this.verified = data.verified || false;
    this.created_at = data.created_at || new Date();
  }

  /**
   * Add chain of custody entry
   */
  addCustodyEntry(user_id, action, notes = '') {
    this.chain_of_custody.push({
      timestamp: new Date(),
      user_id,
      action,
      notes
    });
  }

  /**
   * Calculate file hash
   */
  static calculateHash(data, algorithm = 'sha256') {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  /**
   * Verify evidence integrity
   */
  verifyIntegrity(data) {
    if (this.file_hash_sha256) {
      const currentHash = Evidence.calculateHash(data, 'sha256');
      return currentHash === this.file_hash_sha256;
    }
    return false;
  }

  toJSON() {
    return {
      id: this.id,
      incident_id: this.incident_id,
      type: this.type,
      name: this.name,
      description: this.description,
      file_path: this.file_path,
      file_size: this.file_size,
      file_hash_md5: this.file_hash_md5,
      file_hash_sha256: this.file_hash_sha256,
      collected_at: this.collected_at,
      collected_by: this.collected_by,
      source: this.source,
      tags: this.tags,
      metadata: this.metadata,
      chain_of_custody: this.chain_of_custody,
      verified: this.verified,
      created_at: this.created_at
    };
  }
}

module.exports = {
  Evidence,
  EvidenceType
};
