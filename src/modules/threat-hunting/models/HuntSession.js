/**
 * Hunt Session Model
 * Represents a collaborative threat hunting session
 */

class HuntSession {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.hypothesis = data.hypothesis;
    this.hypothesisId = data.hypothesisId;
    this.status = data.status || 'active';
    this.createdBy = data.createdBy;
    this.teamMembers = data.teamMembers || [];
    this.createdAt = data.createdAt || new Date();
    this.startedAt = data.startedAt;
    this.completedAt = data.completedAt;
    this.queriesExecuted = data.queriesExecuted || [];
    this.findings = data.findings || [];
    this.notes = data.notes || '';
    this.annotations = data.annotations || [];
    this.sharedQueries = data.sharedQueries || [];
    this.chatMessages = data.chatMessages || [];
    this.recording = data.recording || [];
    this.tags = data.tags || [];
    this.metadata = data.metadata || {};
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      hypothesis: this.hypothesis,
      hypothesisId: this.hypothesisId,
      status: this.status,
      createdBy: this.createdBy,
      teamMembers: this.teamMembers,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      queriesExecuted: this.queriesExecuted,
      findings: this.findings,
      notes: this.notes,
      annotations: this.annotations,
      sharedQueries: this.sharedQueries,
      chatMessages: this.chatMessages,
      recording: this.recording,
      tags: this.tags,
      metadata: this.metadata,
    };
  }

  static fromDatabase(row) {
    return new HuntSession(row);
  }
}

module.exports = HuntSession;
