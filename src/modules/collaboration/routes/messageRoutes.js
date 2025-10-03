/**
 * Message Routes
 */

const express = require('express');
const messageController = require('../controllers/messageController');
const {
  channelSchema,
  messageSchema,
  updateMessageSchema,
  reactionSchema,
} = require('../validators/messageValidator');

const router = express.Router();

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }
  next();
};

router.post('/messages/channels', validate(channelSchema), messageController.createChannel);
router.get('/messages/channels', messageController.listChannels);
router.get('/messages/channels/:id', messageController.getChannel);
router.post('/messages', validate(messageSchema), messageController.sendMessage);
router.get('/messages/channels/:channelId/messages', messageController.getMessages);
router.put('/messages/:id', validate(updateMessageSchema), messageController.updateMessage);
router.delete('/messages/:id', messageController.deleteMessage);
router.post('/messages/:id/reactions', validate(reactionSchema), messageController.addReaction);
router.get('/messages/search', messageController.searchMessages);

module.exports = router;
