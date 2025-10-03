/**
 * ForensicSession Repository
 * 
 * Handles data persistence for forensic sessions
 */

const ForensicSession = require('../models/ForensicSession');

class ForensicSessionRepository {
  constructor() {
    this.sessions = new Map();
  }

  /**
   * Create new forensic session
   */
  async create(sessionData) {
    const session = new ForensicSession(sessionData);
    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Find session by ID
   */
  async findById(id) {
    return this.sessions.get(id) || null;
  }

  /**
   * Find all sessions
   */
  async findAll(filters = {}) {
    let sessions = Array.from(this.sessions.values());

    if (filters.status) {
      sessions = sessions.filter(s => s.status === filters.status);
    }

    if (filters.investigator) {
      sessions = sessions.filter(s => s.investigator === filters.investigator);
    }

    if (filters.incident_id) {
      sessions = sessions.filter(s => s.incident_id === filters.incident_id);
    }

    return sessions;
  }

  /**
   * Find sessions by investigator
   */
  async findByInvestigator(investigator) {
    return Array.from(this.sessions.values()).filter(s => s.investigator === investigator);
  }

  /**
   * Update session
   */
  async update(id, updates) {
    const session = this.sessions.get(id);
    if (!session) return null;

    Object.assign(session, updates);
    session.updated_at = new Date();
    this.sessions.set(id, session);
    return session;
  }

  /**
   * Delete session
   */
  async delete(id) {
    return this.sessions.delete(id);
  }

  /**
   * Clear all sessions (for testing)
   */
  async clear() {
    this.sessions.clear();
  }
}

module.exports = new ForensicSessionRepository();
