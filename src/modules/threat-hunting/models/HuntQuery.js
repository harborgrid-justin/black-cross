/**
 * Hunt Query Model
 * Represents a threat hunting query
 */

class HuntQuery {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.query = data.query;
    this.queryLanguage = data.queryLanguage || 'sql';
    this.dataSources = data.dataSources || [];
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.executionCount = data.executionCount || 0;
    this.lastExecutedAt = data.lastExecutedAt;
    this.tags = data.tags || [];
    this.isTemplate = data.isTemplate || false;
    this.status = data.status || 'active';
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      query: this.query,
      queryLanguage: this.queryLanguage,
      dataSources: this.dataSources,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      executionCount: this.executionCount,
      lastExecutedAt: this.lastExecutedAt,
      tags: this.tags,
      isTemplate: this.isTemplate,
      status: this.status,
    };
  }

  static fromDatabase(row) {
    return new HuntQuery(row);
  }
}

module.exports = HuntQuery;
