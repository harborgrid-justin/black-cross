/**
 * SecurityEvent Model
 * 
 * Represents a normalized security event from various log sources
 */

const { v4: uuidv4 } = require('uuid');

class SecurityEvent {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.timestamp = data.timestamp || new Date();
    this.source = data.source || '';
    this.source_type = data.source_type || 'generic'; // firewall, ids, server, application, etc.
    this.event_type = data.event_type || '';
    this.severity = data.severity || 'info'; // critical, high, medium, low, info
    this.user = data.user || null;
    this.source_ip = data.source_ip || null;
    this.destination_ip = data.destination_ip || null;
    this.source_port = data.source_port || null;
    this.destination_port = data.destination_port || null;
    this.protocol = data.protocol || null;
    this.action = data.action || '';
    this.outcome = data.outcome || 'unknown'; // success, failure, unknown
    this.normalized_fields = data.normalized_fields || {};
    this.raw_log = data.raw_log || '';
    this.correlations = data.correlations || [];
    this.alert_generated = data.alert_generated || false;
    this.alert_ids = data.alert_ids || [];
    this.enrichment_data = data.enrichment_data || {};
    this.tags = data.tags || [];
    this.created_at = data.created_at || new Date();
    this.indexed_at = data.indexed_at || new Date();
  }

  /**
   * Add correlation to another event
   */
  addCorrelation(eventId, correlationType, confidence) {
    this.correlations.push({
      event_id: eventId,
      type: correlationType,
      confidence: confidence,
      timestamp: new Date()
    });
  }

  /**
   * Enrich event with additional data
   */
  enrich(enrichmentData) {
    this.enrichment_data = {
      ...this.enrichment_data,
      ...enrichmentData,
      enriched_at: new Date()
    };
  }

  /**
   * Calculate event risk score
   */
  calculateRiskScore() {
    const severityScores = {
      critical: 10,
      high: 7,
      medium: 5,
      low: 3,
      info: 1
    };

    const baseScore = severityScores[this.severity] || 1;
    const outcomeMultiplier = this.outcome === 'success' ? 1.5 : 1.0;
    const correlationBonus = this.correlations.length * 0.5;

    return Math.min(10, baseScore * outcomeMultiplier + correlationBonus);
  }

  /**
   * Convert to plain object for storage/API
   */
  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      source: this.source,
      source_type: this.source_type,
      event_type: this.event_type,
      severity: this.severity,
      user: this.user,
      source_ip: this.source_ip,
      destination_ip: this.destination_ip,
      source_port: this.source_port,
      destination_port: this.destination_port,
      protocol: this.protocol,
      action: this.action,
      outcome: this.outcome,
      normalized_fields: this.normalized_fields,
      raw_log: this.raw_log,
      correlations: this.correlations,
      alert_generated: this.alert_generated,
      alert_ids: this.alert_ids,
      enrichment_data: this.enrichment_data,
      tags: this.tags,
      created_at: this.created_at,
      indexed_at: this.indexed_at,
      risk_score: this.calculateRiskScore()
    };
  }
}

module.exports = SecurityEvent;
