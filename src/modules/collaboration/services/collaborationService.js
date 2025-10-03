/**
 * Real-Time Collaboration Service
 * Business logic for real-time collaboration sessions
 */

const CollaborationSession = require('../models/CollaborationSession');
const logger = require('../utils/logger');

class CollaborationService {
  /**
   * Create or join collaboration session
   */
  async joinSession(entityType, entityId, userId, workspaceId, socketId) {
    try {
      let session = await CollaborationSession.findOne({
        entity_type: entityType,
        entity_id: entityId,
        status: 'active',
      });

      if (!session) {
        // Create new session
        session = new CollaborationSession({
          entity_type: entityType,
          entity_id: entityId,
          workspace_id: workspaceId,
          participants: [],
        });
      }

      // Check if user is already in session
      const existingParticipant = session.participants.find((p) => p.user_id === userId);

      if (existingParticipant) {
        // Update socket ID and last active
        existingParticipant.socket_id = socketId;
        existingParticipant.last_active = new Date();
      } else {
        // Add new participant
        session.participants.push({
          user_id: userId,
          socket_id: socketId,
        });
      }

      await session.save();

      logger.info('User joined collaboration session', {
        session_id: session.id,
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
      });

      return session;
    } catch (error) {
      logger.error('Failed to join collaboration session', {
        error: error.message,
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
      });
      throw error;
    }
  }

  /**
   * Leave collaboration session
   */
  async leaveSession(sessionId, userId) {
    try {
      const session = await CollaborationSession.findOne({ id: sessionId });
      if (!session) {
        throw new Error('Session not found');
      }

      session.participants = session.participants.filter((p) => p.user_id !== userId);

      // End session if no participants left
      if (session.participants.length === 0) {
        session.status = 'ended';
      }

      await session.save();

      logger.info('User left collaboration session', { session_id: sessionId, user_id: userId });
      return session;
    } catch (error) {
      logger.error('Failed to leave collaboration session', {
        error: error.message,
        session_id: sessionId,
        user_id: userId,
      });
      throw error;
    }
  }

  /**
   * Update participant cursor position
   */
  async updateCursor(sessionId, userId, cursorPosition) {
    try {
      const session = await CollaborationSession.findOne({ id: sessionId });
      if (!session) {
        throw new Error('Session not found');
      }

      const participant = session.participants.find((p) => p.user_id === userId);
      if (!participant) {
        throw new Error('User not in session');
      }

      participant.cursor_position = cursorPosition;
      participant.last_active = new Date();
      await session.save();

      return session;
    } catch (error) {
      logger.error('Failed to update cursor position', {
        error: error.message,
        session_id: sessionId,
        user_id: userId,
      });
      throw error;
    }
  }

  /**
   * Update participant selection
   */
  async updateSelection(sessionId, userId, selection) {
    try {
      const session = await CollaborationSession.findOne({ id: sessionId });
      if (!session) {
        throw new Error('Session not found');
      }

      const participant = session.participants.find((p) => p.user_id === userId);
      if (!participant) {
        throw new Error('User not in session');
      }

      participant.selection = selection;
      participant.last_active = new Date();
      await session.save();

      return session;
    } catch (error) {
      logger.error('Failed to update selection', {
        error: error.message,
        session_id: sessionId,
        user_id: userId,
      });
      throw error;
    }
  }

  /**
   * Get active session for entity
   */
  async getActiveSession(entityType, entityId) {
    try {
      const session = await CollaborationSession.findOne({
        entity_type: entityType,
        entity_id: entityId,
        status: 'active',
      });

      return session;
    } catch (error) {
      logger.error('Failed to get active session', {
        error: error.message,
        entity_type: entityType,
        entity_id: entityId,
      });
      throw error;
    }
  }

  /**
   * List active sessions for workspace
   */
  async listSessions(workspaceId) {
    try {
      const sessions = await CollaborationSession.find({
        workspace_id: workspaceId,
        status: 'active',
      }).sort({ updated_at: -1 });

      return sessions;
    } catch (error) {
      logger.error('Failed to list sessions', { error: error.message, workspace_id: workspaceId });
      throw error;
    }
  }

  /**
   * Clean up inactive sessions
   */
  async cleanupInactiveSessions(inactiveMinutes = 30) {
    try {
      const cutoffTime = new Date();
      cutoffTime.setMinutes(cutoffTime.getMinutes() - inactiveMinutes);

      const sessions = await CollaborationSession.find({
        status: 'active',
        updated_at: { $lt: cutoffTime },
      });

      const updates = sessions.map(async (session) => {
        // Remove inactive participants
        const updatedSession = session;
        updatedSession.participants = session.participants.filter((p) => p.last_active > cutoffTime);

        if (updatedSession.participants.length === 0) {
          updatedSession.status = 'ended';
        }

        return updatedSession.save();
      });

      await Promise.all(updates);

      logger.info('Inactive sessions cleaned up', { count: sessions.length });
      return sessions.length;
    } catch (error) {
      logger.error('Failed to cleanup inactive sessions', { error: error.message });
      throw error;
    }
  }
}

module.exports = new CollaborationService();
