/**
 * ForensicSession Model
 * 
 * Represents a forensic investigation session
 */

const { v4: uuidv4 } = require('uuid');

class ForensicSession {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.description = data.description || '';
    this.investigator = data.investigator || null;
    this.status = data.status || 'active'; // active, completed, archived
    this.incident_id = data.incident_id || null;
    this.alert_ids = data.alert_ids || [];
    this.event_ids = data.event_ids || [];
    this.queries = data.queries || [];
    this.findings = data.findings || [];
    this.evidence = data.evidence || [];
    this.timeline = data.timeline || [];
    this.tags = data.tags || [];
    this.chain_of_custody = data.chain_of_custody || [];
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
    this.completed_at = data.completed_at || null;
  }

  /**
   * Add query to session
   */
  addQuery(query, results) {
    this.queries.push({
      id: uuidv4(),
      query: query,
      results_count: results.length,
      executed_at: new Date()
    });
    this.updated_at = new Date();
  }

  /**
   * Add finding
   */
  addFinding(finding) {
    this.findings.push({
      id: uuidv4(),
      ...finding,
      added_at: new Date()
    });
    this.updated_at = new Date();
  }

  /**
   * Add evidence
   */
  addEvidence(evidence, collector) {
    const evidenceItem = {
      id: uuidv4(),
      ...evidence,
      collected_by: collector,
      collected_at: new Date()
    };
    
    this.evidence.push(evidenceItem);
    this.chain_of_custody.push({
      evidence_id: evidenceItem.id,
      action: 'collected',
      user: collector,
      timestamp: new Date()
    });
    this.updated_at = new Date();
  }

  /**
   * Add timeline event
   */
  addTimelineEvent(event) {
    this.timeline.push({
      id: uuidv4(),
      ...event,
      added_at: new Date()
    });
    this.timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    this.updated_at = new Date();
  }

  /**
   * Complete session
   */
  complete() {
    this.status = 'completed';
    this.completed_at = new Date();
    this.updated_at = new Date();
  }

  /**
   * Convert to plain object for storage/API
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      investigator: this.investigator,
      status: this.status,
      incident_id: this.incident_id,
      alert_ids: this.alert_ids,
      event_ids: this.event_ids,
      queries: this.queries,
      findings: this.findings,
      evidence: this.evidence,
      timeline: this.timeline,
      tags: this.tags,
      chain_of_custody: this.chain_of_custody,
      created_at: this.created_at,
      updated_at: this.updated_at,
      completed_at: this.completed_at
    };
  }
}

module.exports = ForensicSession;
