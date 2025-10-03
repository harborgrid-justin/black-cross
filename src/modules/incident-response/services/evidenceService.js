/**
 * Evidence Service
 * Evidence collection and chain of custody management
 */

const { Evidence, EvidenceType } = require('../models');
const dataStore = require('./dataStore');
const timelineService = require('./timelineService');
const { EventType } = require('../models');

class EvidenceService {
  /**
   * Collect and store evidence
   */
  async collectEvidence(data, userId) {
    const evidence = new Evidence(data);
    evidence.collected_by = userId;

    // Add initial custody entry
    evidence.addCustodyEntry(userId, 'collected', 'Evidence collected and stored');

    await dataStore.createEvidence(evidence);

    // Create timeline event
    if (data.incident_id) {
      await timelineService.createEvent({
        incident_id: data.incident_id,
        type: EventType.EVIDENCE_ADDED,
        title: 'Evidence Collected',
        description: `Evidence collected: ${evidence.name}`,
        user_id: userId,
        evidence_ids: [evidence.id],
        metadata: {
          evidence_type: evidence.type,
          evidence_id: evidence.id
        }
      });
    }

    return evidence;
  }

  /**
   * Get evidence by ID
   */
  async getEvidence(id) {
    return await dataStore.getEvidence(id);
  }

  /**
   * List evidence for incident
   */
  async listEvidenceByIncident(incidentId) {
    return await dataStore.listEvidenceByIncident(incidentId);
  }

  /**
   * Transfer evidence custody
   */
  async transferCustody(evidenceId, fromUserId, toUserId, notes = '') {
    const evidence = await dataStore.getEvidence(evidenceId);
    if (!evidence) {
      throw new Error('Evidence not found');
    }

    evidence.addCustodyEntry(fromUserId, 'transferred', `Transferred to ${toUserId}. ${notes}`);
    evidence.addCustodyEntry(toUserId, 'received', `Received from ${fromUserId}. ${notes}`);

    // In a real implementation, this would update the database
    return evidence;
  }

  /**
   * Verify evidence integrity
   */
  async verifyEvidence(evidenceId, fileData) {
    const evidence = await dataStore.getEvidence(evidenceId);
    if (!evidence) {
      throw new Error('Evidence not found');
    }

    const isValid = evidence.verifyIntegrity(fileData);
    
    if (isValid) {
      evidence.verified = true;
    }

    return {
      evidence_id: evidenceId,
      verified: isValid,
      hash: evidence.file_hash_sha256
    };
  }

  /**
   * Tag evidence
   */
  async tagEvidence(evidenceId, tags, userId) {
    const evidence = await dataStore.getEvidence(evidenceId);
    if (!evidence) {
      throw new Error('Evidence not found');
    }

    tags.forEach(tag => {
      if (!evidence.tags.includes(tag)) {
        evidence.tags.push(tag);
      }
    });

    evidence.addCustodyEntry(userId, 'tagged', `Tags added: ${tags.join(', ')}`);

    return evidence;
  }

  /**
   * Delete evidence
   */
  async deleteEvidence(evidenceId, userId, reason) {
    const evidence = await dataStore.getEvidence(evidenceId);
    if (!evidence) {
      throw new Error('Evidence not found');
    }

    // Add custody entry for deletion
    evidence.addCustodyEntry(userId, 'deleted', `Evidence deleted. Reason: ${reason}`);

    // In production, might want to soft-delete with retention policy
    await dataStore.deleteEvidence(evidenceId);

    return { success: true, message: 'Evidence deleted' };
  }

  /**
   * Get chain of custody for evidence
   */
  async getChainOfCustody(evidenceId) {
    const evidence = await dataStore.getEvidence(evidenceId);
    if (!evidence) {
      throw new Error('Evidence not found');
    }

    return {
      evidence_id: evidenceId,
      evidence_name: evidence.name,
      chain_of_custody: evidence.chain_of_custody,
      total_entries: evidence.chain_of_custody.length
    };
  }

  /**
   * Search evidence
   */
  async searchEvidence(query, filters = {}) {
    // In a real implementation, this would use database search capabilities
    const allEvidence = Array.from(dataStore.evidence.values());
    
    let results = allEvidence;

    // Text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(e => 
        e.name.toLowerCase().includes(lowerQuery) ||
        e.description.toLowerCase().includes(lowerQuery) ||
        e.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // Apply filters
    if (filters.type) {
      results = results.filter(e => e.type === filters.type);
    }

    if (filters.incidentId) {
      results = results.filter(e => e.incident_id === filters.incidentId);
    }

    if (filters.collectedBy) {
      results = results.filter(e => e.collected_by === filters.collectedBy);
    }

    if (filters.verified !== undefined) {
      results = results.filter(e => e.verified === filters.verified);
    }

    return results;
  }

  /**
   * Export evidence metadata
   */
  async exportEvidenceMetadata(evidenceId, format = 'json') {
    const evidence = await dataStore.getEvidence(evidenceId);
    if (!evidence) {
      throw new Error('Evidence not found');
    }

    const metadata = evidence.toJSON();

    if (format === 'json') {
      return JSON.stringify(metadata, null, 2);
    } else if (format === 'xml') {
      return this.convertToXML(metadata);
    }

    throw new Error('Unsupported export format');
  }

  /**
   * Convert metadata to XML format
   */
  convertToXML(metadata) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<evidence>\n';
    
    Object.entries(metadata).forEach(([key, value]) => {
      if (typeof value === 'object' && !Array.isArray(value)) {
        xml += `  <${key}>\n`;
        Object.entries(value).forEach(([k, v]) => {
          xml += `    <${k}>${v}</${k}>\n`;
        });
        xml += `  </${key}>\n`;
      } else {
        xml += `  <${key}>${value}</${key}>\n`;
      }
    });
    
    xml += '</evidence>';
    return xml;
  }

  /**
   * Get evidence statistics
   */
  async getEvidenceStats(incidentId) {
    const evidenceList = await dataStore.listEvidenceByIncident(incidentId);

    const typeDistribution = evidenceList.reduce((acc, evidence) => {
      acc[evidence.type] = (acc[evidence.type] || 0) + 1;
      return acc;
    }, {});

    const totalSize = evidenceList.reduce((sum, e) => sum + (e.file_size || 0), 0);

    return {
      total_evidence: evidenceList.length,
      type_distribution: typeDistribution,
      total_size_bytes: totalSize,
      verified_count: evidenceList.filter(e => e.verified).length,
      unverified_count: evidenceList.filter(e => !e.verified).length
    };
  }
}

module.exports = new EvidenceService();
