/**
 * Finding Model
 * Represents a threat hunting finding/result
 */

class Finding {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.severity = data.severity || 'medium';
    this.status = data.status || 'new';
    this.category = data.category;
    this.sessionId = data.sessionId;
    this.queryId = data.queryId;
    this.discoveredBy = data.discoveredBy;
    this.discoveredAt = data.discoveredAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.evidence = data.evidence || [];
    this.affectedAssets = data.affectedAssets || [];
    this.recommendedActions = data.recommendedActions || [];
    this.relatedIncidents = data.relatedIncidents || [];
    this.relatedThreats = data.relatedThreats || [];
    this.mitreTactics = data.mitreTactics || [];
    this.mitreIds = data.mitreIds || [];
    this.tags = data.tags || [];
    this.assignedTo = data.assignedTo;
    this.convertedToIncident = data.convertedToIncident || false;
    this.incidentId = data.incidentId;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      severity: this.severity,
      status: this.status,
      category: this.category,
      sessionId: this.sessionId,
      queryId: this.queryId,
      discoveredBy: this.discoveredBy,
      discoveredAt: this.discoveredAt,
      updatedAt: this.updatedAt,
      evidence: this.evidence,
      affectedAssets: this.affectedAssets,
      recommendedActions: this.recommendedActions,
      relatedIncidents: this.relatedIncidents,
      relatedThreats: this.relatedThreats,
      mitreTactics: this.mitreTactics,
      mitreIds: this.mitreIds,
      tags: this.tags,
      assignedTo: this.assignedTo,
      convertedToIncident: this.convertedToIncident,
      incidentId: this.incidentId,
    };
  }

  static fromDatabase(row) {
    return new Finding(row);
  }
}

module.exports = Finding;
