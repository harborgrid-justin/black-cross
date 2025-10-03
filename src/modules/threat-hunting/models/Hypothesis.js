/**
 * Hypothesis Model
 * Represents a threat hunting hypothesis
 */

class Hypothesis {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.hypothesis = data.hypothesis;
    this.version = data.version || 1;
    this.status = data.status || 'draft';
    this.validationStatus = data.validationStatus || 'pending';
    this.createdBy = data.createdBy;
    this.collaborators = data.collaborators || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.validatedAt = data.validatedAt;
    this.relatedQueries = data.relatedQueries || [];
    this.successMetrics = data.successMetrics || {};
    this.tags = data.tags || [];
    this.references = data.references || [];
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      hypothesis: this.hypothesis,
      version: this.version,
      status: this.status,
      validationStatus: this.validationStatus,
      createdBy: this.createdBy,
      collaborators: this.collaborators,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      validatedAt: this.validatedAt,
      relatedQueries: this.relatedQueries,
      successMetrics: this.successMetrics,
      tags: this.tags,
      references: this.references,
    };
  }

  static fromDatabase(row) {
    return new Hypothesis(row);
  }
}

module.exports = Hypothesis;
