/**
 * Collaboration Service
 * Handles real-time collaboration sessions
 */

const CollaborationSession = require('../models/CollaborationSession');
const logger = require('../utils/logger');

class CollaborationService {
  /**
   * Start a collaboration session
   * @param {Object} sessionData - Session data
   * @param {string} userId - User starting the session
   * @returns {Promise<Object>} Created session
   */
  async startSession(sessionData, userId) {
    try {
      logger.info('Starting collaboration session', {
        workspace: sessionData.workspace_id,
        resource: sessionData.resource_id,
      });

      const session = new CollaborationSession({
        ...sessionData,
        participants: [
          {
            user_id: userId,
            joined_at: new Date(),
            is_active: true,
          },
        ],
        status: 'active',
      });

      await session.save();
      logger.info('Collaboration session started', { id: session.id });

      return session;
    } catch (error) {
      logger.error('Error starting session', { error: error.message });
      throw error;
    }
  }

  /**
   * Join a collaboration session
   * @param {string} sessionId - Session ID
   * @param {string} userId - User joining
   * @returns {Promise<Object>} Updated session
   */
  async joinSession(sessionId, userId) {
    try {
      logger.info('User joining session', { sessionId, userId });

      const session = await CollaborationSession.findOne({ id: sessionId });

      if (!session) {
        throw new Error('Session not found');
      }

      if (session.status !== 'active') {
        throw new Error('Session is not active');
      }

      // Check if user is already a participant
      const existingParticipant = session.participants.find((p) => p.user_id === userId && p.is_active);
      if (existingParticipant) {
        return session;
      }

      session.participants.push({
        user_id: userId,
        joined_at: new Date(),
        is_active: true,
      });

      session.metadata.last_activity_at = new Date();
      await session.save();

      logger.info('User joined session', { sessionId, userId });
      return session;
    } catch (error) {
      logger.error('Error joining session', { error: error.message });
      throw error;
    }
  }

  /**
   * Leave a collaboration session
   * @param {string} sessionId - Session ID
   * @param {string} userId - User leaving
   * @returns {Promise<Object>} Updated session
   */
  async leaveSession(sessionId, userId) {
    try {
      logger.info('User leaving session', { sessionId, userId });

      const session = await CollaborationSession.findOne({ id: sessionId });

      if (!session) {
        throw new Error('Session not found');
      }

      const participant = session.participants.find((p) => p.user_id === userId && p.is_active);
      if (participant) {
        participant.is_active = false;
        participant.left_at = new Date();
      }

      // Check if all participants have left
      const activeParticipants = session.participants.filter((p) => p.is_active);
      if (activeParticipants.length === 0) {
        session.status = 'ended';
        session.ended_at = new Date();
      }

      await session.save();
      logger.info('User left session', { sessionId, userId });

      return session;
    } catch (error) {
      logger.error('Error leaving session', { error: error.message });
      throw error;
    }
  }

  /**
   * End a collaboration session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Ended session
   */
  async endSession(sessionId) {
    try {
      logger.info('Ending collaboration session', { sessionId });

      const session = await CollaborationSession.findOne({ id: sessionId });

      if (!session) {
        throw new Error('Session not found');
      }

      session.status = 'ended';
      session.ended_at = new Date();

      // Mark all participants as inactive
      session.participants.forEach((participant) => {
        const p = participant;
        if (p.is_active) {
          p.is_active = false;
          p.left_at = new Date();
        }
      });

      await session.save();
      logger.info('Collaboration session ended', { sessionId });

      return session;
    } catch (error) {
      logger.error('Error ending session', { error: error.message });
      throw error;
    }
  }

  /**
   * Update participant cursor position
   * @param {string} sessionId - Session ID
   * @param {string} userId - User ID
   * @param {Object} cursorPosition - Cursor position data
   * @returns {Promise<Object>} Updated session
   */
  async updateCursor(sessionId, userId, cursorPosition) {
    try {
      const session = await CollaborationSession.findOne({ id: sessionId });

      if (!session) {
        throw new Error('Session not found');
      }

      const participant = session.participants.find((p) => p.user_id === userId && p.is_active);
      if (participant) {
        participant.cursor_position = cursorPosition;
        session.metadata.last_activity_at = new Date();
        await session.save();
      }

      return session;
    } catch (error) {
      logger.error('Error updating cursor', { error: error.message });
      throw error;
    }
  }

  /**
   * Record a change in the session
   * @param {string} sessionId - Session ID
   * @param {string} userId - User ID
   * @param {string} operation - Operation type
   * @param {Object} data - Change data
   * @returns {Promise<Object>} Updated session
   */
  async recordChange(sessionId, userId, operation, data) {
    try {
      const session = await CollaborationSession.findOne({ id: sessionId });

      if (!session) {
        throw new Error('Session not found');
      }

      session.changes.push({
        user_id: userId,
        timestamp: new Date(),
        operation,
        data,
      });

      session.metadata.last_activity_at = new Date();
      await session.save();

      return session;
    } catch (error) {
      logger.error('Error recording change', { error: error.message });
      throw error;
    }
  }

  /**
   * Get active sessions for a workspace
   * @param {string} workspaceId - Workspace ID
   * @returns {Promise<Array>} Active sessions
   */
  async getActiveSessions(workspaceId) {
    try {
      const sessions = await CollaborationSession.find({
        workspace_id: workspaceId,
        status: 'active',
      }).sort({ created_at: -1 });

      return sessions;
    } catch (error) {
      logger.error('Error getting active sessions', { error: error.message });
      throw error;
    }
  }

  /**
   * Get session by ID
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Session
   */
  async getSession(sessionId) {
    try {
      const session = await CollaborationSession.findOne({ id: sessionId });

      if (!session) {
        throw new Error('Session not found');
      }

      return session;
    } catch (error) {
      logger.error('Error getting session', { error: error.message });
      throw error;
    }
  }

  /**
   * Get sessions for a resource
   * @param {string} resourceType - Resource type
   * @param {string} resourceId - Resource ID
   * @returns {Promise<Array>} Sessions
   */
  async getResourceSessions(resourceType, resourceId) {
    try {
      const sessions = await CollaborationSession.find({
        resource_type: resourceType,
        resource_id: resourceId,
      }).sort({ created_at: -1 }).limit(10);

      return sessions;
    } catch (error) {
      logger.error('Error getting resource sessions', { error: error.message });
      throw error;
    }
  }

  /**
   * Get active participants in a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Array>} Active participants
   */
  async getActiveParticipants(sessionId) {
    try {
      const session = await CollaborationSession.findOne({ id: sessionId });

      if (!session) {
        throw new Error('Session not found');
      }

      const activeParticipants = session.participants.filter((p) => p.is_active);
      return activeParticipants;
    } catch (error) {
      logger.error('Error getting active participants', { error: error.message });
      throw error;
    }
  }
}

module.exports = new CollaborationService();
