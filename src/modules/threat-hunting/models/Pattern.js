/**
 * Pattern Model
 * Represents a detected pattern or anomaly
 */

class Pattern {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.patternType = data.patternType || 'anomaly';
    this.algorithm = data.algorithm || 'statistical';
    this.confidence = data.confidence || 0;
    this.severity = data.severity || 'medium';
    this.detectionCriteria = data.detectionCriteria || {};
    this.matchedEvents = data.matchedEvents || [];
    this.detectedAt = data.detectedAt || new Date();
    this.status = data.status || 'new';
    this.falsePositive = data.falsePositive || false;
    this.evolutionHistory = data.evolutionHistory || [];
    this.relatedPatterns = data.relatedPatterns || [];
    this.mitreTactics = data.mitreTactics || [];
    this.mitreIds = data.mitreIds || [];
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      patternType: this.patternType,
      algorithm: this.algorithm,
      confidence: this.confidence,
      severity: this.severity,
      detectionCriteria: this.detectionCriteria,
      matchedEvents: this.matchedEvents,
      detectedAt: this.detectedAt,
      status: this.status,
      falsePositive: this.falsePositive,
      evolutionHistory: this.evolutionHistory,
      relatedPatterns: this.relatedPatterns,
      mitreTactics: this.mitreTactics,
      mitreIds: this.mitreIds,
    };
  }

  static fromDatabase(row) {
    return new Pattern(row);
  }
}

module.exports = Pattern;
