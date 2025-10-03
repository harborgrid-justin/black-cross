/**
 * Messaging Service
 * Handles secure chat and messaging functionality
 */

const Message = require('../models/Message');
const Workspace = require('../models/Workspace');
const logger = require('../utils/logger');
const { encrypt, generateKey } = require('../utils/encryption');

class MessagingService {
  /**
   * Send a message
   * @param {Object} messageData - Message data
   * @param {string} userId - User sending the message
   * @returns {Promise<Object>} Created message
   */
  async sendMessage(messageData, userId) {
    try {
      logger.info('Sending message', { channel: messageData.channel_id, sender: userId });

      // Encrypt message content if encryption is enabled
      let encryptedContent = messageData.content;
      let encryptionData = null;

      if (messageData.is_encrypted !== false) {
        const key = generateKey();
        const encrypted = encrypt(messageData.content, key);
        encryptedContent = encrypted.encrypted;
        encryptionData = {
          iv: encrypted.iv,
          authTag: encrypted.authTag,
          keyId: key.toString('base64'),
        };
      }

      const message = new Message({
        ...messageData,
        sender_id: messageData.sender_id || userId,
        content: encryptedContent,
        is_encrypted: messageData.is_encrypted !== false,
        encryption_key_id: encryptionData?.keyId,
      });

      await message.save();

      // Update workspace analytics
      await Workspace.updateOne(
        { id: messageData.workspace_id },
        {
          $inc: { 'analytics.message_count': 1 },
          $set: { 'analytics.last_activity_at': new Date() },
        },
      );

      logger.info('Message sent successfully', { id: message.id });

      // Return with original content for immediate display
      const result = message.toObject();
      result.content = messageData.content;
      return result;
    } catch (error) {
      logger.error('Error sending message', { error: error.message });
      throw error;
    }
  }

  /**
   * Get messages for a channel
   * @param {string} channelId - Channel ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Messages
   */
  async getMessages(channelId, options = {}) {
    try {
      const query = {
        channel_id: channelId,
        is_deleted: false,
      };

      if (options.thread_id) {
        query.thread_id = options.thread_id;
      }

      if (options.since) {
        query.created_at = { $gt: new Date(options.since) };
      }

      const messages = await Message.find(query)
        .sort({ created_at: options.order === 'asc' ? 1 : -1 })
        .limit(options.limit || 50);

      return messages;
    } catch (error) {
      logger.error('Error getting messages', { error: error.message });
      throw error;
    }
  }

  /**
   * Edit a message
   * @param {string} messageId - Message ID
   * @param {string} newContent - New content
   * @param {string} userId - User editing the message
   * @returns {Promise<Object>} Updated message
   */
  async editMessage(messageId, newContent, userId) {
    try {
      logger.info('Editing message', { messageId, userId });

      const message = await Message.findOne({ id: messageId });

      if (!message) {
        throw new Error('Message not found');
      }

      if (message.sender_id !== userId) {
        throw new Error('Cannot edit message from another user');
      }

      // Re-encrypt if message is encrypted
      if (message.is_encrypted) {
        const key = Buffer.from(message.encryption_key_id, 'base64');
        const encrypted = encrypt(newContent, key);
        message.content = encrypted.encrypted;
      } else {
        message.content = newContent;
      }

      message.is_edited = true;
      message.edited_at = new Date();

      await message.save();
      logger.info('Message edited successfully', { messageId });

      const result = message.toObject();
      result.content = newContent;
      return result;
    } catch (error) {
      logger.error('Error editing message', { error: error.message });
      throw error;
    }
  }

  /**
   * Delete a message
   * @param {string} messageId - Message ID
   * @param {string} userId - User deleting the message
   * @returns {Promise<Object>} Result
   */
  async deleteMessage(messageId, userId) {
    try {
      logger.info('Deleting message', { messageId, userId });

      const message = await Message.findOne({ id: messageId });

      if (!message) {
        throw new Error('Message not found');
      }

      if (message.sender_id !== userId) {
        throw new Error('Cannot delete message from another user');
      }

      message.is_deleted = true;
      message.deleted_at = new Date();
      await message.save();

      logger.info('Message deleted successfully', { messageId });
      return { success: true, message: 'Message deleted' };
    } catch (error) {
      logger.error('Error deleting message', { error: error.message });
      throw error;
    }
  }

  /**
   * Add reaction to message
   * @param {string} messageId - Message ID
   * @param {string} userId - User adding reaction
   * @param {string} emoji - Emoji reaction
   * @returns {Promise<Object>} Updated message
   */
  async addReaction(messageId, userId, emoji) {
    try {
      const message = await Message.findOne({ id: messageId });

      if (!message) {
        throw new Error('Message not found');
      }

      // Check if user already reacted with this emoji
      const existingReaction = message.reactions.find(
        (r) => r.user_id === userId && r.emoji === emoji,
      );

      if (existingReaction) {
        throw new Error('Reaction already exists');
      }

      message.reactions.push({
        user_id: userId,
        emoji,
        created_at: new Date(),
      });

      await message.save();
      return message;
    } catch (error) {
      logger.error('Error adding reaction', { error: error.message });
      throw error;
    }
  }

  /**
   * Mark message as read
   * @param {string} messageId - Message ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated message
   */
  async markAsRead(messageId, userId) {
    try {
      const message = await Message.findOne({ id: messageId });

      if (!message) {
        throw new Error('Message not found');
      }

      const alreadyRead = message.read_by.find((r) => r.user_id === userId);

      if (!alreadyRead) {
        message.read_by.push({
          user_id: userId,
          read_at: new Date(),
        });
        await message.save();
      }

      return message;
    } catch (error) {
      logger.error('Error marking message as read', { error: error.message });
      throw error;
    }
  }

  /**
   * Search messages
   * @param {string} workspaceId - Workspace ID
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async searchMessages(workspaceId, query, options = {}) {
    try {
      const searchQuery = {
        workspace_id: workspaceId,
        is_deleted: false,
        $text: { $search: query },
      };

      if (options.channel_id) {
        searchQuery.channel_id = options.channel_id;
      }

      if (options.sender_id) {
        searchQuery.sender_id = options.sender_id;
      }

      if (options.from_date) {
        searchQuery.created_at = { $gte: new Date(options.from_date) };
      }

      const messages = await Message.find(searchQuery)
        .sort({ created_at: -1 })
        .limit(options.limit || 50);

      return messages;
    } catch (error) {
      logger.error('Error searching messages', { error: error.message });
      throw error;
    }
  }

  /**
   * Get unread message count
   * @param {string} userId - User ID
   * @param {string} channelId - Channel ID (optional)
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount(userId, channelId = null) {
    try {
      const query = {
        is_deleted: false,
        'read_by.user_id': { $ne: userId },
        sender_id: { $ne: userId },
      };

      if (channelId) {
        query.channel_id = channelId;
      }

      const count = await Message.countDocuments(query);
      return count;
    } catch (error) {
      logger.error('Error getting unread count', { error: error.message });
      throw error;
    }
  }

  /**
   * Pin message
   * @param {string} messageId - Message ID
   * @returns {Promise<Object>} Updated message
   */
  async pinMessage(messageId) {
    try {
      const message = await Message.findOne({ id: messageId });

      if (!message) {
        throw new Error('Message not found');
      }

      message.pinned = true;
      await message.save();

      return message;
    } catch (error) {
      logger.error('Error pinning message', { error: error.message });
      throw error;
    }
  }

  /**
   * Get pinned messages for channel
   * @param {string} channelId - Channel ID
   * @returns {Promise<Array>} Pinned messages
   */
  async getPinnedMessages(channelId) {
    try {
      const messages = await Message.find({
        channel_id: channelId,
        pinned: true,
        is_deleted: false,
      }).sort({ created_at: -1 });

      return messages;
    } catch (error) {
      logger.error('Error getting pinned messages', { error: error.message });
      throw error;
    }
  }
}

module.exports = new MessagingService();
