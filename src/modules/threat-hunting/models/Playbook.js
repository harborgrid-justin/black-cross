/**
 * Playbook Model
 * Represents an automated threat hunting playbook
 */

class Playbook {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.category = data.category || 'general';
    this.steps = data.steps || [];
    this.schedule = data.schedule;
    this.enabled = data.enabled !== undefined ? data.enabled : true;
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.lastExecutedAt = data.lastExecutedAt;
    this.executionCount = data.executionCount || 0;
    this.successCount = data.successCount || 0;
    this.failureCount = data.failureCount || 0;
    this.effectivenessScore = data.effectivenessScore || 0;
    this.tags = data.tags || [];
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      steps: this.steps,
      schedule: this.schedule,
      enabled: this.enabled,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastExecutedAt: this.lastExecutedAt,
      executionCount: this.executionCount,
      successCount: this.successCount,
      failureCount: this.failureCount,
      effectivenessScore: this.effectivenessScore,
      tags: this.tags,
    };
  }

  static fromDatabase(row) {
    return new Playbook(row);
  }
}

module.exports = Playbook;
