/**
 * Session Service
 * Business logic for collaborative hunting sessions (Feature 3.7)
 */

const HuntSession = require('../models/HuntSession');
const database = require('../models/database');

class SessionService {
  constructor() {
    this.activeSessions = new Map(); // Track real-time session data
  }

  /**
   * Create a new hunting session
   */
  async createSession(sessionData, userId) {
    const session = new HuntSession({
      ...sessionData,
      createdBy: userId,
      status: 'active',
      teamMembers: [userId],
      startedAt: new Date(),
    });

    const saved = await database.saveSession(session.toJSON());
    this.activeSessions.set(saved.id, {
      connectedUsers: new Set([userId]),
      lastActivity: new Date(),
    });

    return HuntSession.fromDatabase(saved);
  }

  /**
   * Get a session by ID
   */
  async getSession(sessionId) {
    const session = await database.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    return HuntSession.fromDatabase(session);
  }

  /**
   * List sessions
   */
  async listSessions(filters = {}) {
    const sessions = await database.listSessions(filters);
    return sessions.map((s) => HuntSession.fromDatabase(s));
  }

  /**
   * Join a session
   */
  async joinSession(sessionId, userId) {
    const session = await database.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status !== 'active') {
      throw new Error('Session is not active');
    }

    const teamMembers = session.teamMembers || [];
    if (!teamMembers.includes(userId)) {
      teamMembers.push(userId);
    }

    // Update active session tracking
    const activeSession = this.activeSessions.get(sessionId) || {
      connectedUsers: new Set(),
      lastActivity: new Date(),
    };
    activeSession.connectedUsers.add(userId);
    this.activeSessions.set(sessionId, activeSession);

    const updated = await database.updateSession(sessionId, {
      teamMembers,
    });

    return HuntSession.fromDatabase(updated);
  }

  /**
   * Leave a session
   */
  async leaveSession(sessionId, userId) {
    const session = await database.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Update active session tracking
    const activeSession = this.activeSessions.get(sessionId);
    if (activeSession) {
      activeSession.connectedUsers.delete(userId);
    }

    return {
      sessionId,
      userId,
      leftAt: new Date(),
    };
  }

  /**
   * Share a query in session
   */
  async shareQuery(sessionId, queryData, userId) {
    const session = await database.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.teamMembers.includes(userId)) {
      throw new Error('User is not a member of this session');
    }

    const sharedQueries = session.sharedQueries || [];
    sharedQueries.push({
      query: queryData,
      sharedBy: userId,
      sharedAt: new Date(),
    });

    const updated = await database.updateSession(sessionId, {
      sharedQueries,
    });

    // Broadcast to connected users
    this.broadcastToSession(sessionId, {
      type: 'query_shared',
      query: queryData,
      sharedBy: userId,
    });

    return HuntSession.fromDatabase(updated);
  }

  /**
   * Add annotation to session
   */
  async addAnnotation(sessionId, annotation, userId) {
    const session = await database.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.teamMembers.includes(userId)) {
      throw new Error('User is not a member of this session');
    }

    const annotations = session.annotations || [];
    annotations.push({
      ...annotation,
      createdBy: userId,
      createdAt: new Date(),
    });

    await database.updateSession(sessionId, {
      annotations,
    });

    return { success: true, annotation };
  }

  /**
   * Send chat message in session
   */
  async sendChatMessage(sessionId, message, userId) {
    const session = await database.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.teamMembers.includes(userId)) {
      throw new Error('User is not a member of this session');
    }

    const chatMessages = session.chatMessages || [];
    const chatMessage = {
      message,
      sentBy: userId,
      sentAt: new Date(),
    };
    chatMessages.push(chatMessage);

    await database.updateSession(sessionId, {
      chatMessages,
    });

    // Broadcast to connected users
    this.broadcastToSession(sessionId, {
      type: 'chat_message',
      ...chatMessage,
    });

    return chatMessage;
  }

  /**
   * Record session activity
   */
  async recordActivity(sessionId, activity, userId) {
    const session = await database.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const recording = session.recording || [];
    recording.push({
      ...activity,
      userId,
      timestamp: new Date(),
    });

    await database.updateSession(sessionId, {
      recording,
    });

    return activity;
  }

  /**
   * Complete a session
   */
  async completeSession(sessionId, userId) {
    const session = await database.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.createdBy !== userId) {
      throw new Error('Only the session creator can complete the session');
    }

    const updated = await database.updateSession(sessionId, {
      status: 'completed',
      completedAt: new Date(),
    });

    // Clean up active session tracking
    this.activeSessions.delete(sessionId);

    return HuntSession.fromDatabase(updated);
  }

  /**
   * Get session statistics
   */
  async getSessionStatistics(sessionId) {
    const session = await database.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const duration = session.completedAt
      ? new Date(session.completedAt) - new Date(session.startedAt)
      : new Date() - new Date(session.startedAt);

    const stats = {
      sessionId,
      duration: Math.round(duration / 1000), // seconds
      teamMemberCount: session.teamMembers?.length || 0,
      queriesExecuted: session.queriesExecuted?.length || 0,
      findingsCount: session.findings?.length || 0,
      sharedQueriesCount: session.sharedQueries?.length || 0,
      annotationsCount: session.annotations?.length || 0,
      chatMessagesCount: session.chatMessages?.length || 0,
      status: session.status,
    };

    return stats;
  }

  /**
   * Get active participants in session
   */
  getActiveParticipants(sessionId) {
    const activeSession = this.activeSessions.get(sessionId);
    if (!activeSession) {
      return [];
    }

    return Array.from(activeSession.connectedUsers);
  }

  /**
   * Replay session recording
   */
  async replaySession(sessionId) {
    const session = await database.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    return {
      sessionId,
      recording: session.recording || [],
      duration: session.completedAt
        ? new Date(session.completedAt) - new Date(session.startedAt)
        : null,
      teamMembers: session.teamMembers,
    };
  }

  /**
   * Export session data
   */
  async exportSession(sessionId, format = 'json') {
    const session = await database.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const sessionObj = HuntSession.fromDatabase(session);
    const stats = await this.getSessionStatistics(sessionId);

    const exportData = {
      ...sessionObj.toJSON(),
      statistics: stats,
      exportedAt: new Date(),
    };

    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(exportData, null, 2);
      case 'summary':
        return this.generateSessionSummary(exportData);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Generate session summary
   */
  generateSessionSummary(sessionData) {
    return `# Hunt Session Summary

## Session Details
- **ID:** ${sessionData.id}
- **Name:** ${sessionData.name}
- **Status:** ${sessionData.status}
- **Created:** ${sessionData.createdAt}
- **Completed:** ${sessionData.completedAt || 'In Progress'}

## Hypothesis
${sessionData.hypothesis}

## Team
- **Members:** ${sessionData.teamMembers.length}
- **Created By:** ${sessionData.createdBy}

## Activity Summary
- **Queries Executed:** ${sessionData.statistics.queriesExecuted}
- **Findings:** ${sessionData.statistics.findingsCount}
- **Shared Queries:** ${sessionData.statistics.sharedQueriesCount}
- **Annotations:** ${sessionData.statistics.annotationsCount}
- **Chat Messages:** ${sessionData.statistics.chatMessagesCount}

## Duration
${Math.round(sessionData.statistics.duration / 60)} minutes

## Notes
${sessionData.notes}
`;
  }

  /**
   * Broadcast message to all session participants (simulated)
   */
  broadcastToSession(sessionId, message) {
    const activeSession = this.activeSessions.get(sessionId);
    if (activeSession) {
      // In production, this would use WebSocket connections
      console.log(`Broadcasting to session ${sessionId}:`, message);
    }
  }
}

module.exports = new SessionService();
