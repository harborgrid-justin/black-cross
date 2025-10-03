/**
 * Secure Messaging Service
 * Business logic for messaging operations
 */

const { Message, Channel } = require('../models/Message');
const logger = require('../utils/logger');
const { encrypt, decrypt } = require('../utils/encryption');
const notificationService = require('./notificationService');

class MessageService {
  /**
   * Create a new channel
   */
  async createChannel(data, userId) {
    try {
      const channel = new Channel({
        ...data,
        members: data.members || [{ user_id: userId, role: 'owner' }],
      });

      await channel.save();

      logger.info('Channel created', { channel_id: channel.id, user_id: userId });
      return channel;
    } catch (error) {
      logger.error('Failed to create channel', { error: error.message, user_id: userId });
      throw error;
    }
  }

  /**
   * Get channel by ID
   */
  async getChannelById(channelId) {
    try {
      const channel = await Channel.findOne({ id: channelId });
      if (!channel) {
        throw new Error('Channel not found');
      }
      return channel;
    } catch (error) {
      logger.error('Failed to get channel', { error: error.message, channel_id: channelId });
      throw error;
    }
  }

  /**
   * List channels for user
   */
  async listChannels(userId, workspaceId) {
    try {
      const query = {
        workspace_id: workspaceId,
        'members.user_id': userId,
      };

      const channels = await Channel.find(query).sort({ updated_at: -1 });
      return channels;
    } catch (error) {
      logger.error('Failed to list channels', { error: error.message, user_id: userId });
      throw error;
    }
  }

  /**
   * Send message
   */
  async sendMessage(data, userId) {
    try {
      const channel = await this.getChannelById(data.channel_id);

      // Check if user is member of channel
      const isMember = channel.members.some((m) => m.user_id === userId);
      if (!isMember) {
        throw new Error('User is not a member of this channel');
      }

      // Encrypt message if enabled
      const { settings } = channel;
      const { encryption_enabled: encrypted } = settings;
      const { content: originalContent } = data;
      let content = originalContent;

      if (encrypted) {
        const encryptionKey = process.env.MESSAGE_ENCRYPTION_KEY || 'default-key';
        content = encrypt(data.content, encryptionKey);
      }

      const message = new Message({
        ...data,
        sender_id: userId,
        content,
        encrypted,
      });

      await message.save();

      // Send notifications to mentioned users
      if (data.mentions && data.mentions.length > 0) {
        await Promise.all(
          data.mentions.map((mentionedUserId) => notificationService.createNotification({
            user_id: mentionedUserId,
            type: 'mention',
            title: 'You were mentioned',
            message: `${userId} mentioned you in a message`,
            entity_type: 'message',
            entity_id: message.id,
            actor_id: userId,
          })),
        );
      }

      logger.info('Message sent', { message_id: message.id, channel_id: data.channel_id });
      return message;
    } catch (error) {
      logger.error('Failed to send message', { error: error.message, user_id: userId });
      throw error;
    }
  }

  /**
   * Get messages for channel
   */
  async getMessages(channelId, userId, options = {}) {
    try {
      const channel = await this.getChannelById(channelId);

      // Check if user is member of channel
      const isMember = channel.members.some((m) => m.user_id === userId);
      if (!isMember) {
        throw new Error('User is not a member of this channel');
      }

      const query = {
        channel_id: channelId,
        deleted: false,
      };

      if (options.thread_id) {
        query.thread_id = options.thread_id;
      }

      const messages = await Message.find(query)
        .sort({ created_at: -1 })
        .limit(options.limit || 50);

      // Decrypt messages if needed
      if (channel.settings.encryption_enabled) {
        const encryptionKey = process.env.MESSAGE_ENCRYPTION_KEY || 'default-key';
        messages.forEach((msg) => {
          const message = msg;
          if (message.encrypted) {
            try {
              message.content = decrypt(message.content, encryptionKey);
            } catch (decryptError) {
              logger.error('Failed to decrypt message', { message_id: message.id });
              message.content = '[Encrypted message - decryption failed]';
            }
          }
        });
      }

      return messages;
    } catch (error) {
      logger.error('Failed to get messages', { error: error.message, channel_id: channelId });
      throw error;
    }
  }

  /**
   * Update message
   */
  async updateMessage(messageId, content, userId) {
    try {
      const message = await Message.findOne({ id: messageId });
      if (!message) {
        throw new Error('Message not found');
      }

      if (message.sender_id !== userId) {
        throw new Error('Only message sender can edit the message');
      }

      const channel = await this.getChannelById(message.channel_id);
      let newContent = content;

      if (channel.settings.encryption_enabled) {
        const encryptionKey = process.env.MESSAGE_ENCRYPTION_KEY || 'default-key';
        newContent = encrypt(content, encryptionKey);
      }

      message.content = newContent;
      message.edited = true;
      message.edited_at = new Date();
      await message.save();

      logger.info('Message updated', { message_id: messageId, user_id: userId });
      return message;
    } catch (error) {
      logger.error('Failed to update message', { error: error.message, message_id: messageId });
      throw error;
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId, userId) {
    try {
      const message = await Message.findOne({ id: messageId });
      if (!message) {
        throw new Error('Message not found');
      }

      if (message.sender_id !== userId) {
        throw new Error('Only message sender can delete the message');
      }

      message.deleted = true;
      message.deleted_at = new Date();
      await message.save();

      logger.info('Message deleted', { message_id: messageId, user_id: userId });
      return message;
    } catch (error) {
      logger.error('Failed to delete message', { error: error.message, message_id: messageId });
      throw error;
    }
  }

  /**
   * Add reaction to message
   */
  async addReaction(messageId, emoji, userId) {
    try {
      const message = await Message.findOne({ id: messageId });
      if (!message) {
        throw new Error('Message not found');
      }

      // Check if user already reacted with this emoji
      const existingReaction = message.reactions.find(
        (r) => r.emoji === emoji && r.user_id === userId,
      );

      if (existingReaction) {
        throw new Error('User already reacted with this emoji');
      }

      message.reactions.push({ emoji, user_id: userId });
      await message.save();

      logger.info('Reaction added', { message_id: messageId, user_id: userId, emoji });
      return message;
    } catch (error) {
      logger.error('Failed to add reaction', { error: error.message, message_id: messageId });
      throw error;
    }
  }

  /**
   * Search messages
   */
  async searchMessages(query, userId, workspaceId) {
    try {
      // Get user's channels
      const channels = await this.listChannels(userId, workspaceId);
      const channelIds = channels.map((c) => c.id);

      const searchQuery = {
        channel_id: { $in: channelIds },
        deleted: false,
        $text: { $search: query },
      };

      const messages = await Message.find(searchQuery)
        .sort({ created_at: -1 })
        .limit(50);

      return messages;
    } catch (error) {
      logger.error('Failed to search messages', { error: error.message, user_id: userId });
      throw error;
    }
  }
}

module.exports = new MessageService();
