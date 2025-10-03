/**
 * Behavior Analysis Model
 * Represents behavior analysis results for entities
 */

class BehaviorAnalysis {
  constructor(data) {
    this.id = data.id;
    this.entityId = data.entityId;
    this.entityType = data.entityType;
    this.analysisType = data.analysisType || 'user';
    this.baselineBehavior = data.baselineBehavior || {};
    this.currentBehavior = data.currentBehavior || {};
    this.anomalyScore = data.anomalyScore || 0;
    this.riskScore = data.riskScore || 0;
    this.deviations = data.deviations || [];
    this.peerComparison = data.peerComparison || {};
    this.temporalAnalysis = data.temporalAnalysis || {};
    this.analyzedAt = data.analyzedAt || new Date();
    this.analysisWindow = data.analysisWindow || '30d';
    this.status = data.status || 'completed';
    this.flags = data.flags || [];
  }

  toJSON() {
    return {
      id: this.id,
      entityId: this.entityId,
      entityType: this.entityType,
      analysisType: this.analysisType,
      baselineBehavior: this.baselineBehavior,
      currentBehavior: this.currentBehavior,
      anomalyScore: this.anomalyScore,
      riskScore: this.riskScore,
      deviations: this.deviations,
      peerComparison: this.peerComparison,
      temporalAnalysis: this.temporalAnalysis,
      analyzedAt: this.analyzedAt,
      analysisWindow: this.analysisWindow,
      status: this.status,
      flags: this.flags,
    };
  }

  static fromDatabase(row) {
    return new BehaviorAnalysis(row);
  }
}

module.exports = BehaviorAnalysis;
