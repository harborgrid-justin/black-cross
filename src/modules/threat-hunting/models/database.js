/**
 * Database Layer for Threat Hunting
 * In-memory storage for demonstration (replace with actual database in production)
 */

const { v4: uuidv4 } = require('uuid');

class ThreatHuntingDatabase {
  constructor() {
    this.queries = new Map();
    this.hypotheses = new Map();
    this.playbooks = new Map();
    this.behaviorAnalyses = new Map();
    this.patterns = new Map();
    this.findings = new Map();
    this.sessions = new Map();
  }

  // Query operations
  async saveQuery(query) {
    const id = query.id || uuidv4();
    const queryData = { ...query, id, updatedAt: new Date() };
    this.queries.set(id, queryData);
    return queryData;
  }

  async getQuery(id) {
    return this.queries.get(id);
  }

  async listQueries(filters = {}) {
    const queries = Array.from(this.queries.values());
    return this.applyFilters(queries, filters);
  }

  async updateQuery(id, updates) {
    const existing = this.queries.get(id);
    if (!existing) {
      throw new Error('Query not found');
    }
    const updated = {
      ...existing, ...updates, id, updatedAt: new Date(),
    };
    this.queries.set(id, updated);
    return updated;
  }

  async deleteQuery(id) {
    return this.queries.delete(id);
  }

  // Hypothesis operations
  async saveHypothesis(hypothesis) {
    const id = hypothesis.id || uuidv4();
    const hypothesisData = { ...hypothesis, id, updatedAt: new Date() };
    this.hypotheses.set(id, hypothesisData);
    return hypothesisData;
  }

  async getHypothesis(id) {
    return this.hypotheses.get(id);
  }

  async listHypotheses(filters = {}) {
    const hypotheses = Array.from(this.hypotheses.values());
    return this.applyFilters(hypotheses, filters);
  }

  async updateHypothesis(id, updates) {
    const existing = this.hypotheses.get(id);
    if (!existing) {
      throw new Error('Hypothesis not found');
    }
    const updated = {
      ...existing, ...updates, id, updatedAt: new Date(),
    };
    this.hypotheses.set(id, updated);
    return updated;
  }

  async deleteHypothesis(id) {
    return this.hypotheses.delete(id);
  }

  // Playbook operations
  async savePlaybook(playbook) {
    const id = playbook.id || uuidv4();
    const playbookData = { ...playbook, id, updatedAt: new Date() };
    this.playbooks.set(id, playbookData);
    return playbookData;
  }

  async getPlaybook(id) {
    return this.playbooks.get(id);
  }

  async listPlaybooks(filters = {}) {
    const playbooks = Array.from(this.playbooks.values());
    return this.applyFilters(playbooks, filters);
  }

  async updatePlaybook(id, updates) {
    const existing = this.playbooks.get(id);
    if (!existing) {
      throw new Error('Playbook not found');
    }
    const updated = {
      ...existing, ...updates, id, updatedAt: new Date(),
    };
    this.playbooks.set(id, updated);
    return updated;
  }

  async deletePlaybook(id) {
    return this.playbooks.delete(id);
  }

  // Behavior Analysis operations
  async saveBehaviorAnalysis(analysis) {
    const id = analysis.id || uuidv4();
    const analysisData = { ...analysis, id };
    this.behaviorAnalyses.set(id, analysisData);
    return analysisData;
  }

  async getBehaviorAnalysis(id) {
    return this.behaviorAnalyses.get(id);
  }

  async listBehaviorAnalyses(filters = {}) {
    const analyses = Array.from(this.behaviorAnalyses.values());
    return this.applyFilters(analyses, filters);
  }

  // Pattern operations
  async savePattern(pattern) {
    const id = pattern.id || uuidv4();
    const patternData = { ...pattern, id };
    this.patterns.set(id, patternData);
    return patternData;
  }

  async getPattern(id) {
    return this.patterns.get(id);
  }

  async listPatterns(filters = {}) {
    const patterns = Array.from(this.patterns.values());
    return this.applyFilters(patterns, filters);
  }

  async updatePattern(id, updates) {
    const existing = this.patterns.get(id);
    if (!existing) {
      throw new Error('Pattern not found');
    }
    const updated = { ...existing, ...updates, id };
    this.patterns.set(id, updated);
    return updated;
  }

  // Finding operations
  async saveFinding(finding) {
    const id = finding.id || uuidv4();
    const findingData = { ...finding, id, updatedAt: new Date() };
    this.findings.set(id, findingData);
    return findingData;
  }

  async getFinding(id) {
    return this.findings.get(id);
  }

  async listFindings(filters = {}) {
    const findings = Array.from(this.findings.values());
    return this.applyFilters(findings, filters);
  }

  async updateFinding(id, updates) {
    const existing = this.findings.get(id);
    if (!existing) {
      throw new Error('Finding not found');
    }
    const updated = {
      ...existing, ...updates, id, updatedAt: new Date(),
    };
    this.findings.set(id, updated);
    return updated;
  }

  async deleteFinding(id) {
    return this.findings.delete(id);
  }

  // Session operations
  async saveSession(session) {
    const id = session.id || uuidv4();
    const sessionData = { ...session, id };
    this.sessions.set(id, sessionData);
    return sessionData;
  }

  async getSession(id) {
    return this.sessions.get(id);
  }

  async listSessions(filters = {}) {
    const sessions = Array.from(this.sessions.values());
    return this.applyFilters(sessions, filters);
  }

  async updateSession(id, updates) {
    const existing = this.sessions.get(id);
    if (!existing) {
      throw new Error('Session not found');
    }
    const updated = { ...existing, ...updates, id };
    this.sessions.set(id, updated);
    return updated;
  }

  async deleteSession(id) {
    return this.sessions.delete(id);
  }

  // Helper method for filtering
  applyFilters(items, filters) {
    let filtered = [...items];

    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    if (filters.severity) {
      filtered = filtered.filter((item) => item.severity === filters.severity);
    }

    if (filters.createdBy) {
      filtered = filtered.filter((item) => item.createdBy === filters.createdBy);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((item) => item.tags
        && item.tags.some((tag) => filters.tags.includes(tag)));
    }

    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  // Clear all data (for testing)
  async clearAll() {
    this.queries.clear();
    this.hypotheses.clear();
    this.playbooks.clear();
    this.behaviorAnalyses.clear();
    this.patterns.clear();
    this.findings.clear();
    this.sessions.clear();
  }
}

const database = new ThreatHuntingDatabase();

module.exports = database;
